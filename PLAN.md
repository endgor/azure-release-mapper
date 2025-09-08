# CloudOps Azure Release Mapper — Project Plan

## Overview
A modern, web-based tool that ingests an Azure "All resources" CSV export, extracts unique resource types (e.g., `Microsoft.Logic/workflows`, `Microsoft.Network/publicIPAddresses`), fetches the latest Azure release notes from the official RSS feed, and analyzes which updates are relevant to the resources found. The app presents matched insights in a clean, user-friendly UI with options to export results to CSV. Optional AI (Google Gemini) augments the rule-based matching to improve relevance and generate human-friendly impact summaries.

- Input: CSV exported from Azure Portal “All resources” blade (columns: `NAME, RESOURCE GROUP, LOCATION, SUBSCRIPTION, RESOURCE TYPE, TYPE`).
- Feed: Azure release notes RSS: `https://www.microsoft.com/releasecommunications/api/v2/azure/rss`.
- Output: Table of resource types with relevant release notes, confidence/impact, and download as CSV.

## Goals
- Parse Azure CSV and extract unique `RESOURCE TYPE` values reliably.
- Fetch and cache the Azure release notes RSS feed.
- Map releases to resource types via rule-based heuristics; optionally enhance using Gemini.
- Provide a modern, clean UI with the following homepage features:
  - Header with title and description
  - Input for Gemini API key with confirm
  - CSV file upload
  - Analyze button
  - Results table
  - Download results as CSV
- Keep user’s Gemini key on the client; do not store serverside.

## Non-Goals
- No Azure Resource Graph/API calls. Input is CSV only.
- No user authentication/authorization.
- No server-side storage of user-provided CSV or API keys.

## Architecture
Two simple deployment options are supported; choose based on hosting preference:

1) Static SPA + Minimal API Proxy (Recommended starter)
- Frontend: React + TypeScript + Vite + Tailwind CSS (static hosting OK)
- Backend: Minimal Node/Express (or Fastify) proxy for RSS fetch/caching
- Client calls Gemini directly using the user-provided API key

2) Full-stack Next.js (Alternative)
- Next.js App Router for pages + API routes (`/api/rss` proxy)
- Client still calls Gemini directly with user key (or optional proxy)

Both options deliver the same features. This plan details option (1) by default.

### High-level Data Flow
1. User uploads CSV (client-only parsing)
2. Client extracts unique resource types
3. Client requests `/api/rss` to fetch cached RSS JSON (avoid CORS and reduce latency)
4. Client performs rule-based matching; optionally invokes Gemini for enhanced mapping/summary
5. Client renders results table and offers CSV download

### Services & Integrations
- RSS Feed: Microsoft release communications RSS
- AI: Google Gemini (v1beta `gemini-2.0-flash:generateContent`)
- Optional: Playwright MCP server for design analysis of Azure Updates page (dev-only inspiration)

## Data Model
- ResourceType
  - `name`: string (from CSV `RESOURCE TYPE`, e.g., `Microsoft.Logic/workflows`)
  - `count`: number (occurrences in CSV)

- ReleaseItem
  - `id`: string (stable guid or hash of link+title)
  - `title`: string
  - `link`: string
  - `published`: ISO string
  - `summary`: string (description/teaser)
  - `categories`: string[] (if present)
  - `providerTokens`: string[] (derived tokens)

- MatchResult (one row per resource type)
  - `resourceType`: string
  - `resourceCount`: number
  - `matchedReleases`: Array<{
      id: string
      title: string
      link: string
      published: string
      relevanceScore: number
      reasons: string[]
      aiSummary?: string
      aiConfidence?: number
    }>
  - `topImpactSummary`: string (AI-optional)
  - `overallScore`: number (e.g., max of matched scores)

## CSV Handling
- Expect CSV columns: `NAME, RESOURCE GROUP, LOCATION, SUBSCRIPTION, RESOURCE TYPE, TYPE`.
- Use a robust CSV parser (e.g., `papaparse`) in the browser.
- Trim, normalize whitespace, preserve original casing for display, but compute lowercased tokens for matching.
- Extract unique `RESOURCE TYPE` values and count occurrences for weighting impact.

Pseudocode:
```ts
import Papa from 'papaparse';

function parseCsv(file: File): Promise<string[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (res) => {
        const types = new Map<string, number>();
        for (const row of res.data as any[]) {
          const rt = String(row['RESOURCE TYPE'] || '').trim();
          if (!rt) continue;
          types.set(rt, (types.get(rt) ?? 0) + 1);
        }
        resolve(Array.from(types.keys()));
      },
      error: reject,
    });
  });
}
```

