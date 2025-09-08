import type { MatchResult } from './types'

export function downloadResultsCsv(results: MatchResult[]) {
  const rows = [
    ['resource_type', 'resource_count', 'overall_score', 'match_count', 'matches', 'top_impact_summary']
  ]
  for (const r of results) {
    const matches = r.matchedReleases.slice(0, 10).map(m => `${m.title} (${m.link})`).join('; ')
    rows.push([
      r.resourceType,
      String(r.resourceCount),
      r.overallScore.toFixed(2),
      String(r.matchedReleases.length),
      matches,
      r.topImpactSummary ?? ''
    ])
  }
  const csv = rows.map(r => r.map(cell => escapeCsv(cell)).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'azure-release-analyzer-results.csv'
  a.click()
  URL.revokeObjectURL(url)
}

function escapeCsv(v: string) {
  if (v == null) return ''
  const s = String(v)
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return '"' + s.replace(/"/g, '""') + '"'
  }
  return s
}

