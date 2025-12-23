Admin dashboard notes

The platform uses distinct probe endpoints:

- `/live` — liveness (used by Docker Compose/service managers)
- `/ready` — readiness (used by Kubernetes and orchestrators)

When running locally via Docker Compose, the gateway's `/live` endpoint is used as the compose healthcheck. For Kubernetes, use the manifests in `infra/k8s/deployments.yaml` as a template.
