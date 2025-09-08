import Fuse from 'fuse.js'
import type { ReleaseItem, MatchRelease, MatchResult } from './types'

function splitResourceType(rt: string) {
  // Format: Microsoft.Provider/resourceName[/child]
  const [provider, ...rest] = rt.split('/')
  const resource = rest.join('/')
  return { provider, resource }
}

function toWords(s: string) {
  return s
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .toLowerCase()
    .trim()
}

function tokensFromResource(resource: string): string[] {
  const parts = resource.split('/')
  const words = parts.map(toWords).join(' ').split(' ').filter(Boolean)
  const base: string[] = []
  if (words.length) {
    const joined = words.join(' ')
    const compact = words.join('')
    base.push(joined, compact)
    // bi-grams
    for (let i = 0; i < words.length - 1; i++) {
      base.push(`${words[i]} ${words[i + 1]}`)
    }
    // singular/plural tweak for trailing 's'
    const last = words[words.length - 1]
    if (last.endsWith('s')) {
      const singular = last.replace(/s+$/, '')
      base.push([...words.slice(0, -1), singular].join(' '))
    }
    // Azure-friendly
    base.push('azure ' + joined)
  }
  return Array.from(new Set(base.filter(Boolean)))
}

function tokensFromProvider(provider: string, resourceWords: string[]): string[] {
  const t: string[] = []
  const p = provider || ''
  const pLc = p.toLowerCase()
  const short = p.replace(/^Microsoft\./i, '')
  const shortWords = toWords(short)
  if (p) t.push(pLc)
  if (short) t.push(short.toLowerCase())
  if (shortWords) t.push(shortWords)
  if (shortWords) t.push('azure ' + shortWords)
  if (resourceWords.length) {
    const resJoined = resourceWords.join(' ')
    t.push(`azure ${shortWords} ${resJoined}`.trim())
    t.push(`azure ${resJoined}`.trim())
  }
  return Array.from(new Set(t.filter(Boolean)))
}

function scoreText(text: string, providerTokens: string[], resourceTokens: string[], reasons: string[], weights: {provider:number,resource:number}) {
  let score = 0
  const t = text.toLowerCase()
  // provider tokens
  for (const tok of providerTokens) {
    if (tok.length < 3) continue
    if (t.includes(tok)) { score += weights.provider; reasons.push(`provider token: ${tok}`); break }
  }
  // resource tokens
  const fuse = new Fuse(resourceTokens.map(x => ({ t: x })), { keys: ['t'], includeScore: true, threshold: 0.35 })
  let resourceHit = false
  for (const tok of resourceTokens) {
    if (tok.length < 3) continue
    if (t.includes(tok)) { resourceHit = true; break }
  }
  if (!resourceHit) {
    const res = fuse.search(t)
    if (res.length > 0 && (res[0].score ?? 1) < 0.25) resourceHit = true
  }
  if (resourceHit) { score += weights.resource; reasons.push('resource token match') }
  return Math.min(score, 1)
}

export function matchReleases(
  resourceTypes: Map<string, number>,
  releases: ReleaseItem[],
  threshold = 0.3
): MatchResult[] {
  const results: MatchResult[] = []
  for (const [rt, count] of resourceTypes.entries()) {
    const { provider, resource } = splitResourceType(rt)
    const resourceWords = toWords(resource).split(' ').filter(Boolean)
    const resourceTokens = tokensFromResource(resource)
    const providerTokens = tokensFromProvider(provider, resourceWords)

    const matches: MatchRelease[] = []
    for (const rel of releases) {
      const reasons: string[] = []
      let s = 0
      // Title heavy weights
      s += scoreText(rel.title || '', providerTokens, resourceTokens, reasons, { provider: 0.25, resource: 0.45 })
      // Summary moderate weights
      s += 0.5 * scoreText(rel.summary || '', providerTokens, resourceTokens, reasons, { provider: 0.2, resource: 0.25 })
      // Categories small bump
      if (rel.categories && rel.categories.some(c => providerTokens.some(pt => c.toLowerCase().includes(pt)))) {
        s += 0.15
        reasons.push('provider in categories')
      }
      s = Math.min(s, 1)
      if (s >= threshold) {
        matches.push({
          id: rel.id,
          title: rel.title,
          link: rel.link,
          published: rel.published,
          relevanceScore: s,
          reasons
        })
      }
    }

    // Sort by published date desc, then by score desc
    matches.sort((a, b) => {
      const ta = Date.parse(a.published || '') || 0
      const tb = Date.parse(b.published || '') || 0
      if (tb !== ta) return tb - ta
      return b.relevanceScore - a.relevanceScore
    })
    const overall = matches.length ? Math.max(...matches.map(m => m.relevanceScore)) : 0
    results.push({
      resourceType: rt,
      resourceCount: count,
      matchedReleases: matches,
      overallScore: overall
    })
  }
  return results.sort((a, b) => (b.overallScore - a.overallScore) || (b.resourceCount - a.resourceCount))
}
