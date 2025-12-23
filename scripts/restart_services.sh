#!/usr/bin/env bash
# Restart core BuildBrain services via docker compose
set -euo pipefail
ROOT_DIR=$(dirname "$0")/..
cd "$ROOT_DIR"

SERVICES="gateway project-service ai-service auth-service blueprint-agent payment-service"
echo "Restarting services: $SERVICES"
for s in $SERVICES; do
  echo "Restarting $s..."
  docker compose restart $s || true
done

echo "Done."
