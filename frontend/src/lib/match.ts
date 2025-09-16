import Fuse from 'fuse.js'
import type { ReleaseItem, MatchRelease, MatchResult, RegionAwareInventory } from './types'

function splitResourceType(rt: string) {
  const [provider, ...rest] = rt.split('/')
  const resource = rest.join('/')
  return { provider, resource }
}

const AZURE_SYNONYMS: Record<string, string[]> = {
  // Identity and Access
  'azure ad': ['entra id', 'microsoft entra', 'azure active directory', 'active directory'],
  'entra id': ['azure ad', 'microsoft entra', 'azure active directory', 'active directory'],

  // Networking
  'app gateway': ['application gateway', 'appgw'],
  'application gateway': ['app gateway', 'appgw'],

  // Storage and Data
  'key vault': ['azure key vault', 'keyvault'],
  'cosmos db': ['cosmosdb', 'azure cosmos', 'cosmos database'],
  'data explorer': ['kusto', 'azure data explorer'],
  'kusto': ['data explorer', 'azure data explorer'],

  // Compute (be more specific to avoid overly broad matches)
  'virtual machines': ['vms', 'vm', 'azure vm'],
  'vm': ['virtual machines', 'vms', 'azure vm'],
  'disks': ['disk storage', 'azure disk', 'managed disks', 'premium ssd', 'ultra disk'],
  'disk storage': ['disks', 'azure disk', 'managed disks'],

  // Containers
  'kubernetes service': ['aks', 'azure kubernetes'],
  'aks': ['kubernetes service', 'azure kubernetes'],
  'container registry': ['acr', 'azure container registry'],
  'acr': ['container registry', 'azure container registry'],

  // AI/ML
  'cognitive services': ['ai services', 'azure ai'],
  'ai services': ['cognitive services', 'azure ai'],

  // Monitoring
  'monitor': ['azure monitor', 'monitoring'],
  'log analytics': ['logs', 'azure logs'],

  // Web
  'app service': ['web apps', 'azure app service', 'webapp'],
  'web apps': ['app service', 'azure app service', 'webapp'],

  // Security
  'security center': ['defender', 'azure defender', 'microsoft defender'],
  'defender': ['security center', 'azure defender', 'microsoft defender']
}

const GENERIC_TOKENS = ['compute', 'storage', 'networking', 'security', 'management', 'analytics', 'integration']

function expandWithSynonyms(tokens: string[]): string[] {
  const expanded = [...tokens]

  for (const token of tokens) {
    const synonyms = AZURE_SYNONYMS[token.toLowerCase()]
    if (synonyms) {
      expanded.push(...synonyms)
    }
  }

  return Array.from(new Set(expanded.filter(Boolean)))
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
    for (let i = 0; i < words.length - 1; i++) {
      base.push(`${words[i]} ${words[i + 1]}`)
    }
    const last = words[words.length - 1]
    if (last.endsWith('s')) {
      const singular = last.replace(/s+$/, '')
      base.push([...words.slice(0, -1), singular].join(' '))
    }
    base.push('azure ' + joined)
  }
  return expandWithSynonyms(Array.from(new Set(base.filter(Boolean))))
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
  return expandWithSynonyms(Array.from(new Set(t.filter(Boolean))))
}

function hasCriticalKeywords(text: string): boolean {
  const lowerText = text.toLowerCase()
  const criticalKeywords = [
    'breaking change', 'retirement', 'deprecation', 'deprecated', 'breaking',
    'generally available', 'general availability', ' ga ', 'ga:',
    'security', 'vulnerability'
  ]
  return criticalKeywords.some(keyword => lowerText.includes(keyword))
}

function applyRecencyBoost(publishedDate: string | undefined, text: string, reasons: string[]): number {
  if (!publishedDate) return 0

  const publishedTime = Date.parse(publishedDate)
  if (!publishedTime) return 0

  const daysSincePublished = (Date.now() - publishedTime) / (1000 * 60 * 60 * 24)
  let decay = Math.exp(-daysSincePublished / 60)

  if (hasCriticalKeywords(text)) {
    decay = Math.max(decay, 0.5)
  }

  const recencyWeight = 0.15
  const recencyBoost = recencyWeight * decay

  if (recencyBoost > 0.01) {
    const daysText = Math.round(daysSincePublished)
    reasons.push(`recency boost: +${Math.round(recencyBoost * 100)}% (${daysText}d old)`)
  }

  return recencyBoost
}

