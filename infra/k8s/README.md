Kubernetes manifests for BuildBrain (core services)

These are minimal Deployment + Service manifests to get started. They use image tags like `buildbrain/<service>:latest`.

To deploy locally with `kubectl` (assuming you have built and pushed images):

```bash
kubectl apply -f infra/k8s/gateway-deployment.yaml
kubectl apply -f infra/k8s/auth-deployment.yaml
kubectl apply -f infra/k8s/project-deployment.yaml
kubectl apply -f infra/k8s/ai-deployment.yaml
kubectl apply -f infra/k8s/blueprint-deployment.yaml
```

You should create K8s Secrets for DB and external creds (e.g., `auth-secrets`, `gateway-secrets`, `project-secrets`, `ai-secrets`, `blueprint-secrets`).
