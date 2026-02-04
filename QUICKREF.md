# GKE Quick Reference

Quick commands for common GKE operations with AI Quantizer Hub.

## Environment Setup
```bash
export GCP_PROJECT_ID=your-project-id
export GEMINI_API_KEY=your-gemini-api-key
export IMAGE_TAG=v1.0.0  # Use semantic versioning
```

## Deploy
```bash
./deploy-gke.sh
```

## Check Status
```bash
# Get all resources
kubectl get all -l app=ai-quantizer-hub

# Get external IP
kubectl get service ai-quantizer-hub-service

# Check pod logs
kubectl logs -l app=ai-quantizer-hub -f
```

## Update Application
```bash
# 1. Make code changes
# 2. Set new version
export IMAGE_TAG=v1.0.1

# 3. Redeploy
./deploy-gke.sh
```

## Scale
```bash
# Manual scaling
kubectl scale deployment/ai-quantizer-hub --replicas=3

# Auto-scaling
kubectl autoscale deployment ai-quantizer-hub --min=2 --max=10 --cpu-percent=80
```

## Rollback
```bash
# View history
kubectl rollout history deployment/ai-quantizer-hub

# Rollback to previous
kubectl rollout undo deployment/ai-quantizer-hub
```

## Troubleshooting
```bash
# Describe pod
kubectl describe pod <pod-name>

# Get events
kubectl get events --sort-by='.lastTimestamp'

# Check resource usage
kubectl top pods -l app=ai-quantizer-hub
```

## Cleanup
```bash
# Delete deployment
kubectl delete -f k8s/deployment.yaml
kubectl delete -f k8s/service.yaml
kubectl delete secret ai-quantizer-secrets

# Or delete by label
kubectl delete all -l app=ai-quantizer-hub
```

## Security Checklist
- [ ] Configure HTTPS/TLS (see DEPLOYMENT.md)
- [ ] Enable authentication (Cloud IAP recommended)
- [ ] Restrict access (Cloud Armor or firewall rules)
- [ ] Use Secret Manager for API keys
- [ ] Enable Binary Authorization
- [ ] Set up monitoring and logging
- [ ] Configure backup and disaster recovery

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.
