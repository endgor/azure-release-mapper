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

export async function aiAugment(
  releases: ReleaseItem[],
  initial: MatchResult[]
): Promise<MatchResult[]> {
  const byType = new Map(initial.map(r => [r.resourceType, r]))
  const resourceTypes = initial.map(r => r.resourceType)

  const batchSize = 10
  for (let i = 0; i < releases.length; i += batchSize) {
    const batch = releases.slice(i, i + batchSize)
    for (const rel of batch) {
      const payload = buildAiPayload(rel, resourceTypes)
      try {
        const out = await analyzeWithOllama(payload)
        const arr: any[] = Array.isArray(out?.matches) ? out.matches : []
        for (const m of arr) {
          const rt = String(m.resource_type ?? '')
          const conf = Number(m.confidence ?? 0)
          const summary = String(m.impact_summary ?? '')
          const row = byType.get(rt)
          if (!row) continue
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
      } catch {
      }
    }
  }

  for (const r of byType.values()) {
    r.matchedReleases.sort((a, b) => {
      const ta = Date.parse(a.published || '') || 0
      const tb = Date.parse(b.published || '') || 0
      if (tb !== ta) return tb - ta
      const as = Math.max(a.relevanceScore, a.aiConfidence ?? 0)
      const bs = Math.max(b.relevanceScore, b.aiConfidence ?? 0)
      return bs - as
    })
    r.overallScore = r.matchedReleases.length ? Math.max(...r.matchedReleases.map(m => Math.max(m.relevanceScore, m.aiConfidence ?? 0))) : 0
    r.topImpactSummary = r.matchedReleases[0]?.aiSummary
  }

  return Array.from(byType.values()).sort((a, b) => (b.overallScore - a.overallScore) || (b.resourceCount - a.resourceCount))
}
