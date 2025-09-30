# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CloudOps Azure Release Mapper is a full-stack web application that matches Azure release announcements to a user's existing infrastructure. Users upload CSV exports of their Azure resources, and the app correlates them with Azure RSS feed updates using intelligent heuristic scoring.

**Tech Stack:**
- Frontend: React + TypeScript + Vite + Tailwind CSS
- Backend: Node.js + Express + TypeScript
- Deployment: Docker, Azure Container Apps, GitHub Actions CI/CD

## Development Commands

### Frontend (port 5173)
```bash
cd frontend
npm install
npm run dev        # Start Vite dev server
npm run build      # Build for production
```

### Backend (port 8787)
```bash
cd server
npm install
npm run dev        # Start Express server with tsx watch
npm run build      # Compile TypeScript to dist/
npm start          # Run compiled dist/index.js
```

In development, the frontend proxies API calls to `http://localhost:8787/api/rss`.

### Docker
```bash
docker build -t cloudops-release-mapper .
docker run -p 8787:8787 cloudops-release-mapper
```

The Dockerfile is a multi-stage build that:
1. Builds the frontend (Vite) → `dist/`
2. Builds the server (TypeScript) → `dist/`
3. Copies the frontend build into `server/dist/public/`
4. Runs the Node.js server on port 8787, which serves both API and static frontend

## Architecture

### Data Flow
1. **CSV Upload**: User uploads Azure Portal "All resources" export or CloudOps environment export
2. **CSV Parsing** (`frontend/src/lib/csv.ts`): Auto-detects format (Azure vs CloudOps), normalizes resource types and regions into `RegionAwareInventory`
3. **RSS Feed Fetch** (`server/src/rss.ts`, `frontend/src/lib/rss.ts`): Backend fetches Azure Updates RSS feed, frontend calls `/api/rss`
4. **Matching Logic** (`frontend/src/lib/match.ts`): Core heuristic algorithm matches releases to resources
5. **Results Display** (`frontend/src/components/ResultsTable.tsx`): Shows matched releases sorted by relevance score

### Core Matching Algorithm

The matching logic in `frontend/src/lib/match.ts` implements a heuristic scoring system optimized for precision over recall. The algorithm uses title and category matching to avoid false positives.

**Service Matching Strategy (Title + Categories Only):**
- Service names MUST appear in the announcement **title** OR **categories** to create a match
- Summaries/descriptions are NOT used for service matching (only for lifecycle keywords)
- This prevents false positives from tangential mentions like "Network security perimeter now supports storage accounts"

**Category Conflict Detection:**
If an announcement has "Networking" in categories but NOT "Storage", it won't match storage accounts even if mentioned. This ensures announcements are matched to their primary service.

Key functions:

- **`matchReleases()`**: Main entry point that orchestrates the matching pipeline
- **`baseMatchScore()`**: Computes base relevance score:
  - Title match: 70% × mapping confidence (e.g., 0.7 × 0.9 = 63% for high-confidence service)
  - Category match: 20% for service in categories
  - Lifecycle modifiers: breaking +20%, GA +12%, security +8% (scans title + summary)
  - Frequency boost: logarithmic scaling based on resource prevalence
  - Recency boost: exponential decay favoring recent announcements
- **`adjustForRegionsAndResourceTypes()`**: Regional scoring adjustments:
  - Region match: +20% for user region overlap
  - Global release: +3-5% for worldwide rollouts
  - Region mismatch: -30% or -50% for limited rollouts
- **`matchServiceInTitle()`**: Word-boundary regex matching in title
- **`matchServiceInCategories()`**: Keyword matching in RSS categories

**Azure Service Mappings** (`frontend/src/lib/azureResourceMapping.ts`):
- Maps Microsoft resource types (e.g., `microsoft.compute/virtualmachines`) to common RSS feed names
- Each mapping has a confidence weight (0.0-1.0)
- Covers Compute, Network, Storage, Database, App Services, Containers, AI/ML, Security, Monitoring

