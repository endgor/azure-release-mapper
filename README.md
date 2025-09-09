# CloudOps Azure Release Mapper

A full-stack web application that helps CloudOps teams map Azure release notes to their existing infrastructure. Simply upload a CSV export of your Azure resources and discover which Azure updates are relevant to your deployed services.

## Overview

This application intelligently matches Azure release announcements to your specific resource types using:
- **CSV Upload**: Support for both Azure Portal "All resources" exports and CloudOps environment exports
- **Azure Release Feed**: Real-time Azure release notes via RSS feed
- **AI-Powered Matching**: Local Ollama AI (Phi-3.5 mini) for intelligent release-to-resource correlation
- **Export Results**: Download matched results as CSV for reporting and tracking

**Key Benefits:**
- No external API keys required (uses local AI)
- Supports both Azure and CloudOps CSV formats
- Fast, intelligent matching of releases to your infrastructure
- Self-contained deployment with Docker

## Tech Stack

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **AI**: Local Ollama (Phi-3.5 mini model)
- **Deployment**: Docker + Azure Container Apps
- **CI/CD**: GitHub Actions

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

## Deployment

### Automated Deployment (GitHub Actions)
The project includes a complete CI/CD pipeline that automatically builds and deploys to Azure Container Apps on every push to main:

1. **Setup Azure Authentication** (one-time):
   - Create Azure App Registration with federated identity for GitHub
   - Add these secrets to your GitHub repository:
     - `AZURE_CLIENT_ID`
     - `AZURE_TENANT_ID` 
     - `AZURE_SUBSCRIPTION_ID`

2. **Push to main branch** - GitHub Actions will automatically:
   - Build the Docker image
   - Push to Azure Container Registry
   - Deploy to Azure Container Apps
   - Create semantic version tags

### Manual Deployment Options

**Azure Resources:**
- Resource Group: `rg-cloudops-release-mapper`
- Container App: `ca-cloudops-release-mapper`  
- ACR: `acrcloudopsreleasemapper`
- Location: `westeurope`

#### Option A: Bicep Infrastructure-as-Code
```bash
# Deploy complete infrastructure with build
az deployment sub create -l westeurope -f infra/main.bicep -p infra/main.bicepparam
```

#### Option B: Manual ACR Build & Push
```bash
# Create resources
az group create -n rg-cloudops-release-mapper -l westeurope
az acr create -n acrcloudopsreleasemapper -g rg-cloudops-release-mapper --sku Basic

# Build and push
az acr build -r acrcloudopsreleasemapper -t acrcloudopsreleasemapper.azurecr.io/cloudops-release-mapper:latest .

# Deploy infrastructure
az deployment sub create -l westeurope -f infra/main.bicep -p infra/main.bicepparam
```

### Architecture Notes
- Single container runs Node.js API + local Ollama AI server
- Frontend served statically by the API
- No external API keys or cloud AI services required
- Supports 2-4 vCPU / 4-8 GiB depending on region limits
