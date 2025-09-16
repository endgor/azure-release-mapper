import type { MatchResult, ReleaseItem } from './types'

export function buildAiPayload(release: ReleaseItem, resourceTypes: string[]) {
  return { release: { title: release.title, summary: release.summary, id: release.id, link: release.link, published: release.published }, resourceTypes }
}

export async function analyzeWithOllama(payload: any) {
  const res = await fetch('/api/ai/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  if (!res.ok) throw new Error('Ollama call failed')
  return res.json()
}

function applyAiMatch(byType: Map<string, MatchResult>, rel: ReleaseItem, match: any) {
  const row = byType.get(String(match?.resource_type ?? ''))
  if (!row) return
  const conf = Number(match?.confidence ?? 0)
  const summary = String(match?.impact_summary ?? '')
  const existing = row.matchedReleases.find(x => x.id === rel.id)
  if (existing) {
    existing.aiSummary = summary
    existing.aiConfidence = conf
  } else if (conf >= 0.4) {
    row.matchedReleases.push({
      id: rel.id,
      title: rel.title,
      link: rel.link,
      published: rel.published,
      relevanceScore: conf,
      reasons: ['AI-matched'],
      aiSummary: summary,
      aiConfidence: conf
    })
  }
}

async function processRelease(rel: ReleaseItem, resourceTypes: string[], byType: Map<string, MatchResult>) {
  try {
    const out = await analyzeWithOllama(buildAiPayload(rel, resourceTypes))
    for (const match of Array.isArray(out?.matches) ? out.matches : []) {
      applyAiMatch(byType, rel, match)
    }
  } catch {
  }
}

function finalize(byType: Map<string, MatchResult>): MatchResult[] {
  return Array.from(byType.values(), row => {
    row.matchedReleases.sort((a, b) => {
      const ta = Date.parse(a.published || '') || 0
      const tb = Date.parse(b.published || '') || 0
      if (tb !== ta) return tb - ta
      const as = Math.max(a.relevanceScore, a.aiConfidence ?? 0)
      const bs = Math.max(b.relevanceScore, b.aiConfidence ?? 0)
      return bs - as
    })
    row.overallScore = row.matchedReleases.length ? Math.max(...row.matchedReleases.map(m => Math.max(m.relevanceScore, m.aiConfidence ?? 0))) : 0
    row.topImpactSummary = row.matchedReleases[0]?.aiSummary
    return row
  }).sort((a, b) => (b.overallScore - a.overallScore) || (b.resourceCount - a.resourceCount))
}

export async function aiAugment(
  releases: ReleaseItem[],
  initial: MatchResult[]
): Promise<MatchResult[]> {
  const byType = new Map(initial.map(r => [r.resourceType, r]))
  const resourceTypes = initial.map(r => r.resourceType)
  const batchSize = 10

  for (let i = 0; i < releases.length; i += batchSize) {
    for (const rel of releases.slice(i, i + batchSize)) {
      await processRelease(rel, resourceTypes, byType)
    }
  }

  return finalize(byType)
}
