"""Build-time only: exports a sentence-transformers model to ONNX.

Runs in the Dockerfile's `exporter` stage, which has torch/optimum
installed. The final runtime image never imports this module or those
packages - it only loads the exported .onnx files with onnxruntime.
"""
import os

from optimum.onnxruntime import ORTModelForFeatureExtraction
from transformers import AutoTokenizer

MODEL_NAME = os.environ["MODEL_NAME"]
HF_MODEL_ID = f"sentence-transformers/{MODEL_NAME}"
OUT_DIR = f"/export/onnx_models/{MODEL_NAME}"

os.makedirs(OUT_DIR, exist_ok=True)

tokenizer = AutoTokenizer.from_pretrained(HF_MODEL_ID)
model = ORTModelForFeatureExtraction.from_pretrained(HF_MODEL_ID, export=True)

tokenizer.save_pretrained(OUT_DIR)
model.save_pretrained(OUT_DIR)

print(f"Exported {HF_MODEL_ID} -> {OUT_DIR}")
