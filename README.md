<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# AI Quantizer Hub

AI Quantizer Hub is a **monorepo** containing:

| Component | Description |
|---|---|
| **Frontend** (root) | Vite + React/TypeScript UI served via `npm run dev` |
| **Forge** (`quantizer/`) | Python GGUF-first quantization engine powered by llama.cpp |
| **Docker** (`docker/`) | NVIDIA CUDA container for building and running the engine |

---

## Frontend – Run Locally

**Prerequisites:** Node.js ≥ 18

```bash
# Install dependencies
npm install

# Set your Gemini API key
echo "GEMINI_API_KEY=your_key_here" > .env.local

# Start the dev server (http://localhost:3000)
npm run dev
```

---

## Forge Engine – Quickstart (Docker)

**Prerequisites:** Docker + [NVIDIA Container Toolkit](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/install-guide.html)

### 1. Build the Docker image

```bash
make build-forge
# equivalent: docker build -f docker/quantizer.Dockerfile -t forge-quantizer .
```

### 2. Run the full GGUF pipeline

```bash
make quantize-gguf
```

This runs `fetch → convert → quantize` for all models defined in
`quantizer/configs/forge_default.yaml` and places GGUF files in `out/`.

### 3. Fetch a specific model

```bash
make fetch-model REPO=TheBloke/Mistral-7B-v0.1-GGUF
```

### 4. Check results

```bash
docker run --rm -v $(pwd)/out:/out forge-quantizer bench --output-dir /out
```

### 5. Get quant recommendations for your GPU

```bash
docker run --rm forge-quantizer recommend --vram 12
```

---

## Config-driven usage

All pipeline parameters are controlled by a single YAML file:

```yaml
# quantizer/configs/forge_default.yaml (RTX 5070 12 GB defaults)

models:
  - repo_id: "TheBloke/Mistral-7B-v0.1-GGUF"
    quant_types: ["Q4_K_M", "Q5_K_M"]
  - repo_id: "bartowski/Qwen2.5-14B-Instruct-GGUF"
    quant_types: ["Q4_K_M"]

cache_dir: "/cache/models"
output_dir: "/out"
llama_cpp_dir: "/opt/llama.cpp"
convert_script: "/opt/llama.cpp/convert_hf_to_gguf.py"
quantize_bin: "/opt/llama.cpp/build/bin/llama-quantize"
skip_existing: true
log_level: "INFO"
```

Supply a custom config at runtime:

```bash
docker run --rm --gpus all \
  -v $(pwd)/my_config.yaml:/forge/my_config.yaml \
  -v $(pwd)/models:/cache/models \
  -v $(pwd)/out:/out \
  forge-quantizer --config /forge/my_config.yaml quant gguf
```

---

## Air-gap / offline mode

For environments with no internet access, pre-populate the models directory on
a machine that **does** have internet access, then transfer the files:

```bash
# --- On a connected machine ---
pip install huggingface_hub
huggingface-cli download mistralai/Mistral-7B-v0.1 \
    --local-dir ./models/mistralai--Mistral-7B-v0.1

# Transfer ./models/ to the air-gapped host, then:

# --- On the air-gapped host ---
docker run --rm --network none \
  --gpus all \
  -v $(pwd)/models:/cache/models \
  -v $(pwd)/out:/out \
  forge-quantizer quant gguf
```

The Forge CLI checks whether the cache directory already contains the model;
if it does, no network request is made.

---

## Makefile targets

| Target | Description |
|---|---|
| `make build-forge` | Build the `forge-quantizer` Docker image |
| `make quantize-gguf` | Run the full GGUF pipeline using default config |
| `make fetch-model [REPO=…]` | Download a specific HF model into `models/` |
| `make help` | List all available targets |

---

## Repository layout

```
AI-Quantizer-Hub/
├── index.html          # Frontend entry point
├── index.tsx
├── App.tsx
├── components/
├── package.json        # Frontend deps (npm install / npm run dev)
├── vite.config.ts
├── Makefile            # Forge build/run shortcuts
├── quantizer/          # Forge Python engine
│   ├── cli.py          # CLI entry point
│   ├── pipelines/
│   │   └── gguf.py     # GGUF download → convert → quantize
│   ├── configs/
│   │   └── forge_default.yaml
│   ├── requirements.txt
│   └── README.md
├── docker/
│   └── quantizer.Dockerfile   # CUDA image with llama.cpp
├── models/             # Host-side model cache (volume-mounted)
└── out/                # Quantized GGUF output (volume-mounted)
```
