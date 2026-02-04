<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1hTb8WueR0YEnqfOMTtPpVtUPzNOKWBHA

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Deploy to Google Kubernetes Engine (GKE)

This repository includes everything you need to deploy the AI Quantizer Hub to GKE.

### Prerequisites

- [Google Cloud SDK](https://cloud.google.com/sdk/docs/install) installed and configured
- [Docker](https://docs.docker.com/get-docker/) installed
- [kubectl](https://kubernetes.io/docs/tasks/tools/) installed
- A GCP project with billing enabled
- GKE API enabled in your project
- Your Gemini API key

### Quick Deployment

1. **Set up your environment variables:**
   ```bash
   export GCP_PROJECT_ID=your-project-id
   export GEMINI_API_KEY=your-gemini-api-key
   export GKE_CLUSTER_NAME=ai-quantizer-cluster  # optional, defaults to ai-quantizer-cluster
   export GCP_REGION=us-central1  # optional, defaults to us-central1
   export IMAGE_TAG=v1.0.0  # optional, uses timestamp if not set
   ```

   **Note:** For production, use semantic versioning (e.g., v1.0.0) instead of timestamps.

2. **Ensure your GKE cluster exists (create one if needed):**
   ```bash
   gcloud container clusters create $GKE_CLUSTER_NAME \
     --region $GCP_REGION \
     --num-nodes 2 \
     --machine-type n1-standard-1
   ```

3. **Configure kubectl to use your cluster:**
   ```bash
   gcloud container clusters get-credentials $GKE_CLUSTER_NAME --region $GCP_REGION
   ```

4. **Run the deployment script:**
   ```bash
   ./deploy-gke.sh
   ```

5. **Get your application URL:**
   ```bash
   kubectl get service ai-quantizer-hub-service
   ```
   Wait for the `EXTERNAL-IP` to be assigned (may take a few minutes).

### Manual Deployment

If you prefer to deploy manually:

1. **Build and push Docker image:**
   ```bash
   docker build -t gcr.io/$GCP_PROJECT_ID/ai-quantizer-hub:latest .
   docker push gcr.io/$GCP_PROJECT_ID/ai-quantizer-hub:latest
   ```

2. **Create Kubernetes secret for API key:**
   ```bash
   kubectl create secret generic ai-quantizer-secrets \
     --from-literal=gemini-api-key=$GEMINI_API_KEY
   ```

3. **Update deployment manifest with your project ID:**
   ```bash
   sed "s/PROJECT_ID/$GCP_PROJECT_ID/g" k8s/deployment.yaml | kubectl apply -f -
   ```

4. **Deploy the service:**
   ```bash
   kubectl apply -f k8s/service.yaml
   ```

5. **Check deployment status:**
   ```bash
   kubectl rollout status deployment/ai-quantizer-hub
   kubectl get service ai-quantizer-hub-service
   ```

### Useful Commands

- **View logs:**
  ```bash
  kubectl logs -l app=ai-quantizer-hub -f
  ```

- **Scale deployment:**
  ```bash
  kubectl scale deployment/ai-quantizer-hub --replicas=3
  ```

- **Update deployment:**
  ```bash
  docker build -t gcr.io/$GCP_PROJECT_ID/ai-quantizer-hub:latest .
  docker push gcr.io/$GCP_PROJECT_ID/ai-quantizer-hub:latest
  kubectl rollout restart deployment/ai-quantizer-hub
  ```

- **Delete deployment:**
  ```bash
  kubectl delete -f k8s/deployment.yaml
  kubectl delete -f k8s/service.yaml
  kubectl delete secret ai-quantizer-secrets
  ```

### Architecture

The deployment includes:
- **Dockerfile**: Multi-stage build with Nginx for serving the static React app
- **Kubernetes Deployment**: Runs 2 replicas with health checks and resource limits
- **Kubernetes Service**: LoadBalancer type service for external access
- **Secrets Management**: Secure handling of API keys via Kubernetes secrets

### Security Considerations

⚠️ **IMPORTANT**: The default configuration creates a public endpoint without authentication.

For production deployments, you should:
1. **Enable HTTPS/TLS** using Google-managed certificates or Let's Encrypt
2. **Add authentication** using Cloud IAP or application-level auth
3. **Restrict access** using Cloud Armor, VPC firewall rules, or IP allowlists
4. **Use versioned image tags** instead of timestamp-based tags
5. **Store secrets in Secret Manager** instead of Kubernetes secrets

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed security best practices.

### Troubleshooting

- **Pod not starting**: Check logs with `kubectl logs -l app=ai-quantizer-hub`
- **External IP pending**: LoadBalancer provisioning can take 2-5 minutes
- **API key issues**: Verify secret with `kubectl get secret ai-quantizer-secrets -o yaml`
