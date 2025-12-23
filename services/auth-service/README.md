Auth Service

This service uses Prisma with the included schema at `prisma/schema.prisma`.

Local commands (you must have access to the MongoDB instance):

```bash
# install deps
npm install

# generate Prisma client
npm run prisma:generate

# run migrations (interactive - will create migration files)
npm run prisma:migrate:dev

# start
npm start
```

Docker build runs `npx prisma generate` during image build.
