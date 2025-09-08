import type { MatchResult, ReleaseItem } from './types'

export function buildAiPayload(release: ReleaseItem, resourceTypes: string[]) {
  const text = `You are matching Azure release notes to Azure Resource Manager resource types from Azure Portal. Map the single release provided to zero or more of the resource types below.\n\nImportant: Azure product names often differ from ARM types. For example: Microsoft.Logic/workflows ≈ Azure Logic Apps; Microsoft.Web/sites ≈ App Service; Microsoft.Network/publicIPAddresses ≈ Public IP addresses; Microsoft.Storage/storageAccounts ≈ Storage accounts. Prefer correct Azure product naming when reasoning, but only return the ARM types given.\n\nRelease:\nTitle: ${release.title}\nSummary: ${release.summary}\n\nARM resource types (choose from these only):\n${resourceTypes.join(', ')}\n\nReturn strictly valid JSON array with items: {"resource_type": string, "confidence": number (0-1), "impact_summary": string (<= 40 words)}. Do not include any extra keys or text.`
  return {
    contents: [
      { parts: [{ text }] }
    ]
  }
}

export async function analyzeWithGemini(apiKey: string, payload: any) {
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
  )
  if (!res.ok) throw new Error('Gemini call failed')
  return res.json()
}

export async function aiAugment(
  apiKey: string,
  releases: ReleaseItem[],
  initial: MatchResult[]
): Promise<MatchResult[]> {
  if (!apiKey) return initial
  const byType = new Map(initial.map(r => [r.resourceType, r]))
  const resourceTypes = initial.map(r => r.resourceType)

  // Batch up to 15 releases to avoid rate/size issues
  const batchSize = 10
  for (let i = 0; i < releases.length; i += batchSize) {
    const batch = releases.slice(i, i + batchSize)
    for (const rel of batch) {
      const payload = buildAiPayload(rel, resourceTypes)
      try {
        const out = await analyzeWithGemini(apiKey, payload)
        // Gemini response structure: extract text from candidates
        const text = out?.candidates?.[0]?.content?.parts?.[0]?.text ?? '[]'
        let arr: any[] = []
        try { arr = JSON.parse(text) } catch { arr = [] }
        for (const m of arr) {
          const rt = String(m.resource_type ?? '')
          const conf = Number(m.confidence ?? 0)
          const summary = String(m.impact_summary ?? '')
          const row = byType.get(rt)
          if (!row) continue
          // find release match in row or add if missing and confidence decent
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
        // ignore AI errors per plan; keep heuristic results
      }
    }
  }

  // Recompute overall score and top impact summaries
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
