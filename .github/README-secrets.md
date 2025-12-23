GitHub Actions Secrets for BuildBrainOS CI

Add the following repository secrets in GitHub Settings → Secrets → Actions to enable CI and S3/MinIO testing:

- `DATABASE_URL` — e.g. `mongodb://mongo:27017/buildbrain`
- `AUTH0_DOMAIN` — your Auth0 tenant domain (e.g. `your-tenant.auth0.com`)
- `AUTH0_AUDIENCE` — API audience used for JWTs
- `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` — (optional) for AWS S3 uploads
- `AWS_S3_BUCKET` — (optional) S3 bucket name
- `AI_SERVICE_URL` — (optional) override AI service URL used in tests

If you prefer to test S3 uploads locally with MinIO, set the MinIO envs in your local `.env` instead:

- `MINIO_ROOT_USER` and `MINIO_ROOT_PASSWORD`
- `MINIO_ENDPOINT` (e.g. `http://minio:9000`)
- `MINIO_BUCKET` (e.g. `buildbrain-blueprints`)

The provided CI workflow reads services from `docker-compose.yml` and will use these secrets when present.
