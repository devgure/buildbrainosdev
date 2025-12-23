#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
cd services/auth-service
npm install
echo "Running prisma generate..."
npm run prisma:generate
echo "To run migrations interactively, run: npm run prisma:migrate:dev"