**CSV Parsing** (`frontend/src/lib/csv.ts`):
- Detects Azure Portal vs CloudOps export format by headers
- Normalizes resource types: lowercases, handles `Microsoft.*` prefix variations
- Normalizes regions: comprehensive mapping of Azure region names/aliases/codes
- Returns `RegionAwareInventory` with `byType: Map<string, number>` and `regions: Set<string>`

### UI State Management

`frontend/src/App.tsx` manages the full UI lifecycle:
- Loads RSS feed on mount
- Handles CSV upload → parsing → analysis → results display
- Animates transitions between uploader and results views
- Provides "Upload New File" and "Download CSV" actions

### API Endpoints

- `GET /api/rss`: Fetches Azure Updates RSS feed (proxied through backend to avoid CORS)
- `GET /*`: Serves static frontend from `dist/public/`

## Deployment

### GitHub Actions CI/CD
The `.github/workflows/deploy.yml` pipeline automatically:
1. Creates semantic version tags on push to `main`
2. Builds Docker image with multi-stage build
3. Pushes to Azure Container Registry (`acrcloudopsreleasemapper.azurecr.io`)
4. Deploys to Azure Container Apps (`ca-cloudops-release-mapper`)

**Required GitHub Secrets:**
- `AZURE_CLIENT_ID`
- `AZURE_TENANT_ID`
- `AZURE_SUBSCRIPTION_ID`

**Azure Resources:**
- Resource Group: `rg-cloudops-release-mapper`
- Container App: `ca-cloudops-release-mapper`
- ACR: `acrcloudopsreleasemapper`
- Region: `westeurope`

### Manual Deployment
```bash
# Build and push to ACR
az acr build -r acrcloudopsreleasemapper -t acrcloudopsreleasemapper.azurecr.io/cloudops-release-mapper:latest .

# Or use Bicep IaC
az deployment sub create -l westeurope -f infra/main.bicep -p infra/main.bicepparam
```

## Key Implementation Details

### Resource Type Normalization
- Azure format: `Microsoft.Compute/virtualMachines`
- CloudOps format: `type=Compute`, `sub_type=virtualMachines` → joined as `Compute/virtualMachines`
- All normalized to lowercase with preserved provider namespace

### Region Normalization
- Handles aliases: `weu` → `west europe`, `se` → `sweden central`
- City names: `paris` → `france central`, `dubai` → `uae north`
- Covers Europe, Americas, Asia Pacific, Middle East, Africa

### Scoring Thresholds
- Default threshold: `0.5` (50% relevance)
- Results sorted by `overallScore` (highest match per resource type), then by `resourceCount`
- Top 20 matches per resource type, max 50 total results displayed

### Frontend State Transitions
1. **Upload**: CSV uploader visible, header normal
2. **Analyzing**: Uploader collapsed, "Analysis in progress" card shown
3. **Results**: Results table visible, header compact, "Upload New File" and "Download CSV" buttons appear

## Common Tasks

**Add a new Azure service mapping:**
Edit `frontend/src/lib/azureResourceMapping.ts`, add entry to `AZURE_SERVICE_MAPPINGS`:
```typescript
'microsoft.newservice/resource': {
  rssNames: ['New Service', 'Azure New Service'],
  weight: 0.9  // confidence 0.0-1.0
}
```

**Adjust scoring algorithm:**
Modify weights/multipliers in `frontend/src/lib/match.ts`:
- Title match weight: line 97 (currently 0.7)
- Category match weight: line 112 (currently 0.2)
- Lifecycle modifiers: function `applyLifecycleModifiers` lines 119-143
- Frequency boost: function `applyFrequencyBoost` lines 161-165
- Recency decay: function `applyRecencyBoost` lines 145-159
- Regional boosts/penalties: function `adjustForRegionsAndResourceTypes` lines 279-332

**Change default threshold:**
Update `threshold` parameter in `matchReleases()` call in `frontend/src/App.tsx:49`

**Add new region:**
Update `REGION_KEYWORDS` in `frontend/src/lib/match.ts` and `normalizeRegion()` map in `frontend/src/lib/csv.ts`