function applyLifecycleModifiers(text: string, reasons: string[]): number {
  const lowerText = text.toLowerCase()

  // High-impact keywords
  const breakingKeywords = ['breaking change', 'retirement', 'deprecation', 'deprecated', 'breaking']
  for (const keyword of breakingKeywords) {
    if (lowerText.includes(keyword)) {
      reasons.push(`lifecycle: ${keyword} (+20%)`)
      return 0.2
    }
  }

  // GA/Release keywords
  const gaKeywords = ['generally available', 'general availability', ' ga ', 'ga:']
  for (const keyword of gaKeywords) {
    if (lowerText.includes(keyword)) {
      reasons.push(`lifecycle: GA (+12%)`)
      return 0.12
    }
  }

  // Security/Fix keywords
  const securityKeywords = ['security', 'bug fix', 'vulnerability', 'patch']
  for (const keyword of securityKeywords) {
    if (lowerText.includes(keyword)) {
      reasons.push(`lifecycle: ${keyword} (+8%)`)
      return 0.08
    }
  }

  // Cost/Billing keywords
  const costKeywords = ['price', 'billing', 'cost', 'pricing']
  for (const keyword of costKeywords) {
    if (lowerText.includes(keyword)) {
      reasons.push(`lifecycle: ${keyword} (+8%)`)
      return 0.08
    }
  }

  // Preview keywords (lower priority)
  const previewKeywords = ['preview', 'public preview', 'private preview', 'beta']
  for (const keyword of previewKeywords) {
    if (lowerText.includes(keyword)) {
      reasons.push(`lifecycle: ${keyword} (+6%)`)
      return 0.06
    }
  }

  return 0
}

function scoreText(text: string, providerTokens: string[], resourceTokens: string[], reasons: string[], weights: {provider:number,resource:number}) {
  let score = 0
  const t = text.toLowerCase()

  let bestProviderToken = ''
  for (const tok of providerTokens) {
    if (tok.length < 3) continue
    if (t.includes(tok)) {
      // Prefer longer, more specific tokens
      if (tok.length > bestProviderToken.length) {
        bestProviderToken = tok
      }
    }
  }

  if (bestProviderToken) {
    let providerScore = weights.provider
      if (GENERIC_TOKENS.includes(bestProviderToken)) {
      providerScore *= 0.5 // 50% penalty for generic tokens
      reasons.push(`provider token (generic): ${bestProviderToken}`)
    } else {
      reasons.push(`provider token: ${bestProviderToken}`)
    }
    score += providerScore
  }

  const fuse = new Fuse(resourceTokens.map(x => ({ t: x })), { keys: ['t'], includeScore: true, threshold: 0.35 })
  let bestResourceToken = ''
  let isExactMatch = false

  for (const tok of resourceTokens) {
    if (tok.length < 3) continue
    if (t.includes(tok)) {
      if (tok.length > bestResourceToken.length) {
        bestResourceToken = tok
        isExactMatch = true
      }
    }
  }

  if (!bestResourceToken) {
    const res = fuse.search(t)
    if (res.length > 0 && (res[0].score ?? 1) < 0.25) {
      bestResourceToken = res[0].item.t
      isExactMatch = false
    }
  }

  if (bestResourceToken) {
    let resourceScore = weights.resource
      if (bestResourceToken.length > 8) {
      resourceScore *= 1.2 // 20% bonus for specific tokens
    }
      if (GENERIC_TOKENS.includes(bestResourceToken)) {
      resourceScore *= 0.5 // 50% penalty
    }

    const matchType = isExactMatch ? 'exact' : 'fuzzy'
    reasons.push(`resource token (${matchType}): ${bestResourceToken}`)
    score += resourceScore
  }

  return Math.min(score, 1)
}

function baseMatchScore(
  rel: ReleaseItem,
  providerTokens: string[],
  resourceTokens: string[],
  reasons: string[],
  count: number,
  maxResourceCount: number,
  categories: string[]
): number {
  let score = 0
  score += scoreText(rel.title || '', providerTokens, resourceTokens, reasons, { provider: 0.25, resource: 0.45 })
  score += 0.5 * scoreText(rel.summary || '', providerTokens, resourceTokens, reasons, { provider: 0.2, resource: 0.25 })

  // Categories bonus - much more restrictive
  if (categories.length) {
    let categoryScore = 0
    const normalizedCategories = categories.map(c => c.toLowerCase())
    for (const pt of providerTokens) {
      if (pt.length < 4 || GENERIC_TOKENS.includes(pt)) continue
      if (normalizedCategories.some(c => c.includes(pt))) {
        categoryScore = 0.1 // Reduced from 0.15
        reasons.push(`provider in categories: ${pt}`)
        break
      }
    }
    score += categoryScore
  }

  const lifecycleText = `${rel.title || ''} ${rel.summary || ''}`
  score += applyLifecycleModifiers(lifecycleText, reasons)
  score = Math.min(score, 1)

  // Inventory prevalence boost - higher scores for resource types you have more of
  const prevalence = count / maxResourceCount
  const prevalenceBoost = 0.12 * (1 / (1 + Math.exp(-6 * (prevalence - 0.5))) - 0.5) * 2
  score = Math.min(1, score + prevalenceBoost)
  if (prevalenceBoost > 0.01) {
    reasons.push(`prevalence boost: +${Math.round(prevalenceBoost * 100)}%`)
  }

  // Recency boost with critical keyword exceptions
  return score + applyRecencyBoost(rel.published, lifecycleText, reasons)
}

