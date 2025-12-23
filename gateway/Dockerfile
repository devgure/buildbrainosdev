FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --silent
COPY . .

FROM node:18-alpine AS runtime
RUN addgroup -g 1000 app && adduser -S -G app -u 1000 app
WORKDIR /app
# Copy only necessary artifacts from builder
COPY --from=builder /app /app
# Remove dev files and keep production deps
RUN npm prune --production --silent || true
USER app
EXPOSE 4000
CMD ["node", "server.js"]
