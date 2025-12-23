FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --silent
COPY . .

FROM node:18-alpine AS runtime
RUN addgroup -g 1000 app && adduser -S -G app -u 1000 app
WORKDIR /app
COPY --from=builder /app /app
RUN npm prune --production --silent || true
USER app
EXPOSE 5000
CMD ["node", "server.js"]
