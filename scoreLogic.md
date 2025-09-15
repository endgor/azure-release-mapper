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

### Synonym Expansion System
**Location**: `frontend/src/lib/match.ts:10-54`

Azure service tokens are expanded using comprehensive synonym maps:
- **Identity**: `"azure ad"` ↔ `"entra id"` ↔ `"microsoft entra"`
- **Compute**: `"virtual machines"` ↔ `"vms"` ↔ `"vm"`
- **Storage**: `"cosmos db"` ↔ `"cosmosdb"` ↔ `"azure cosmos"`
- **Networking**: `"application gateway"` ↔ `"app gateway"` ↔ `"appgw"`

### Text Scoring Function (`scoreText`)
**Location**: `frontend/src/lib/match.ts:202-265`

Input text is lowercased and scored based on:

1. **Provider Token Matching**:
   - Best token selection: longest matching token preferred
   - **Generic token penalty**: 50% score reduction for `compute`, `storage`, `network`, `data`, `web`, `security`, `management`
   - Base score: `weights.provider`
   - Reason logged: `"provider token: <token>"` or `"provider token (generic): <token>"`

2. **Resource Token Matching**:
   - Primary: Direct substring check across all resource tokens
   - Fallback: Fuzzy matching via Fuse.js (threshold: 0.35)
   - **Specificity bonus**: +20% for tokens longer than 8 characters
   - **Generic token penalty**: 50% score reduction for generic tokens
   - Fuzzy hit accepted when best score < 0.25
   - Reason logged: `"resource token (exact): <token>"` or `"resource token (fuzzy): <token>"`

3. **Score capped at ≤ 1.0**

### Advanced Scoring Factors

#### 1. Inventory Prevalence Boost
**Location**: `frontend/src/lib/match.ts:313-319`

Resources with higher inventory counts receive score boosts using sigmoid function:
```
prevalence = resourceCount / maxResourceCount
prevalenceBoost = 0.12 * (1 / (1 + exp(-6 * (prevalence - 0.5))) - 0.5) * 2
```
- **High-count resources** (>50% of max): +6% to +11% boost
- **Low-count resources** (<50% of max): -11% to -6% penalty
- Reason: `"prevalence boost: +X%"`

#### 2. Lifecycle/Change-Type Modifiers
**Location**: `frontend/src/lib/match.ts:151-186`

Critical lifecycle keywords receive priority boosts:
- **Breaking Changes** (+20%): `breaking change`, `retirement`, `deprecation`, `deprecated`, `breaking`
- **General Availability** (+12%): `generally available`, `general availability`, `ga`, `ga:`
- **Preview Features** (+8%): `preview`, `public preview`, `private preview`
- **Security Issues** (+10%): `security`, `vulnerability`

#### 3. Recency Decay with Critical Exceptions
**Location**: `frontend/src/lib/match.ts:126-149`

Recent releases receive priority with 60-day exponential decay:
```
decay = exp(-daysSincePublished / 60)  // 60-day half-life
recencyBoost = 0.15 * decay
```
- **Recent releases** (1-30 days): +9% to +15% boost
- **Older releases** (60+ days): +2% to +6% boost
- **Critical keyword floor**: Minimum 50% decay for breaking/security/GA releases
- Reason: `"recency boost: +X% (Yd old)"`

### Heuristic Scoring Per Release

For each resource type, compute base score `s`:

1. **Title Scoring**: `scoreText(title, { provider: 0.25, resource: 0.45 })`
2. **Summary Scoring**: `0.5 × scoreText(summary, { provider: 0.2, resource: 0.25 })`
3. **Category Bonus**: `+0.1` for non-generic provider tokens in categories (reduced from 0.15)
   - **Generic token exclusion**: Skip `compute`, `storage`, `network`, etc.
   - **Minimum token length**: 4+ characters only
   - Reason: `"provider in categories: <token>"`
4. **Lifecycle Modifiers**: Apply change-type boosts
5. **Prevalence Boost**: Apply inventory-based adjustment
6. **Recency Boost**: Apply time-based priority

