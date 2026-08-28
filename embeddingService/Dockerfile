# ---- Stage 1: export the model to ONNX -------------------------------
# torch + optimum are only needed to do the export; this whole stage
# (and the ~2-3GB they pull in) is discarded and never reaches the
# final image.
FROM python:3.11-slim AS exporter

WORKDIR /export

ARG MODEL_NAME=all-MiniLM-L6-v2
ENV MODEL_NAME=${MODEL_NAME}

RUN --mount=type=cache,target=/root/.cache/pip \
    pip install --extra-index-url https://download.pytorch.org/whl/cpu \
    "optimum[onnxruntime]" transformers huggingface-hub torch

COPY export_model.py .
RUN python export_model.py

# ---- Stage 2: slim runtime image --------------------------------------
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .

RUN --mount=type=cache,target=/root/.cache/pip \
    pip install -r requirements.txt

COPY --from=exporter /export/onnx_models /root/.cache/onnx_models
COPY main.py .

EXPOSE 8001
CMD ["python", "main.py"]
