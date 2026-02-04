#!/bin/bash

# AI Quantizer Hub - GKE Deployment Script
# This script automates the deployment process to Google Kubernetes Engine

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ID="${GCP_PROJECT_ID}"
REGION="${GCP_REGION:-us-central1}"
CLUSTER_NAME="${GKE_CLUSTER_NAME:-ai-quantizer-cluster}"
IMAGE_NAME="ai-quantizer-hub"
IMAGE_TAG="${IMAGE_TAG:-$(date +%Y%m%d-%H%M%S)}"  # Use timestamp by default for versioning

echo -e "${GREEN}=== AI Quantizer Hub GKE Deployment ===${NC}"
echo -e "${YELLOW}Image will be tagged as: ${IMAGE_TAG}${NC}"

# Check if PROJECT_ID is set
if [ -z "$PROJECT_ID" ]; then
    echo -e "${RED}Error: GCP_PROJECT_ID environment variable is not set${NC}"
    echo "Please set it with: export GCP_PROJECT_ID=your-project-id"
    exit 1
fi

# Check if GEMINI_API_KEY is set
if [ -z "$GEMINI_API_KEY" ]; then
    echo -e "${YELLOW}Warning: GEMINI_API_KEY environment variable is not set${NC}"
    echo "You'll need to create the Kubernetes secret manually or set this variable"
fi

# Step 1: Build Docker image
echo -e "${GREEN}Step 1: Building Docker image...${NC}"
docker build --cache-from gcr.io/${PROJECT_ID}/${IMAGE_NAME}:latest \
  -t gcr.io/${PROJECT_ID}/${IMAGE_NAME}:${IMAGE_TAG} \
  -t gcr.io/${PROJECT_ID}/${IMAGE_NAME}:latest .

# Step 2: Push to Google Container Registry
echo -e "${GREEN}Step 2: Pushing image to GCR...${NC}"
docker push gcr.io/${PROJECT_ID}/${IMAGE_NAME}:${IMAGE_TAG}
docker push gcr.io/${PROJECT_ID}/${IMAGE_NAME}:latest

# Step 3: Update deployment manifest with project ID
echo -e "${GREEN}Step 3: Updating Kubernetes manifests...${NC}"
sed "s/PROJECT_ID/${PROJECT_ID}/g" k8s/deployment.yaml > k8s/deployment-temp.yaml

# Step 4: Create secret if GEMINI_API_KEY is set
if [ -n "$GEMINI_API_KEY" ]; then
    echo -e "${GREEN}Step 4: Creating Kubernetes secret...${NC}"
    kubectl create secret generic ai-quantizer-secrets \
        --from-literal=gemini-api-key="${GEMINI_API_KEY}" \
        --dry-run=client -o yaml | kubectl apply -f -
else
    echo -e "${YELLOW}Step 4: Skipping secret creation (GEMINI_API_KEY not set)${NC}"
    echo "Create it manually with:"
    echo "  kubectl create secret generic ai-quantizer-secrets --from-literal=gemini-api-key=YOUR_KEY"
fi

# Step 5: Apply Kubernetes manifests
echo -e "${GREEN}Step 5: Deploying to GKE...${NC}"
kubectl apply -f k8s/deployment-temp.yaml
kubectl apply -f k8s/service.yaml

# Clean up temp file
rm k8s/deployment-temp.yaml

# Step 6: Wait for deployment
echo -e "${GREEN}Step 6: Waiting for deployment to be ready...${NC}"
kubectl rollout status deployment/ai-quantizer-hub

# Step 7: Get service information
echo -e "${GREEN}Step 7: Getting service information...${NC}"
echo ""
echo -e "${GREEN}Deployment completed successfully!${NC}"
echo ""
echo "To get the external IP address, run:"
echo "  kubectl get service ai-quantizer-hub-service"
echo ""
echo "To view logs:"
echo "  kubectl logs -l app=ai-quantizer-hub -f"
echo ""
echo "To scale the deployment:"
echo "  kubectl scale deployment/ai-quantizer-hub --replicas=3"
