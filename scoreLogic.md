# CloudOps Release Mapper - Scoring Logic

## Overview
The CloudOps Release Mapper ranks Azure release notes against a customer's Azure inventory by resource type, producing per-resource matches with a 0–1 relevance score and an overall score used for sorting. The system combines heuristic keyword scoring with optional region adjustments and AI augmentation.

## Core Components

### Inputs
- **`resourceTypes`**: Map of `resourceType -> count` from customer inventory (e.g., `Microsoft.Compute/virtualMachines`)
- **`releases`**: Array of release items with `title`, `summary`, `categories`, and `published` fields
- **Regional mode** (optional): `RegionAwareInventory` with `byType` map and `regions` set containing canonical region names

### Tokenization Process

#### Resource Tokens (from resource part)
Generated from resource path segments (e.g., `virtualMachines/extensions`):
- **Full joined words**: `"virtual machines"`
- **Compact joined**: `"virtualmachines"` (no spaces)
- **Bi-grams**: `"virtual machines"` → includes `"virtual machines"` bi-grams
- **Singular tweak**: `"machines"` → `"machine"` (drop trailing 's')
- **Azure prefixed**: `"azure virtual machines"`

#### Provider Tokens (from provider part)
Generated from provider string (e.g., `Microsoft.Compute`):
- **Lowercased provider**: `"microsoft.compute"`
- **Shortened provider**: `"compute"` (without `Microsoft.`)
- **Word-split short name**: `"compute"`
- **Azure combinations**: `"azure compute"`
- **Resource combinations**: `"azure compute virtual machines"`, `"azure virtual machines"`

## Scoring Mechanics

### Text Scoring Function (`scoreText`)
**Location**: `frontend/src/lib/match.ts:61-82`

Input text is lowercased and scored based on:

1. **Provider Token Matching**:
   - If any provider token (length ≥ 3) is a substring → add `weights.provider`
   - Only one provider match counted (breaks on first hit)
   - Reason logged: `"provider token: <token>"`

2. **Resource Token Matching**:
   - Primary: Direct substring check across all resource tokens
   - Fallback: Fuzzy matching via Fuse.js (threshold: 0.35)
   - Fuzzy hit accepted when best score < 0.25
   - On match → add `weights.resource`
   - Reason logged: `"resource token match"`

3. **Score capped at ≤ 1.0**

### Heuristic Scoring Per Release

For each resource type, compute score `s` from release fields:

1. **Title Scoring**: `scoreText(title, { provider: 0.25, resource: 0.45 })`
2. **Summary Scoring**: `0.5 × scoreText(summary, { provider: 0.2, resource: 0.25 })`
3. **Category Bonus**: `+0.15` if any category contains any provider token (case-insensitive)
   - Reason: `"provider in categories"`

**Final score**: `s = min(title_score + summary_score + category_bonus, 1.0)`
**Inclusion threshold**: Only releases with `s ≥ 0.3` (30%) become matches

### Regional Adjustment (Optional)
**Location**: `frontend/src/lib/match.ts:190-208`

1. **Region Detection**: Extract mentioned regions from title, summary, and categories using curated synonym map
   - Examples: `"westeurope"` → `"west europe"`, `"eastus2"` → `"east us 2"`

2. **Adjustment Logic**:
   - **No region mentions**: No adjustment
   - **Region mismatch**: `score = max(0, baseScore × 0.6)` (40% penalty)
     - Reason: `"region mismatch"`
   - **Region overlap**: `score = min(1, baseScore + 0.1)` (10% boost)
     - Reason: `"region match"`

### Per-Resource Result Aggregation

For each resource type:
- **`matchedReleases`**: All releases with `s ≥ 0.3`, sorted by:
  1. `relevanceScore` descending
  2. `published` date descending
- **`overallScore`**: `max(m.relevanceScore)` across all `matchedReleases` (0 if none)

**Final results**: Sorted by `overallScore` descending, tie-breaker `resourceCount` descending

## AI Augmentation (Optional)
**Location**: `frontend/src/lib/ai.ts:18-79`

### Process
1. **Batching**: Process releases in batches of 10 to avoid rate limits
2. **API Call**: Server-side model returns matches with `resource_type`, `confidence`, and `impact_summary`
3. **Integration**:
   - **Existing matches**: Set `aiConfidence` and `aiSummary` fields
   - **New matches**: Add if `confidence ≥ 0.4` with `relevanceScore = confidence` and reason `"AI-matched"`

### Post-AI Adjustments
- **Sorting within resource**: Primary by `published` descending, then by `max(relevanceScore, aiConfidence)` descending  
- **Overall score**: `max(max(m.relevanceScore, m.aiConfidence))` across all matches
- **Top impact**: `aiSummary` of first (most recent) matched release

## Key Parameters & Defaults

### Scoring Weights
- **Title**: provider `0.25`, resource `0.45` (total max: 0.7)
- **Summary**: provider `0.2`, resource `0.25`, multiplied by `0.5` (total max: 0.225)
- **Category bonus**: `+0.15`

### Thresholds
- **Match inclusion**: `0.3` (30%)
- **Fuse.js threshold**: `0.35`
- **Fuzzy acceptance score**: `< 0.25`
- **AI confidence minimum**: `0.4` (40%)
- **Minimum token length**: `3 characters`

### Regional Adjustments
- **Mismatch penalty**: `× 0.6` (40% reduction)
- **Match boost**: `+ 0.1` (10% increase, capped at 1.0)

## User Interface

### Score Visualization
- **Green (≥70%)**: High relevance - Strong keyword matches
- **Yellow (50-69%)**: Good relevance - Some matches found  
- **Orange (30-49%)**: Lower relevance - Weak/fuzzy matches
- **Hidden (<30%)**: Below threshold, not displayed

### Filtering Impact
Filters (months/status/tags) recompute per-row `filteredScore` as max of `max(relevanceScore, aiConfidence)` across visible releases, then re-sort rows by filtered score.

## Data Export

### CSV Format
Columns: `resource_type`, `resource_count`, `overall_score`, `match_count`, `matches`, `top_impact_summary`
- **`matches`**: Concatenates up to 10 `"title (link)"` pairs
- **`overall_score`**: Formatted to 2 decimal places

## File Locations
- **Core heuristics & regional logic**: `frontend/src/lib/match.ts`
- **Type definitions**: `frontend/src/lib/types.ts`
- **AI augmentation**: `frontend/src/lib/ai.ts`
- **UI display & filtering**: `frontend/src/components/ResultsTable.tsx`
- **CSV export**: `frontend/src/lib/download.ts`

## Scoring Flow Summary

1. **Tokenization**: Generate searchable keywords from resource types
2. **Heuristic Scoring**: Apply weighted text matching (title > summary > categories)
3. **Regional Adjustment**: Modify scores based on geographical relevance
4. **Filtering**: Apply 30% threshold to determine matches
5. **AI Augmentation**: Enhance with ML-based confidence and summaries
6. **Ranking**: Sort by final scores with resource count tiebreaker
7. **Display**: Present with color-coded relevance indicators and detailed match reasons