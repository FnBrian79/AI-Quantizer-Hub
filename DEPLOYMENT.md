# GKE Deployment Guide

This guide provides detailed instructions for deploying the AI Quantizer Hub to Google Kubernetes Engine (GKE).

## Table of Contents
- [Prerequisites](#prerequisites)
- [One-Time Setup](#one-time-setup)
- [Deployment Methods](#deployment-methods)
  - [Automated Deployment (Recommended)](#automated-deployment-recommended)
  - [Manual Deployment](#manual-deployment)
- [Post-Deployment](#post-deployment)
- [Management Operations](#management-operations)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before you begin, ensure you have the following installed and configured:

1. **Google Cloud SDK (gcloud)**
   ```bash
   # Install (if not already installed)
   curl https://sdk.cloud.google.com | bash
   exec -l $SHELL
   
   # Initialize and authenticate
   gcloud init
   gcloud auth login
   ```

2. **Docker**
   ```bash
   # Verify Docker is installed
   docker --version
   ```

3. **kubectl**
   ```bash
   # Install kubectl (if not already installed)
   gcloud components install kubectl
   
   # Verify installation
   kubectl version --client
   ```

4. **GCP Project Setup**
   - A GCP project with billing enabled
   - Enable required APIs:
     ```bash
     gcloud services enable container.googleapis.com
     gcloud services enable compute.googleapis.com
     ```

5. **Gemini API Key**
   - Obtain from [Google AI Studio](https://makersuite.google.com/app/apikey)

## One-Time Setup

### 1. Set Environment Variables

```bash
export GCP_PROJECT_ID=your-project-id
export GEMINI_API_KEY=your-gemini-api-key
export GCP_REGION=us-central1  # Change if needed
export GKE_CLUSTER_NAME=ai-quantizer-cluster  # Change if needed
```

**Tip:** Add these to your `~/.bashrc` or `~/.zshrc` for persistence:
```bash
echo 'export GCP_PROJECT_ID=your-project-id' >> ~/.bashrc
echo 'export GEMINI_API_KEY=your-gemini-api-key' >> ~/.bashrc
source ~/.bashrc
```

### 2. Set Default GCP Project

```bash
gcloud config set project $GCP_PROJECT_ID
```

### 3. Enable Docker Authentication for GCR

```bash
gcloud auth configure-docker
```

### 4. Create GKE Cluster (if you don't have one)

```bash
gcloud container clusters create $GKE_CLUSTER_NAME \
  --region $GCP_REGION \
  --num-nodes 2 \
  --machine-type n1-standard-1 \
  --disk-size 20GB \
  --enable-autoscaling \
  --min-nodes 1 \
  --max-nodes 5 \
  --enable-autorepair \
  --enable-autoupgrade
```

**Note:** This command creates a cluster with autoscaling capabilities. Adjust parameters based on your needs.

### 5. Configure kubectl

```bash
gcloud container clusters get-credentials $GKE_CLUSTER_NAME --region $GCP_REGION
```

Verify connection:
```bash
kubectl cluster-info
kubectl get nodes
```

## Deployment Methods

### Automated Deployment (Recommended)

The easiest way to deploy is using the provided deployment script:

```bash
./deploy-gke.sh
```

This script will:
1. Build the Docker image
2. Push to Google Container Registry
3. Create Kubernetes secrets
4. Deploy to your GKE cluster
5. Create the LoadBalancer service

### Manual Deployment

If you prefer step-by-step control:

#### Step 1: Build and Push Docker Image

```bash
# Build the image
docker build -t gcr.io/$GCP_PROJECT_ID/ai-quantizer-hub:latest .

# Push to Google Container Registry
docker push gcr.io/$GCP_PROJECT_ID/ai-quantizer-hub:latest
```

#### Step 2: Create Kubernetes Secret

```bash
kubectl create secret generic ai-quantizer-secrets \
  --from-literal=gemini-api-key=$GEMINI_API_KEY
```

Verify secret creation:
```bash
kubectl get secret ai-quantizer-secrets
```

#### Step 3: Update Deployment Manifest

Replace PROJECT_ID placeholder in the deployment manifest:
```bash
sed "s/PROJECT_ID/$GCP_PROJECT_ID/g" k8s/deployment.yaml > k8s/deployment-applied.yaml
```

#### Step 4: Apply Kubernetes Manifests

```bash
# Deploy the application
kubectl apply -f k8s/deployment-applied.yaml

# Create the service
kubectl apply -f k8s/service.yaml
```

#### Step 5: Wait for Deployment

```bash
# Watch deployment progress
kubectl rollout status deployment/ai-quantizer-hub

# Check pods
kubectl get pods -l app=ai-quantizer-hub
```

## Post-Deployment

### Get Application URL

```bash
# Get the external IP (may take 2-5 minutes to provision)
kubectl get service ai-quantizer-hub-service

# Or watch until it's assigned
kubectl get service ai-quantizer-hub-service -w
```

Look for the `EXTERNAL-IP` column. Once assigned, access your application at:
```
http://<EXTERNAL-IP>
```

### Verify Deployment

```bash
# Check pod status
kubectl get pods -l app=ai-quantizer-hub

# View application logs
kubectl logs -l app=ai-quantizer-hub --tail=50

# Describe deployment
kubectl describe deployment ai-quantizer-hub
```

## Management Operations

### View Logs

```bash
# Tail logs from all pods
kubectl logs -l app=ai-quantizer-hub -f

# Logs from specific pod
kubectl logs <pod-name> -f

# Previous crashed container logs
kubectl logs <pod-name> --previous
```

### Scale Deployment

```bash
# Scale to 3 replicas
kubectl scale deployment/ai-quantizer-hub --replicas=3

# Auto-scale based on CPU
kubectl autoscale deployment ai-quantizer-hub --min=2 --max=10 --cpu-percent=80
```

### Update Application

```bash
# Make your code changes, then:

# 1. Rebuild and push image
docker build -t gcr.io/$GCP_PROJECT_ID/ai-quantizer-hub:latest .
docker push gcr.io/$GCP_PROJECT_ID/ai-quantizer-hub:latest

# 2. Restart deployment (pulls new image)
kubectl rollout restart deployment/ai-quantizer-hub

# 3. Watch rollout
kubectl rollout status deployment/ai-quantizer-hub
```

### Rollback Deployment

```bash
# View rollout history
kubectl rollout history deployment/ai-quantizer-hub

# Rollback to previous version
kubectl rollout undo deployment/ai-quantizer-hub

# Rollback to specific revision
kubectl rollout undo deployment/ai-quantizer-hub --to-revision=2
```

### Update Secret

```bash
# Delete old secret
kubectl delete secret ai-quantizer-secrets

# Create new secret with updated API key
kubectl create secret generic ai-quantizer-secrets \
  --from-literal=gemini-api-key=NEW_API_KEY

# Restart pods to use new secret
kubectl rollout restart deployment/ai-quantizer-hub
```

### Delete Deployment

```bash
# Delete all resources
kubectl delete -f k8s/deployment.yaml
kubectl delete -f k8s/service.yaml
kubectl delete secret ai-quantizer-secrets

# Or delete by label
kubectl delete all -l app=ai-quantizer-hub
```

## Troubleshooting

### Pod Not Starting

```bash
# Check pod events
kubectl describe pod <pod-name>

# Check logs
kubectl logs <pod-name>

# Check if image can be pulled
kubectl get events --sort-by='.lastTimestamp' | grep <pod-name>
```

Common issues:
- **ImagePullBackOff**: Check if image exists in GCR and PROJECT_ID is correct
- **CrashLoopBackOff**: Check application logs for errors
- **Pending**: Check if cluster has enough resources

### LoadBalancer External IP Stuck on Pending

```bash
# Check service status
kubectl describe service ai-quantizer-hub-service

# Check service events
kubectl get events | grep ai-quantizer-hub-service
```

This can take 2-5 minutes. If it stays pending longer:
- Verify GCP quotas for external IPs
- Check if region has available IPs
- Review firewall rules

### Connection Refused or Timeout

```bash
# Check if pods are running
kubectl get pods -l app=ai-quantizer-hub

# Check pod logs
kubectl logs -l app=ai-quantizer-hub

# Test internal connectivity
kubectl run -it --rm debug --image=alpine --restart=Never -- sh
# Inside the pod:
wget -O- http://ai-quantizer-hub-service
```

### API Key Issues

```bash
# Verify secret exists
kubectl get secret ai-quantizer-secrets

# Check secret data (base64 encoded)
kubectl get secret ai-quantizer-secrets -o yaml

# Decode to verify (be careful with sensitive data)
kubectl get secret ai-quantizer-secrets -o jsonpath='{.data.gemini-api-key}' | base64 -d
```

### High Resource Usage

```bash
# Check resource usage
kubectl top pods -l app=ai-quantizer-hub
kubectl top nodes

# Adjust resource limits in k8s/deployment.yaml if needed
```

### View Cluster Information

```bash
# General cluster info
kubectl cluster-info
kubectl get nodes
kubectl get all --all-namespaces

# Specific to our app
kubectl get all -l app=ai-quantizer-hub
```

## Advanced Configuration

### Using Cloud SQL Proxy (if adding database)

```yaml
# Add to deployment.yaml
- name: cloud-sql-proxy
  image: gcr.io/cloudsql-docker/gce-proxy:latest
  command:
    - "/cloud_sql_proxy"
    - "-instances=PROJECT:REGION:INSTANCE=tcp:5432"
```

### Custom Domain with HTTPS

1. Reserve static IP:
```bash
gcloud compute addresses create ai-quantizer-ip --global
```

2. Configure Ingress instead of LoadBalancer service
3. Set up Cloud DNS
4. Configure managed certificates

### Monitoring with Cloud Monitoring

```bash
# Enable monitoring
gcloud services enable monitoring.googleapis.com

# View metrics in Cloud Console:
# https://console.cloud.google.com/monitoring
```

## Cost Optimization Tips

1. **Use Preemptible Nodes** (for non-production):
```bash
gcloud container node-pools create preemptible-pool \
  --cluster=$GKE_CLUSTER_NAME \
  --preemptible \
  --num-nodes=2
```

2. **Enable Cluster Autoscaling**: Already configured in setup
3. **Use appropriate machine types**: Start with `n1-standard-1`
4. **Set resource limits**: Already configured in deployment.yaml
5. **Delete cluster when not in use**:
```bash
gcloud container clusters delete $GKE_CLUSTER_NAME --region $GCP_REGION
```

## Security Best Practices

1. **Use Secret Manager instead of Kubernetes secrets** (for production)
2. **Enable Binary Authorization**
3. **Use private clusters**
4. **Enable Pod Security Policies**
5. **Regularly update cluster and node versions**
6. **Use least privilege IAM roles**

## Support and Resources

- [GKE Documentation](https://cloud.google.com/kubernetes-engine/docs)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Docker Documentation](https://docs.docker.com/)
- [Google Cloud Console](https://console.cloud.google.com/)
