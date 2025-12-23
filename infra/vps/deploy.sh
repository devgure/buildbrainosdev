#!/usr/bin/env bash
# Simple VPS deploy helper for BuildBrain (expects docker & docker-compose installed)
# Usage: sudo ./deploy.sh deploy|pull|start|stop|restart
set -euo pipefail
ROOT_DIR=${ROOT_DIR:-/opt/buildbrain}
COMPOSE_FILE=${COMPOSE_FILE:-$ROOT_DIR/docker-compose.yml}

action=${1:-deploy}
case "$action" in
  deploy)
    echo "Deploy: pull images, create directories, and start"
    mkdir -p $ROOT_DIR
    cd $ROOT_DIR
    docker compose pull || true
    docker compose up -d --remove-orphans
    ;;
  pull)
    echo "Pulling images"
    cd $ROOT_DIR
    docker compose pull
    ;;
  start)
    echo "Starting services"
    cd $ROOT_DIR
    docker compose up -d
    ;;
  stop)
    echo "Stopping services"
    cd $ROOT_DIR
    docker compose down
    ;;
  restart)
    echo "Restarting services"
    cd $ROOT_DIR
    docker compose pull || true
    docker compose up -d --remove-orphans
    ;;
  *)
    echo "Usage: $0 {deploy|pull|start|stop|restart}"
    exit 2
    ;;
esac

echo "Done."
