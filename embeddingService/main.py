import os
from typing import List
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from transformers import AutoTokenizer
import onnxruntime as ort
import numpy as np
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Recommendation Engine - Embedding Service")

MODEL_NAME = os.getenv("MODEL_NAME", "all-MiniLM-L6-v2")
# ONNX export baked into the image at build time (see Dockerfile's
# `exporter` stage) - the running container never talks to HF Hub.
ONNX_CACHE_DIR = os.getenv("ONNX_CACHE_DIR", "/root/.cache/onnx_models")
MODEL_DIR = os.path.join(ONNX_CACHE_DIR, MODEL_NAME)

tokenizer = None
session = None


def mean_pooling(token_embeddings: np.ndarray, attention_mask: np.ndarray) -> np.ndarray:
    """Average token embeddings weighted by the attention mask."""
    mask_expanded = attention_mask[:, :, np.newaxis].astype(np.float32)
    sum_embeddings = np.sum(token_embeddings * mask_expanded, axis=1)
    sum_mask = np.clip(mask_expanded.sum(axis=1), a_min=1e-9, a_max=None)
    return sum_embeddings / sum_mask


def normalize(embeddings: np.ndarray) -> np.ndarray:
    norms = np.linalg.norm(embeddings, axis=1, keepdims=True)
    return embeddings / np.clip(norms, a_min=1e-9, a_max=None)


@app.on_event("startup")
async def startup_event():
    global tokenizer, session

    if not os.path.isdir(MODEL_DIR):
        raise RuntimeError(
            f"No exported ONNX model found at {MODEL_DIR}. The model is "
            f"exported at image build time - rebuild with "
            f"'--build-arg MODEL_NAME={MODEL_NAME}' (or docker compose "
            f"build embedding) so it matches the MODEL_NAME env var."
        )

    logger.info(f"Loading ONNX model from {MODEL_DIR}")
    tokenizer = AutoTokenizer.from_pretrained(MODEL_DIR)
    session = ort.InferenceSession(
        os.path.join(MODEL_DIR, "model.onnx"),
        providers=["CPUExecutionProvider"],
    )
    logger.info("ONNX model ready")


class EmbedRequest(BaseModel):
    text: str


class EmbedResponse(BaseModel):
    embedding: List[float]
    dimension: int


@app.post("/embed", response_model=EmbedResponse)
async def embed(request: EmbedRequest):
    """Generate a normalised mean-pooled embedding for a text string."""
    if not request.text or not request.text.strip():
        raise HTTPException(status_code=400, detail="text cannot be empty")

    inputs = tokenizer(
        request.text,
        padding=True,
        truncation=True,
        max_length=512,
        return_tensors="np",
    )

    input_names = {i.name for i in session.get_inputs()}
    ort_inputs = {k: v for k, v in inputs.items() if k in input_names}
    outputs = session.run(None, ort_inputs)
    # outputs[0] (last_hidden_state) shape: (1, seq_len, hidden_size)
    token_embeddings = outputs[0]
    attention_mask = inputs["attention_mask"]

    pooled = mean_pooling(token_embeddings, attention_mask)
    embedding = normalize(pooled)[0].tolist()

    return EmbedResponse(embedding=embedding, dimension=len(embedding))


@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "ok", "model": MODEL_NAME, "backend": "onnxruntime"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
