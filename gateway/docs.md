Gateway and probes

Endpoints:
- `GET /live` — liveness probe (cheap)
- `GET /ready` — readiness probe (aggregates downstream services with short timeouts)

Kubernetes:
- Use `/live` for `livenessProbe` and `/ready` for `readinessProbe` in your Deployment container spec.
- Example manifests: `infra/k8s/deployments.yaml`.

Admin dashboard:
- The admin UI expects the gateway to be available at `http://localhost:4000` in local dev compose stacks. The admin dashboard's health check is performed against its own static assets; the gateway `/live` and `/ready` are what orchestrators should monitor.