## RSS Fetching & Caching (API Proxy)
- Endpoint: `GET /api/rss`
- Behavior: fetch the Microsoft RSS, convert to JSON, cache in-memory for 15 minutes (configurable), return normalized items.
- Consider using `rss-parser` on the server. Normalize fields and strip HTML.
- Add conservative timeout/retry and ETag/Last-Modified if available.

Express outline:
```ts
import express from 'express';
import Parser from 'rss-parser';

const app = express();
const parser = new Parser();
let cache: { ts: number; items: any[] } | null = null;

app.get('/api/rss', async (req, res) => {
  try {
    const now = Date.now();
    if (cache && now - cache.ts < 15 * 60_000) {
      return res.json({ items: cache.items });
    }
    const feed = await parser.parseURL('https://www.microsoft.com/releasecommunications/api/v2/azure/rss');
    const items = (feed.items || []).map(i => ({
      id: (i.guid || i.link || i.title) ?? '',
      title: i.title ?? '',
      link: i.link ?? '',
      published: i.isoDate || i.pubDate || '',
      summary: (i.contentSnippet || i.content || '').toString(),
      categories: i.categories || [],
    }));
    cache = { ts: now, items };
    res.json({ items });
  } catch (e) {
    res.status(502).json({ error: 'Failed to fetch RSS' });
  }
});
```

## Matching Algorithm
Start with deterministic heuristics; optionally enhance with AI.

1) Tokenization
- From resource type `Microsoft.Provider/resourceName[/child]`, derive tokens:
  - `provider` (e.g., `Microsoft.Network`)
  - `resource` (e.g., `publicIPAddresses` => tokens: `public ip address`, `publicip`, `public ip`)
  - lowercased, split camelCase and punctuation

2) Rule-based Scoring (0.0–1.0)
- Title exact contains provider => +0.3
- Title fuzzy contains resource tokens => +0.4
- Summary contains provider => +0.1
- Summary contains resource tokens => +0.2
- Category/tag contains provider or resource => +0.2
- Cap at 1.0; minimum threshold for “relevant” default 0.4
- Use a simple fuzzy library like `fuse.js` or custom n-gram similarity for token matches

3) AI-assisted Classification (optional)
- When a Gemini API key is present, augment results:
  - Provide the resource type list and a single release note (title + summary)
  - Ask Gemini to return likely resource types (limited to provided list) with confidence and 1–2 sentence impact
  - Merge with rule-based scores: `final = max(ruleScore, aiConfidence)`

Prompt sketch:
```json
{
  "contents": [{
    "parts": [{
      "text": "You are matching Azure release notes to resource types. Given this release and these resource types, return a JSON array of matches (resource_type, confidence[0-1], impact_summary[<=40 words]).\n\nRelease:\nTitle: <title>\nSummary: <summary>\n\nResource types:\n<comma-separated list>\n\nRules: Only choose from the provided resource types. Return strictly valid JSON array."
    }]
  }]
}
```

4) Result Aggregation
- For each resource type, collect matched releases with scores, reasons, and AI summaries
- Compute `overallScore = max(relevanceScore)` and add `resourceCount` weight if desired

## Frontend
- Stack: React + TypeScript + Vite + Tailwind CSS
- State: lightweight (React Query optional for `/api/rss` caching)
- Accessibility: keyboard focus states, proper semantics, color contrast

