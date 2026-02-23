# The Library of Logic - Command Bridge
    .PHONY: build-forge quantize-all
    
    # Build the isolated Forge container
    build-forge:
    	docker build -t forge-quantizer -f docker/quantizer.Dockerfile .
    
    # Execute deterministic quantization for all targets
    quantize-all:
    	docker run --gpus all -v $(PWD)/models:/models forge-quantizer --config quantizer/configs/forge_default.yaml
    
    # Individual logic gates
    quantize-gguf:
    	docker run --gpus all -v $(PWD)/models:/models forge-quantizer --config quantizer/configs/forge_default.yaml --type GGUF
