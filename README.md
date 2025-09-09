# CloudOps Azure Release Mapper

CloudOps Azure Release Mapper helps you map Azure release notes to your existing environment. Upload an Azure Portal "All resources" CSV export or a CloudOps environment CSV export and quickly see which updates relate to your deployed resource types.

- Upload CSV (Azure or CloudOps), extract unique resource types
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

## CSV Inputs

- Export "All resources" CSV from Azure portal (include 'Resource Type' column in the export).
- Or export the CSV file from CloudOps portal.
- Upload either CSV in the app; both formats are auto-detected.

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

2) Option A — Build in Bicep with ACR Build
- Ensure your repo is publicly accessible or provide a URL including a token.
- Edit `infra/main.bicepparam` and set:
  - `doBuild = true`
  - `sourceRepoUrl = 'https://github.com/<org>/<repo>.git#<branch>'`
- Deploy infra (subscription scope). This will create RG + ACR, build and push the image in ACR, then create the Container App referencing that image:
  - `az deployment sub create -l westeurope -f infra/main.bicep -p infra/main.bicepparam`

3) Option B — Manual build then deploy
- Create RG and ACR first:
  - `az group create -n rg-cloudops-release-mapper -l westeurope`
  - `az acr create -n acrcloudopsreleasemapper -g rg-cloudops-release-mapper --sku Basic`
- Build and push the image (two choices):
  - Using ACR Build from this directory:
    - `az acr build -r acrcloudopsreleasemapper -t acrcloudopsreleasemapper.azurecr.io/cloudops-release-mapper:latest .`
  - Or local Docker then push:
    - `docker build -t cloudops-release-mapper:latest .`
    - `docker tag cloudops-release-mapper:latest acrcloudopsreleasemapper.azurecr.io/cloudops-release-mapper:latest`
    - `az acr login --name acrcloudopsreleasemapper`
    - `docker push acrcloudopsreleasemapper.azurecr.io/cloudops-release-mapper:latest`
- Deploy infra (subscription scope), referencing the pushed tag:
  - `az deployment sub create -l westeurope -f infra/main.bicep -p infra/main.bicepparam -p containerImageTag=latest`

3) Open the Container App URL output in the portal or via CLI

Notes
- The container runs the Node API and a local Ollama server (Phi-3.5 mini) in one process using `start.sh`.
- The frontend is served statically by the Node API; AI calls are sent to `/api/ai/analyze` which proxies to `127.0.0.1:11434`.
- No cloud AI services or API keys are used.
- If your region supports up to 4 vCPU / 8 GiB on Consumption, the Bicep selects the Consumption workload profile and requests 4/8. If deployment fails due to limits, reduce to 2 vCPU / 4 GiB in `infra/containerapp.bicep` or switch to a Dedicated profile.
