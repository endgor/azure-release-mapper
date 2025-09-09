import Fuse from 'fuse.js'
import type { ReleaseItem, MatchRelease, MatchResult, RegionAwareInventory } from './types'

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
          reasons,
          categories: rel.categories || []
        })
      }
    }

    // Sort by score (desc) primarily, then by published date (desc)
    matches.sort((a, b) => {
      if (b.relevanceScore !== a.relevanceScore) return b.relevanceScore - a.relevanceScore
      const ta = Date.parse(a.published || '') || 0
      const tb = Date.parse(b.published || '') || 0
      return tb - ta
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

// --- Region-aware extensions ---

// Minimal Azure region list and common synonyms for detection in free text
const REGION_KEYWORDS: Record<string, string[]> = {
  'west europe': ['west europe', 'westeurope'],
  'north europe': ['north europe', 'northeurope', 'ireland'],
  'sweden central': ['sweden central', 'swedencentral'],
  'sweden south': ['sweden south', 'swedensouth'],
  'east us': ['east us', 'eastus'],
  'east us 2': ['east us 2', 'eastus 2', 'eastus2'],
  'west us': ['west us', 'westus'],
  'west us 2': ['west us 2', 'westus 2', 'westus2'],
  'uk south': ['uk south', 'uksouth'],
  'uk west': ['uk west', 'ukwest'],
  'southeast asia': ['southeast asia', 'southeastasia', 'singapore'],
  'east asia': ['east asia', 'hong kong'],
  'japan east': ['japan east', 'tokyo'],
  'japan west': ['japan west', 'osaka'],
  'australia east': ['australia east', 'sydney'],
  'australia southeast': ['australia southeast', 'melbourne'],
  'central india': ['central india', 'pune'],
  'south india': ['south india', 'chennai'],
  'india south': ['india south', 'chennai'],
  'india central': ['india central', 'pune'],
  'korea central': ['korea central', 'seoul'],
  'canada central': ['canada central', 'toronto'],
  'brazil south': ['brazil south', 'sao paulo'],
  'germany west central': ['germany west central', 'frankfurt'],
  'switzerland north': ['switzerland north', 'zurich'],
  'france central': ['france central', 'paris'],
  'norway east': ['norway east', 'oslo'],
  'uae north': ['uae north', 'dubai'],
  'south africa north': ['south africa north', 'johannesburg'],
  'qatar central': ['qatar central', 'doha'],
  'indonesia': ['indonesia', 'indonesia central', 'indonesia west'],
  'malaysia': ['malaysia', 'malaysia south', 'malaysia west'],
}

function extractMentionedRegions(text: string): Set<string> {
  const t = text.toLowerCase()
  const out = new Set<string>()
  for (const [canonical, tokens] of Object.entries(REGION_KEYWORDS)) {
    for (const tok of tokens) {
      if (t.includes(tok)) { out.add(canonical); break }
    }
  }
  return out
}

function adjustForRegions(baseScore: number, rel: ReleaseItem, userRegions: Set<string>, reasons: string[]): number {
  const regions = new Set<string>()
  const add = (s?: string) => { for (const r of extractMentionedRegions(String(s || ''))) regions.add(r) }
  add(rel.title)
  add(rel.summary)
  // Categories sometimes contain geography; include them too
  for (const c of (rel as any).categories || []) add(String(c))

  if (regions.size === 0) return baseScore // not region-specific → no adjustment

  const hasOverlap = Array.from(regions).some(r => userRegions.has(r))
  if (!hasOverlap) {
    reasons.push('region mismatch')
    return Math.max(0, baseScore * 0.6) // down-weight if only other regions are mentioned
  } else {
    reasons.push('region match')
    return Math.min(1, baseScore + 0.1) // small boost when explicitly in-customer regions
  }
}

export function matchReleasesRegional(
  inventory: RegionAwareInventory,
  releases: ReleaseItem[],
  threshold = 0.3
): MatchResult[] {
  const { byType, regions: userRegions } = inventory
  const results: MatchResult[] = []
  for (const [rt, count] of byType.entries()) {
    const { provider, resource } = splitResourceType(rt)
    const resourceWords = toWords(resource).split(' ').filter(Boolean)
    const resourceTokens = tokensFromResource(resource)
    const providerTokens = tokensFromProvider(provider, resourceWords)

    const matches: MatchRelease[] = []
    for (const rel of releases) {
      const reasons: string[] = []
      let s = 0
      s += scoreText(rel.title || '', providerTokens, resourceTokens, reasons, { provider: 0.25, resource: 0.45 })
      s += 0.5 * scoreText(rel.summary || '', providerTokens, resourceTokens, reasons, { provider: 0.2, resource: 0.25 })
      if ((rel as any).categories && (rel as any).categories.some((c: string) => providerTokens.some(pt => c.toLowerCase().includes(pt)))) {
        s += 0.15
        reasons.push('provider in categories')
      }
      // Region adjustment
      s = adjustForRegions(Math.min(s, 1), rel, userRegions, reasons)
      s = Math.min(s, 1)
      if (s >= threshold) {
        matches.push({
          id: rel.id,
          title: rel.title,
          link: rel.link,
          published: rel.published,
          relevanceScore: s,
          reasons,
          categories: (rel as any).categories || []
        })
      }
    }

    matches.sort((a, b) => {
      if (b.relevanceScore !== a.relevanceScore) return b.relevanceScore - a.relevanceScore
      const ta = Date.parse(a.published || '') || 0
      const tb = Date.parse(b.published || '') || 0
      return tb - ta
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
