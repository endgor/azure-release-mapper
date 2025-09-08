#!/usr/bin/env bash
set -euo pipefail

echo "Starting Ollama service..."
ollama serve &

# Wait for Ollama to be ready
RETRIES=30
until curl -s "http://${OLLAMA_HOST:-127.0.0.1}:${OLLAMA_PORT:-11434}/api/tags" >/dev/null 2>&1; do
  ((RETRIES--)) || { echo "Ollama did not start in time" >&2; exit 1; }
  sleep 1
done

MODEL="${OLLAMA_MODEL:-phi3.5:mini}"
echo "Ensuring model is available: $MODEL"
ollama pull "$MODEL" || true

echo "Starting Node server on port ${PORT:-8787}"
node /app/server/dist/index.js

