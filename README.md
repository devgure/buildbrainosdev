BuildBrainOS — MVP Scaffold

Lightweight scaffold for BuildBrain: the AI Co-Pilot for Construction.

Contents:
- `gateway/` — Node Express API gateway stub
- `services/project-service/` — simple Projects microservice (Express)
- `services/ai-service/` — FastAPI AI microservice stub
- `client/mobile/` — mobile app stub (React Native / Expo placeholder)
- `docker-compose.yml` — local compose to run Mongo, Redis and the three services
- `Makefile` — helper commands

Quick start (requires Docker):

```bash
# from repo root
docker compose up --build
```

Gateway: http://localhost:4000
Project service: http://localhost:5000
AI service: http://localhost:8000/docs

Next steps:
- Wire auth (Auth0), add Prisma schema for Mongo, add storage for PDFs, add blueprint-agent service.
- Implement mobile offline sync and geofencing in `client/mobile/`.
