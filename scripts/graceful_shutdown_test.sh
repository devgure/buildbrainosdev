#!/usr/bin/env bash
# Simple graceful shutdown test for a Docker container/service
# Usage: SVC=project-service ./scripts/graceful_shutdown_test.sh

SVC=${SVC:-project-service}
PORT=${PORT:-$(case "$SVC" in project-service) echo 5000 ;; auth-service) echo 5100 ;; ai-service) echo 8000 ;; payment-service) echo 5200 ;; *) echo 4000 ;; esac)}
BASE=http://localhost

echo "Checking $SVC before shutdown"
curl -fsS ${BASE}:${PORT}/live || true; echo
curl -fsS ${BASE}:${PORT}/ready || true; echo

CONTAINER=$(docker ps --filter "name=${SVC}" --format "{{.ID}}")
if [ -z "$CONTAINER" ]; then
  echo "No running container matched ${SVC}; aborting test"
  exit 1
fi

echo "Sending SIGTERM to container $CONTAINER"
docker kill --signal=SIGTERM $CONTAINER
sleep 2

echo "Waiting for container to exit"
for i in `seq 1 20`; do
  if ! docker ps --filter "id=$CONTAINER" --format "{{.ID}}" | grep -q .; then
    echo "Container stopped"
    break
  fi
  echo "Still running... ($i)"; sleep 1
done

echo "Post-shutdown check (should be down)"
curl -fsS ${BASE}:${PORT}/live || echo 'live down'
curl -fsS ${BASE}:${PORT}/ready || echo 'ready down'
#!/usr/bin/env bash
# Simple helper to test graceful shutdown of a running Docker container.
# Usage: SVC=project-service ./scripts/graceful_shutdown_test.sh
# The script will call /live and /ready before and then send SIGTERM to the container.
set -euo pipefail
SVC=${SVC:-project-service}
CONTAINER=$(docker ps --filter "name=${SVC}" --format "{{.Names}}" | head -n1)
if [ -z "$CONTAINER" ]; then
  echo "No running container found for ${SVC}. Use 'docker ps' to inspect."
  exit 2
fi
BASE="http://localhost"
PORT=5000
case "$SVC" in
  gateway) PORT=4000 ;; 
  project-service) PORT=5000 ;; 
  ai-service) PORT=8000 ;; 
  auth-service) PORT=5100 ;; 
  payment-service) PORT=5200 ;; 
esac

echo "Checking live and ready before shutdown"
curl -fsS ${BASE}:${PORT}/live || true; echo
curl -fsS ${BASE}:${PORT}/ready || true; echo

echo "Sending SIGTERM to container $CONTAINER"
docker kill -s SIGTERM "$CONTAINER"

echo "Waiting 5s then checking whether service stopped responding"
sleep 5
if curl -fsS ${BASE}:${PORT}/live >/dev/null 2>&1; then
  echo "Service still responding to /live after SIGTERM (expected short grace period)"
else
  echo "Service not responding to /live — shutdown likely complete"
fi
