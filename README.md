# CloudOps Azure Release Mapper

CloudOps Azure Release Mapper helps you map Azure release notes to your existing environment. Upload an Azure Portal "All resources" CSV export and quickly see which updates relate to your deployed resource types.

- Upload CSV, extract unique resource types
- Fetch Azure release notes RSS via API proxy
- Match updates to resource types (heuristics + optional Gemini AI)
- View results and download as CSV

See PLAN.md for full technical details.

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
