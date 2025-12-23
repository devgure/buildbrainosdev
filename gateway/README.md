Gateway probe paths

- Liveness: `/live` — cheap, local-only check used by Docker healthchecks and k8s livenessProbe
- Readiness: `/ready` — aggregated downstream readiness (short timeout)

When configuring Nginx or Kubernetes, point livenessProbe to `/live` and readinessProbe to `/ready`.

Example k8s probes are in `infra/k8s/deployments.yaml`.