function buildMatchResults(
  resourceTypes: Map<string, number>,
  releases: ReleaseItem[],
  threshold: number,
  adjust?: (score: number, rel: ReleaseItem, reasons: string[]) => number
): MatchResult[] {
  const results: MatchResult[] = []
  const maxResourceCount = Math.max(...resourceTypes.values())

  for (const [rt, count] of resourceTypes.entries()) {
    const { provider, resource } = splitResourceType(rt)
    const resourceWords = toWords(resource).split(' ').filter(Boolean)
    const resourceTokens = tokensFromResource(resource)
    const providerTokens = tokensFromProvider(provider, resourceWords)
    const matches: MatchRelease[] = []

    for (const rel of releases) {
      const reasons: string[] = []
      const categories = ((rel as any).categories || []) as string[]
      let score = baseMatchScore(rel, providerTokens, resourceTokens, reasons, count, maxResourceCount, categories)
      if (adjust) score = Math.min(1, adjust(score, rel, reasons))

      if (score >= threshold) {
        matches.push({
          id: rel.id,
          title: rel.title,
          link: rel.link,
          published: rel.published,
          relevanceScore: score,
          reasons,
          categories
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

export function matchReleases(
  resourceTypes: Map<string, number>,
  releases: ReleaseItem[],
  threshold = 0.5
): MatchResult[] {
  return buildMatchResults(resourceTypes, releases, threshold)
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
  const mentionedRegions = new Set<string>()
  const add = (s?: string) => { for (const r of extractMentionedRegions(String(s || ''))) mentionedRegions.add(r) }
  add(rel.title)
  add(rel.summary)
  // Categories sometimes contain geography; include them too
  for (const c of (rel as any).categories || []) add(String(c))

  if (mentionedRegions.size === 0) {
    // No regions mentioned - check for global indicators
    const globalText = `${rel.title || ''} ${rel.summary || ''}`.toLowerCase()
    if (userRegions.size >= 3 && !globalText.includes('selected regions') && !globalText.includes('limited regions')) {
      // Global release for multi-region tenant gets small boost
      reasons.push('global release (+3%)')
      return Math.min(1, baseScore + 0.03)
    }
    return baseScore // no adjustment for single-region tenants
  }

  // Calculate region coverage ratio
  const overlappingRegions = Array.from(mentionedRegions).filter(r => userRegions.has(r))
  const overlapCount = overlappingRegions.length

  if (overlapCount === 0) {
    // No overlap - apply mismatch penalty
    const globalText = `${rel.title || ''} ${rel.summary || ''}`.toLowerCase()
    if (globalText.includes('selected regions') || globalText.includes('limited regions')) {
      // Harsh penalty for explicitly limited rollouts
      reasons.push('region mismatch (limited rollout)')
      return Math.max(0, baseScore * 0.5)
    } else {
      // Standard mismatch penalty
      reasons.push('region mismatch')
      return Math.max(0, baseScore * 0.6)
    }
  } else {
    // Calculate coverage-based boost
    const coverage = overlapCount / Math.max(1, mentionedRegions.size)
    const regionStrengthBoost = Math.min(0.15, 0.15 * coverage)

    // Additional boost if mentioned explicitly in title
    const titleBoost = overlappingRegions.some(region =>
      (rel.title || '').toLowerCase().includes(region.replace(' ', '')) ||
      (rel.title || '').toLowerCase().includes(region)
    ) ? 0.03 : 0

    const totalBoost = regionStrengthBoost + titleBoost
    reasons.push(`region match: ${overlapCount}/${mentionedRegions.size} regions (+${Math.round(totalBoost * 100)}%)`)

    return Math.min(1, baseScore + totalBoost)
  }
}

export function matchReleasesRegional(
  inventory: RegionAwareInventory,
  releases: ReleaseItem[],
  threshold = 0.5
): MatchResult[] {
  const { byType, regions } = inventory
  return buildMatchResults(byType, releases, threshold, (score, rel, reasons) =>
    adjustForRegions(score, rel, regions, reasons)
  )
}
