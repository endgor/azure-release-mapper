#!/usr/bin/env bash
set -euo pipefail

echo "Starting Node server on port ${PORT:-8787}"
node /app/server/dist/index.js

