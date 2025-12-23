FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --silent
COPY . .
# Generate Prisma client (build-time)
RUN npx prisma generate --schema=./prisma/schema.prisma || true

FROM node:18-alpine AS runtime
RUN addgroup -g 1000 app && adduser -S -G app -u 1000 app
WORKDIR /app
# Install production deps in final image
COPY package*.json ./
RUN npm ci --production --silent || true
# Copy generated prisma client from builder
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
# Copy rest of app
COPY --from=builder /app .
USER app
EXPOSE 5100
CMD ["node", "server.js"]
