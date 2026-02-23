# Forge – Quantizer Engine

Forge is the Python-based GGUF-first quantization engine for **AI-Quantizer-Hub**.

## Quick-start (Docker – recommended)

```bash
# 1. Build the Docker image
make build-forge

# 2. Run the full GGUF pipeline (download → convert → quantize)
make quantize-gguf
```

Quantized files land in `out/` on your host machine.

## Quick-start (local / bare-metal)

> Requires: Python ≥ 3.10, a built copy of [llama.cpp](https://github.com/ggerganov/llama.cpp)

```bash
cd quantizer/
pip install -r requirements.txt

# Download a model
python -m quantizer.cli fetch --repo TheBloke/Mistral-7B-v0.1-GGUF

# Quantize to GGUF
python -m quantizer.cli quant gguf

# Check results
python -m quantizer.cli bench
```

## CLI reference

```
python -m quantizer.cli [--config PATH] [--log-level LEVEL] COMMAND [OPTIONS]
```

### Global flags

| Flag | Default | Description |
|---|---|---|
| `--config PATH` | `quantizer/configs/forge_default.yaml` | YAML config file |
| `--log-level` | `INFO` | `DEBUG` / `INFO` / `WARNING` / `ERROR` |

### Subcommands

#### `fetch`

Download a Hugging Face model snapshot into the cache directory.

```bash
python -m quantizer.cli fetch --repo mistralai/Mistral-7B-v0.1
# or use the first model in config:
python -m quantizer.cli fetch
```

| Flag | Description |
|---|---|
| `--repo REPO_ID` | HF repo ID (e.g., `TheBloke/Mistral-7B-v0.1-GGUF`) |
| `--cache-dir PATH` | Override the cache directory |
| `--force` | Re-download even if already cached |

#### `quant gguf`

Convert + quantize a model to GGUF using llama.cpp.

```bash
python -m quantizer.cli quant gguf
# or override per-run:
python -m quantizer.cli quant gguf --repo mistralai/Mistral-7B-v0.1 --quant-types Q4_K_M Q5_K_M
```

| Flag | Description |
|---|---|
| `--repo REPO_ID` | HF repo ID (overrides config) |
| `--quant-types TYPE …` | Quant types to produce (e.g., `Q4_K_M Q5_K_M`) |
| `--cache-dir PATH` | Override cache directory |
| `--output-dir PATH` | Override output directory |

#### `bench`

Report output file sizes and print sample `llama-cli` run commands.

```bash
python -m quantizer.cli bench
python -m quantizer.cli bench --output-dir ./out
```

#### `recommend`

Suggest GGUF quant types based on your available VRAM.

```bash
python -m quantizer.cli recommend --vram 12
```

## Configuration (`forge_default.yaml`)

```yaml
models:
  - repo_id: "mistralai/Mistral-7B-v0.1"
    quant_types: ["Q4_K_M", "Q5_K_M"]

cache_dir: "/cache/models"
output_dir: "/out"
llama_cpp_dir: "/opt/llama.cpp"
convert_script: "/opt/llama.cpp/convert_hf_to_gguf.py"
quantize_bin: "/opt/llama.cpp/build/bin/llama-quantize"
skip_existing: true
log_level: "INFO"
```

## Air-gap / offline mode

When the container has no internet access, pre-populate the cache directory:

```bash
# On a machine WITH internet access:
huggingface-cli download mistralai/Mistral-7B-v0.1 --local-dir ./models/mistralai--Mistral-7B-v0.1

# Mount into container and disable network:
docker run --rm --network none \
  -v $(pwd)/models:/cache/models \
  -v $(pwd)/out:/out \
  forge-quantizer \
  python -m quantizer.cli quant gguf
```

The CLI checks the cache first; if the model directory is non-empty, no download is attempted.

## Supported VRAM tiers (RTX 5070 12 GB)

| Quant | Min VRAM | Quality |
|---|---|---|
| Q2_K | 4 GB | Minimal |
| Q4_K_S | 6 GB | Good |
| Q4_K_M | 8 GB | Great (recommended) |
| Q5_K_M | 10 GB | High |
| Q6_K | 12 GB | Excellent |
| Q8_0 | 16 GB | Near-lossless |
