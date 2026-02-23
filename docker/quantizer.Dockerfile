# syntax=docker/dockerfile:1
# ── Forge quantizer image ──────────────────────────────────────────────────────
# Base: NVIDIA CUDA devel image (Ubuntu 22.04) for building llama.cpp with CUDA.
# Usage:
#   docker build -f docker/quantizer.Dockerfile -t forge-quantizer .
#   docker run --rm --gpus all -v $(pwd)/models:/cache/models -v $(pwd)/out:/out \
#     forge-quantizer python -m quantizer.cli quant gguf

FROM nvidia/cuda:12.4.1-devel-ubuntu22.04

# ── OS packages ────────────────────────────────────────────────────────────────
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y --no-install-recommends \
        build-essential \
        cmake \
        git \
        curl \
        python3 \
        python3-pip \
        python3-venv \
        ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# ── Clone + build llama.cpp ────────────────────────────────────────────────────
ARG LLAMA_CPP_REF=master
WORKDIR /opt
RUN git clone --depth 1 --branch "${LLAMA_CPP_REF}" \
        https://github.com/ggerganov/llama.cpp.git && \
    cmake -S llama.cpp -B llama.cpp/build \
          -DGGML_CUDA=ON \
          -DCMAKE_BUILD_TYPE=Release && \
    cmake --build llama.cpp/build --config Release -j"$(nproc)" && \
    pip3 install --no-cache-dir -r llama.cpp/requirements.txt

# ── Install Forge Python dependencies ─────────────────────────────────────────
COPY quantizer/requirements.txt /forge/quantizer/requirements.txt
RUN pip3 install --no-cache-dir -r /forge/quantizer/requirements.txt

# ── Copy Forge source ──────────────────────────────────────────────────────────
COPY quantizer/ /forge/quantizer/

# ── Runtime defaults ───────────────────────────────────────────────────────────
WORKDIR /forge
ENV PYTHONPATH=/forge
ENV HF_HOME=/cache/hf

# Volume mount points (override at runtime)
VOLUME ["/cache/models", "/out"]

# Default: show help
ENTRYPOINT ["python3", "-m", "quantizer.cli"]
CMD ["--help"]
