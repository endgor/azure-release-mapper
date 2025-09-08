# CloudOps Azure Release Mapper

CloudOps Azure Release Mapper helps you map Azure release notes to your existing environment. Upload an Azure Portal "All resources" CSV export and quickly see which updates relate to your deployed resource types.

- Upload CSV, extract unique resource types
- Fetch Azure release notes RSS via API proxy
- Match updates to resource types (heuristics + optional local Ollama AI)
- View results and download as CSV

See PLAN.md for full technical details. This deployment uses Ollama (Phi-3.5 mini) locally inside the container — no API keys or external AI services required.

## Quickstart

Prereqs: Node.js 20+, pnpm or npm

Frontend
- cd frontend
- pnpm install
- pnpm dev (Vite dev server on 5173)

Server
- cd server
- pnpm install
- pnpm dev (Express server on 8787)

In development, the frontend will call `http://localhost:8787/api/rss` for the RSS feed.

## Build and Deploy (Azure Container Apps)

Container image name: `cloudops-release-mapper`
Container App: `ca-cloudops-release-mapper`
Resource Group: `rg-cloudops-release-mapper`
ACR: `acrcloudopsreleasemapper`
Location: `westeurope`

1) Build and push image to ACR
- `docker build -t acrcloudopsreleasemapper.azurecr.io/cloudops-release-mapper:latest .`
- `az acr login --name acrcloudopsreleasemapper`
- `docker push acrcloudopsreleasemapper.azurecr.io/cloudops-release-mapper:latest`

2) Deploy infra with Bicep (subscription scope)
- `az deployment sub create -l westeurope -f infra/main.bicep -p infra/main.bicepparam`

3) Open the Container App URL output in the portal or via CLI

Notes
- The container runs the Node API and a local Ollama server (Phi-3.5 mini) in one process using `start.sh`.
- The frontend is served statically by the Node API; AI calls are sent to `/api/ai/analyze` which proxies to `127.0.0.1:11434`.
- No cloud AI services or API keys are used.
- On the Container Apps Consumption environment, per-replica limits cap at 2 vCPU / 4 Gi. The Bicep sets these values to meet platform limits. If you require 4 vCPU / 8 Gi, switch to a Dedicated workload profile and set `workloadProfileName` accordingly.
