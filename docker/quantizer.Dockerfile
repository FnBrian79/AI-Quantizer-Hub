# Sovereign Forge Environment
    FROM nvidia/cuda:12.1.1-devel-ubuntu22.04
    
    RUN apt-get update && apt-get install -y \
        python3-pip python3-dev git git-lfs \
        && rm -rf /var/lib/apt/lists/*
    
    WORKDIR /forge
    COPY requirements.txt .
    # Note: requirements.txt will be added in a future step, but we define the COPY now
    # RUN pip3 install --no-cache-dir -r requirements.txt
    
    COPY . .
    ENTRYPOINT ["python3", "quantizer/cli.py"]
