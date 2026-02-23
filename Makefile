# AI-Quantizer-Hub root Makefile
# ──────────────────────────────────────────────────────────────────────────────
# Prerequisites: Docker (with NVIDIA Container Toolkit for GPU support)
# ──────────────────────────────────────────────────────────────────────────────

DOCKER_IMAGE   ?= forge-quantizer
DOCKERFILE     ?= docker/quantizer.Dockerfile
CONFIG         ?= quantizer/configs/forge_default.yaml

# Host directories (created automatically if absent)
MODELS_DIR     ?= $(CURDIR)/models
OUT_DIR        ?= $(CURDIR)/out

# Common docker run flags
DOCKER_RUN = docker run --rm \
	--gpus all \
	-v "$(MODELS_DIR):/cache/models" \
	-v "$(OUT_DIR):/out" \
	-e CONFIG=/forge/$(CONFIG) \
	$(DOCKER_IMAGE)

.PHONY: help build-forge quantize-gguf fetch-model

## help: Show this help message
help:
	@echo ""
	@echo "  AI-Quantizer-Hub – Forge targets"
	@echo ""
	@grep -E '^## ' $(MAKEFILE_LIST) | \
		sed 's/^## //' | \
		awk -F': ' '{printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'
	@echo ""

## build-forge: Build the Forge Docker image
build-forge:
	@echo "Building Docker image: $(DOCKER_IMAGE)"
	docker build -f $(DOCKERFILE) -t $(DOCKER_IMAGE) .

## quantize-gguf: Run the full GGUF pipeline (fetch → convert → quantize)
quantize-gguf: $(OUT_DIR) $(MODELS_DIR)
	@echo "Running GGUF quantization pipeline..."
	$(DOCKER_RUN) \
		--config /forge/$(CONFIG) \
		quant gguf

## fetch-model: Download a HF model snapshot into models/
fetch-model: $(MODELS_DIR)
	@echo "Fetching model (uses first model in config unless REPO is set)..."
	$(DOCKER_RUN) \
		--config /forge/$(CONFIG) \
		fetch $(if $(REPO),--repo $(REPO),)

$(MODELS_DIR):
	mkdir -p $(MODELS_DIR)

$(OUT_DIR):
	mkdir -p $(OUT_DIR)