### Homepage UI (required elements)
- Header: tool title + brief description
- API Key Input: text input, masked; “Save” button; persist in `localStorage`
- CSV Upload: file input; show parsed count and unique resource types
- Analyze Button: disabled until both CSV parsed and RSS available
- Results Table:
  - Columns: Resource Type, Count, Matches (#), Top Impact, Max Score, Actions (View, Copy link)
  - Row expand: show matched releases (title, link, published, score, AI summary)
- Download CSV Button: export current results

### Design
- Take inspiration from Azure Updates: clean typography, ample whitespace, subtle cards, category chips
- Tailwind utilities: `container`, `grid`, `card`-like sections, `text-slate-*`, `bg-slate-*`
- Responsive: single-column mobile, two-column desktop layout

## Gemini Integration
- Endpoint: `POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`
- Header: `X-goog-api-key: <user-key>`, `Content-Type: application/json`
- Call from browser using fetch; store key only in memory/localStorage per user action
- Batch small sets (e.g., 10–20 releases) to manage token usage; cache AI results in-memory for session

Example fetch:
```ts
async function analyzeWithGemini(apiKey: string, payload: any) {
  const res = await fetch(
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': apiKey,
      },
      body: JSON.stringify(payload),
    }
  );
  if (!res.ok) throw new Error('Gemini call failed');
  return res.json();
}
```

## Security & Privacy
- Do not send the CSV to the server; process client-side
- Do not persist the Gemini key server-side; user may store in localStorage
- Rate-limit `/api/rss` and cache aggressively to avoid abuse
- Sanitize rendered content; never render raw HTML from RSS
- Use CORS only for `/api/rss` if needed; keep origin tight if hosted with a separate frontend domain

## Performance
- RSS cache TTL 15 minutes
- Debounce CSV parsing status and analysis triggers
- Lazy render long tables; virtualize when rows > 200
- AI batching and memoization per release item by ID

## Error Handling
- CSV validation: missing `RESOURCE TYPE` column -> show actionable message
- RSS fetch: show retry with exponential backoff
- AI calls: fall back to rule-based matching and flag rows as “AI unavailable”

## Project Structure (Option 1: SPA + API)
```
cloudops-azure-release-mapper/
  frontend/
    index.html
    src/
      main.tsx
      App.tsx
      components/
        Header.tsx
        ApiKeyInput.tsx
        CsvUploader.tsx
        AnalyzeButton.tsx
        ResultsTable.tsx
      lib/
        csv.ts
        rss.ts
        match.ts
        ai.ts
      styles/
        index.css
    package.json
    vite.config.ts
    tailwind.config.ts
  server/
    src/
      index.ts
      rss.ts
    package.json
    tsconfig.json
  PLAN.md
  README.md
```

## Build & Run
- Prereqs: Node.js 20+, pnpm or npm

Frontend:
- `cd frontend`
- `pnpm install`
- `pnpm dev` (Vite dev server)
- `pnpm build` -> static assets in `dist/`

Server:
- `cd server`
- `pnpm install`
- `pnpm dev` (ts-node nodemon) or `pnpm start`

Deployment:
- Host `frontend/dist` on static hosting (e.g., Azure Static Web Apps)
- Host server on Azure App Service / Azure Container Apps, and configure frontend to call the server base URL

## Testing Strategy
- Unit tests (Vitest/Jest):
  - CSV parsing: handles headers, trims, extracts unique types
  - Tokenization: provider/resource token derivation
  - Matching: rule-based scoring correctness and thresholds
  - RSS normalization: convert feed items to `ReleaseItem`
- Integration tests:
  - End-to-end flow with mock RSS (controlled fixtures)
  - AI-off path: ensure results appear purely via heuristics
- E2E (Playwright):
  - Upload CSV -> analyze -> table populates -> download CSV

## Accessibility
- Semantic HTML for tables, buttons, and headings
- Keyboard navigable controls, visible focus states
- ARIA labels for file input and action buttons
- Color contrast aligned with WCAG AA

## Optional: Playwright MCP for Design Inspiration
- Use the Playwright MCP server in a dev-only script to snapshot `https://azure.microsoft.com/en-us/updates/` structure (DOM and CSS tokens) for design inspiration
- Document extracted spacing, typography scale, and chip styles; do not copy proprietary assets

## Future Enhancements
- Add provider-level filters (e.g., show only `Microsoft.Network/*`)
- Group results by provider, with aggregate insight
- User-defined keyword mappings for specific resource names
- Server-side AI proxy for advanced classification without exposing user keys (optional mode)

## Appendix

### Expected CSV Columns
- `NAME, RESOURCE GROUP, LOCATION, SUBSCRIPTION, RESOURCE TYPE, TYPE`

### Downloaded Results CSV Schema
- Columns:
  - `resource_type`
  - `resource_count`
  - `overall_score`
  - `match_count`
  - `matches` (semicolon-separated titles with links)
  - `top_impact_summary`

### Example AI Payload Builder
```ts
function buildAiPayload(release: ReleaseItem, resourceTypes: string[]) {
  const text = `You are matching Azure release notes to resource types.\n\nRelease:\nTitle: ${release.title}\nSummary: ${release.summary}\n\nResource types:\n${resourceTypes.join(', ')}\n\nReturn JSON array of {resource_type, confidence: 0-1, impact_summary(<=40 words)}. Only use provided resource types.`;
  return {
    contents: [
      { parts: [{ text }] }
    ]
  };
}
```

---
This plan provides the technical blueprint to implement the CloudOps Azure Release Mapper with a clean, modern UI, reliable CSV ingestion, cached RSS retrieval, robust rule-based matching, and optional Gemini-powered insights — while keeping user data and keys on the client.