**Final heuristic score**: `min(base_score + prevalence + recency, 1.0)`
**Inclusion threshold**: Only releases with `s ≥ 0.5` (50%) become matches

### Regional Adjustment (Optional)
**Location**: `frontend/src/lib/match.ts:358-430`

1. **Region Detection**: Extract mentioned regions from title, summary, and categories using curated synonym map
   - Examples: `"westeurope"` → `"west europe"`, `"eastus2"` → `"east us 2"`

2. **Enhanced Coverage Calculation**:
   - **Coverage ratio**: `overlapCount / max(1, mentionedRegions.size)`
   - **Region strength boost**: `min(0.15, 0.15 × coverage)` (up to 15% based on coverage)

3. **Adjustment Logic**:
   - **No region mentions**: No adjustment
   - **Region mismatch**: `score = max(0, baseScore × 0.6)` (40% penalty)
     - Reason: `"region mismatch"`
   - **Region overlap**: Apply coverage-based boost
     - Reason: `"region boost: +X% (Y/Z regions)"`

### Per-Resource Result Aggregation

For each resource type:
- **`matchedReleases`**: All releases with `s ≥ 0.5`, sorted by:
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
- **Category bonus**: `+0.1` (reduced from 0.15, with generic token restrictions)

### Advanced Scoring Factors
- **Prevalence boost**: `±12%` (sigmoid-based, inventory count dependent)
- **Recency boost**: `+15%` max (exponential decay, 60-day half-life)
- **Lifecycle modifiers**: Breaking `+20%`, GA `+12%`, Preview `+8%`, Security `+10%`
- **Generic token penalty**: `50%` score reduction
- **Specificity bonus**: `+20%` for tokens >8 characters

### Thresholds
- **Match inclusion**: `0.5` (50%, increased from 30%)
- **Fuse.js threshold**: `0.35`
- **Fuzzy acceptance score**: `< 0.25`
- **AI confidence minimum**: `0.4` (40%)
- **Minimum token length**: `3 characters` (4+ for categories)
- **Critical keyword decay floor**: `50%` (prevents burial of important releases)

### Regional Adjustments
- **Mismatch penalty**: `× 0.6` (40% reduction)
- **Coverage-based boost**: `+0% to +15%` (based on region overlap ratio)
- **Regional adjustment cap**: `1.0` (100%)

## User Interface

### Score Visualization
- **Green (≥70%)**: High relevance - Strong keyword matches with advanced factors
- **Yellow (50-69%)**: Good relevance - Solid matches found
- **Hidden (<50%)**: Below threshold, not displayed (default 50%, user-configurable)

### User-Configurable Threshold
- **Default threshold**: 50% (increased from 30% for better signal-to-noise ratio)
- **Slider range**: 20% to 80%
- **Real-time filtering**: Results update immediately as threshold changes
- **Threshold description**: "Show only highly relevant releases"

### Filtering Impact
Filters (months/status/tags/score) recompute per-row `filteredScore` as max of `max(relevanceScore, aiConfidence)` across visible releases, then re-sort rows by filtered score.

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

1. **Tokenization**: Generate searchable keywords from resource types with synonym expansion
2. **Base Heuristic Scoring**: Apply weighted text matching (title > summary > categories)
   - Generic token penalties and specificity bonuses applied
3. **Advanced Factor Integration**:
   - **Inventory prevalence boost**: Sigmoid-based adjustment for resource count frequency
   - **Lifecycle modifiers**: Priority for breaking/GA/preview/security releases
   - **Recency decay**: Exponential time-based scoring with critical keyword floors
4. **Regional Adjustment**: Coverage-based geographical relevance scoring
5. **Threshold Filtering**: Apply 50% threshold (user-configurable) to determine matches
6. **AI Augmentation**: Enhance with ML-based confidence and impact summaries
7. **Final Ranking**: Sort by combined scores with resource count tiebreaker
8. **Interactive Display**: Present with score visualization, filtering, and detailed match reasoning