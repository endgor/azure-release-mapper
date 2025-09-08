# Multi-stage build: frontend, server, then final runtime with Ollama + Node

# ---------- Frontend build ----------
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build

# ---------- Server build ----------
FROM node:20-alpine AS server-builder
WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci
COPY server/ .
RUN npm run build

# ---------- Final runtime ----------
FROM node:20-bookworm-slim

# Install curl and dependencies, then install Ollama
RUN apt-get update && apt-get install -y bash curl ca-certificates && rm -rf /var/lib/apt/lists/* \
    && curl -fsSL https://ollama.com/install.sh | sh

ENV NODE_ENV=production \
    PORT=8787 \
    OLLAMA_HOST=127.0.0.1 \
    OLLAMA_PORT=11434 \
    OLLAMA_MODEL=phi3.5:mini

WORKDIR /app

# Copy server runtime and install prod deps
COPY --from=server-builder /app/server/package*.json /app/server/
RUN cd /app/server && npm ci --omit=dev
COPY --from=server-builder /app/server/dist /app/server/dist

# Copy frontend build into server public directory
RUN mkdir -p /app/server/dist/public
COPY --from=frontend-builder /app/frontend/dist /app/server/dist/public

# Add startup script to run Ollama + Node server
COPY ./start.sh /app/start.sh
RUN chmod +x /app/start.sh

EXPOSE 8787

CMD ["/app/start.sh"]
