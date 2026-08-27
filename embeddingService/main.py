import os
from typing import List
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from optimum.onnxruntime import ORTModelForFeatureExtraction
from transformers import AutoTokenizer
import numpy as np
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Recommendation Engine - Embedding Service")

MODEL_NAME = os.getenv("MODEL_NAME", "all-MiniLM-L6-v2")
# Full HuggingFace model ID (sentence-transformers namespace)
HF_MODEL_ID = f"sentence-transformers/{MODEL_NAME}"
# Cache dir – mounted as a Docker volume so export only happens once
ONNX_CACHE_DIR = os.getenv("ONNX_CACHE_DIR", "/root/.cache/onnx_models")

tokenizer = None
ort_model = None


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
    global tokenizer, ort_model
    model_cache = os.path.join(ONNX_CACHE_DIR, MODEL_NAME)

    logger.info(f"Loading ONNX embedding model: {HF_MODEL_ID}")

    if os.path.isdir(model_cache):
        # Already exported – load from cache (fast path)
        logger.info(f"Loading cached ONNX model from {model_cache}")
        tokenizer = AutoTokenizer.from_pretrained(model_cache)
        ort_model = ORTModelForFeatureExtraction.from_pretrained(model_cache)
    else:
        # Export from HuggingFace Hub and save to cache
        logger.info("Exporting model to ONNX (first run – may take a minute)…")
        os.makedirs(model_cache, exist_ok=True)
        tokenizer = AutoTokenizer.from_pretrained(HF_MODEL_ID)
        ort_model = ORTModelForFeatureExtraction.from_pretrained(
            HF_MODEL_ID, export=True
        )
        tokenizer.save_pretrained(model_cache)
        ort_model.save_pretrained(model_cache)
        logger.info(f"Model exported and cached at {model_cache}")

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

    outputs = ort_model(**inputs)
    # outputs.last_hidden_state shape: (1, seq_len, hidden_size)
    token_embeddings = outputs.last_hidden_state
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
