import type { ReleaseItem, MatchRelease, MatchResult, RegionAwareInventory } from './types'
import {
  getServiceNamesForResourceType,
  getMappingWeight,
  areRegionsMatching
} from './azureResourceMapping'

const CATEGORY_MAPPINGS: Record<string, { patterns: string[]; rssKeywords: string[] }> = {
  'compute': {
    patterns: ['microsoft.compute/', 'microsoft.batch/'],
    rssKeywords: ['Virtual Machines', 'Compute', 'Batch']
  },
  'network': {
    patterns: ['microsoft.network/', 'microsoft.cdn/', 'microsoft.peering/'],
    rssKeywords: ['Networking', 'Virtual Network', 'ExpressRoute', 'Load Balancer', 'VPN', 'DNS', 'Firewall', 'Front Door', 'CDN', 'Traffic Manager', 'Bastion', 'NAT']
  },
  'storage': {
    patterns: ['microsoft.storage/', 'microsoft.storagesync/', 'microsoft.netapp/', 'microsoft.classicstorage/', 'microsoft.storagecache/', 'microsoft.elasticsan/'],
    rssKeywords: ['Storage', 'Blob', 'File', 'Queue', 'Table', 'Disk']
  },
  'database': {
    patterns: ['microsoft.sql/', 'microsoft.documentdb/', 'microsoft.cache/', 'microsoft.dbfor'],
    rssKeywords: ['SQL', 'Database', 'Cosmos', 'MySQL', 'PostgreSQL', 'Redis', 'MariaDB']
  },
  'web': {
    patterns: ['microsoft.web/'],
    rssKeywords: ['App Service', 'Function', 'Static Web']
  },
  'containers': {
    patterns: ['microsoft.container', 'microsoft.app/', 'microsoft.redhatopenshift/'],
    rssKeywords: ['Kubernetes', 'Container', 'AKS', 'ACR', 'ACI']
  },
  'ai': {
    patterns: ['microsoft.cognitive', 'microsoft.machinelearning', 'microsoft.botservice/', 'microsoft.search/'],
    rssKeywords: ['AI', 'Cognitive', 'Machine Learning', 'OpenAI', 'Bot']
  },
  'security': {
    patterns: ['microsoft.keyvault/', 'microsoft.security/', 'microsoft.aad/', 'microsoft.azureactivedirectory/'],
    rssKeywords: ['Security', 'Key Vault', 'Active Directory', 'Defender', 'Sentinel']
  },
  'monitoring': {
    patterns: ['microsoft.insights/', 'microsoft.operationalinsights/', 'microsoft.monitor/', 'microsoft.alertsmanagement/'],
    rssKeywords: ['Monitor', 'Log Analytics', 'Application Insights', 'Alerts']
  },
  'messaging': {
    patterns: ['microsoft.servicebus/', 'microsoft.eventhub/', 'microsoft.eventgrid/'],
    rssKeywords: ['Service Bus', 'Event Hub', 'Event Grid']
  },
  'iot': {
    patterns: ['microsoft.devices/', 'microsoft.iot', 'microsoft.digitaltwins/'],
    rssKeywords: ['IoT', 'Digital Twins']
  },
  'media': {
    patterns: ['microsoft.media/'],
    rssKeywords: ['Media Services']
  },
  'recovery': {
    patterns: ['microsoft.recoveryservices/', 'microsoft.dataprotection/'],
    rssKeywords: ['Site Recovery', 'Backup', 'Data Protection']
  },
  'analytics': {
    patterns: ['microsoft.datafactory/', 'microsoft.databricks/', 'microsoft.synapse/', 'microsoft.hdinsight/', 'microsoft.streamanalytics/'],
    rssKeywords: ['Data Factory', 'Databricks', 'Synapse', 'HDInsight', 'Stream Analytics']
  },
  'integration': {
    patterns: ['microsoft.apimanagement/', 'microsoft.logic/'],
    rssKeywords: ['API Management', 'Logic Apps']
  },
  'management': {
    patterns: ['microsoft.resources/', 'microsoft.authorization/', 'microsoft.automation/', 'microsoft.costmanagement/'],
    rssKeywords: ['Resource Manager', 'Policy', 'Automation', 'Cost Management']
  }
}

function getResourceTypeCategory(resourceType: string): string | null {
  const rt = resourceType.toLowerCase()

  for (const [category, { patterns }] of Object.entries(CATEGORY_MAPPINGS)) {
    if (patterns.some(pattern => rt.includes(pattern))) {
      return category
    }
  }

  return null
}

function hasConflictingCategories(resourceType: string, categories: string[]): boolean {
  const resourceCategory = getResourceTypeCategory(resourceType)
  if (!resourceCategory) return false

  const categoryKeywords = CATEGORY_MAPPINGS[resourceCategory]?.rssKeywords || []
  const hasMatchingCategory = categories.some(cat =>
    categoryKeywords.some(keyword => cat.toLowerCase().includes(keyword.toLowerCase()))
  )

  const otherCategories = Object.entries(CATEGORY_MAPPINGS)
    .filter(([key]) => key !== resourceCategory)

  for (const [_, { rssKeywords }] of otherCategories) {
    const hasOtherCategory = categories.some(cat =>
      rssKeywords.some(keyword => cat.toLowerCase().includes(keyword.toLowerCase()))
    )

    if (hasOtherCategory && !hasMatchingCategory) {
      return true
    }
  }

  return false
}

function matchServiceInTitle(title: string, resourceType: string): { score: number; matchedService: string | null } {
  const serviceNames = getServiceNamesForResourceType(resourceType)
  if (serviceNames.length === 0) {
    return { score: 0, matchedService: null }
  }

  const titleLower = title.toLowerCase()
  const mappingWeight = getMappingWeight(resourceType)

  for (const serviceName of serviceNames) {
    const normalized = serviceName.toLowerCase()
    const regex = new RegExp(`\\b${normalized.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i')

    if (regex.test(titleLower)) {
      const score = 0.7 * mappingWeight
      return { score, matchedService: serviceName }
    }
  }

  return { score: 0, matchedService: null }
}

function matchServiceInCategories(categories: string[], resourceType: string): { score: number; matchedService: string | null } {
  const serviceNames = getServiceNamesForResourceType(resourceType)
  if (serviceNames.length === 0) return { score: 0, matchedService: null }

  for (const serviceName of serviceNames) {
    const normalized = serviceName.toLowerCase()
    if (categories.some(cat => cat.toLowerCase().includes(normalized))) {
      return { score: 0.2, matchedService: serviceName }
    }
  }

  return { score: 0, matchedService: null }
}

function applyLifecycleModifiers(text: string): number {
  const lowerText = text.toLowerCase()

  if (['breaking change', 'retirement', 'deprecation', 'deprecated', 'breaking'].some(kw => lowerText.includes(kw))) {
    return 0.2
  }

  if (['generally available', 'general availability', ' ga ', 'ga:'].some(kw => lowerText.includes(kw))) {
    return 0.12
  }

  if (['security', 'bug fix', 'vulnerability', 'patch'].some(kw => lowerText.includes(kw))) {
    return 0.08
  }

  if (['price', 'billing', 'cost', 'pricing'].some(kw => lowerText.includes(kw))) {
    return 0.08
  }

  if (['preview', 'public preview', 'private preview', 'beta'].some(kw => lowerText.includes(kw))) {
    return 0.06
  }

  return 0
}

function applyRecencyBoost(publishedDate: string | undefined, isCritical: boolean): number {
  if (!publishedDate) return 0

  const publishedTime = Date.parse(publishedDate)
  if (!publishedTime) return 0

  const daysSincePublished = (Date.now() - publishedTime) / (1000 * 60 * 60 * 24)
  let decay = Math.exp(-daysSincePublished / 60)

  if (isCritical) {
    decay = Math.max(decay, 0.5)
  }

  return 0.15 * decay
}

function applyFrequencyBoost(count: number, maxResourceCount: number): number {
  const prevalence = count / maxResourceCount
  const frequencyMultiplier = Math.log10(count + 1) / Math.log10(maxResourceCount + 1)
  return 0.15 * (1 / (1 + Math.exp(-6 * (prevalence - 0.5))) - 0.5) * 2 * frequencyMultiplier
}

export function baseMatchScore(
  rel: ReleaseItem,
  resourceType: string,
  count: number,
  maxResourceCount: number,
  categories: string[],
  reasons: string[]
): number {
  if (hasConflictingCategories(resourceType, categories)) {
    reasons.push('category mismatch: different service category')
    return 0
  }

  const titleMatch = matchServiceInTitle(rel.title || '', resourceType)
  const categoryMatch = matchServiceInCategories(categories, resourceType)

  const hasServiceMatch = titleMatch.matchedService || categoryMatch.matchedService
  if (!hasServiceMatch) {
    return 0
  }

  let score = titleMatch.score + categoryMatch.score

  if (titleMatch.matchedService) {
    reasons.push(`title match: ${titleMatch.matchedService} (+${Math.round(titleMatch.score * 100)}%)`)
  }

  if (categoryMatch.matchedService) {
    reasons.push(`category match: ${categoryMatch.matchedService} (+${Math.round(categoryMatch.score * 100)}%)`)
  }

  const lifecycleText = `${rel.title || ''} ${rel.summary || ''}`
  const lifecycleBoost = applyLifecycleModifiers(lifecycleText)
  if (lifecycleBoost > 0) {
    score += lifecycleBoost
    reasons.push(`lifecycle boost: +${Math.round(lifecycleBoost * 100)}%`)
  }

  const frequencyBoost = applyFrequencyBoost(count, maxResourceCount)
  if (frequencyBoost > 0.01) {
    score += frequencyBoost
    reasons.push(`frequency boost: +${Math.round(frequencyBoost * 100)}% (${count} resources)`)
  }

  const isCritical = lifecycleText.toLowerCase().includes('breaking') ||
                     lifecycleText.toLowerCase().includes('security')
  const recencyBoost = applyRecencyBoost(rel.published, isCritical)
  if (recencyBoost > 0.01) {
    score += recencyBoost
    const days = Math.round((Date.now() - Date.parse(rel.published || '')) / (1000 * 60 * 60 * 24))
    reasons.push(`recency boost: +${Math.round(recencyBoost * 100)}% (${days}d old)`)
  }

  return Math.min(1, score)
}

const REGION_KEYWORDS: Record<string, string[]> = {
  'west europe': ['west europe', 'westeurope', 'weu', 'western europe'],
  'north europe': ['north europe', 'northeurope', 'ne', 'neu', 'ireland'],
  'sweden central': ['sweden central', 'swedencentral', 'sdc', 'se'],
  'sweden south': ['sweden south', 'swedensouth'],
  'uk south': ['uk south', 'uksouth', 'united kingdom south'],
  'uk west': ['uk west', 'ukwest', 'united kingdom west'],
  'france central': ['france central', 'francecentral', 'paris'],
  'france south': ['france south', 'francesouth'],
  'germany west central': ['germany west central', 'germanywestcentral', 'frankfurt'],
  'switzerland north': ['switzerland north', 'switzerlandnorth', 'zurich'],
  'norway east': ['norway east', 'norwayeast', 'oslo'],
  'east us': ['east us', 'eastus', 'eus', 'eastern us'],
  'east us 2': ['east us 2', 'eastus 2', 'eastus2', 'eus2'],
  'west us': ['west us', 'westus', 'wus', 'western us'],
  'west us 2': ['west us 2', 'westus 2', 'westus2', 'wus2'],
  'west us 3': ['west us 3', 'westus 3', 'westus3', 'wus3'],
  'central us': ['central us', 'centralus', 'cus'],
  'south central us': ['south central us', 'southcentralus', 'scus'],
  'north central us': ['north central us', 'northcentralus', 'ncus'],
  'canada central': ['canada central', 'canadacentral', 'toronto'],
  'canada east': ['canada east', 'canadaeast'],
  'brazil south': ['brazil south', 'brazilsouth', 'sao paulo'],
  'southeast asia': ['southeast asia', 'southeastasia', 'sea', 'singapore'],
  'east asia': ['east asia', 'eastasia', 'hong kong'],
  'japan east': ['japan east', 'japaneast', 'tokyo'],
  'japan west': ['japan west', 'japanwest', 'osaka'],
  'korea central': ['korea central', 'koreacentral', 'seoul'],
  'central india': ['central india', 'centralindia', 'pune'],
  'south india': ['south india', 'southindia', 'chennai'],
  'west india': ['west india', 'westindia', 'mumbai'],
  'australia east': ['australia east', 'australiaeast', 'sydney'],
  'australia southeast': ['australia southeast', 'australiasoutheast', 'melbourne'],
  'australia central': ['australia central', 'australiacentral'],
  'uae north': ['uae north', 'uaenorth', 'dubai', 'united arab emirates'],
  'south africa north': ['south africa north', 'southafricanorth', 'johannesburg'],
  'qatar central': ['qatar central', 'qatarcentral', 'doha'],
  'israel central': ['israel central', 'israelcentral'],
  'poland central': ['poland central', 'polandcentral', 'warsaw'],
  'italy north': ['italy north', 'italynorth', 'milan'],
  'spain central': ['spain central', 'spaincentral', 'madrid']
}

function extractMentionedRegions(text: string): Set<string> {
  const textLower = text.toLowerCase()
  const regions = new Set<string>()

  for (const [canonical, aliases] of Object.entries(REGION_KEYWORDS)) {
    if (aliases.some(alias => textLower.includes(alias))) {
      regions.add(canonical)
    }
  }

  return regions
}

export function adjustForRegionsAndResourceTypes(
  baseScore: number,
  rel: ReleaseItem,
  userRegions: Set<string>,
  reasons: string[]
): number {
  let adjustedScore = baseScore
  const feedText = `${rel.title || ''} ${rel.summary || ''}`

  const mentionedRegions = extractMentionedRegions(feedText)
  for (const category of (rel as any).categories || []) {
    for (const region of extractMentionedRegions(String(category))) {
      mentionedRegions.add(region)
    }
  }

  if (mentionedRegions.size === 0) {
    const globalText = feedText.toLowerCase()
    const hasGlobal = ['global', 'worldwide', 'all regions'].some(ind => globalText.includes(ind))
    const hasLimited = ['selected regions', 'limited regions', 'phased rollout'].some(ind => globalText.includes(ind))

    if (hasGlobal && !hasLimited && userRegions.size >= 2) {
      const globalBoost = Math.min(0.05, 0.02 * userRegions.size)
      reasons.push(`global release: +${Math.round(globalBoost * 100)}%`)
      adjustedScore = Math.min(1, adjustedScore + globalBoost)
    }
  } else {
    let matchedRegions = 0

    for (const mentionedRegion of mentionedRegions) {
      for (const userRegion of userRegions) {
        if (areRegionsMatching(userRegion, mentionedRegion)) {
          matchedRegions++
          break
        }
      }
    }

    if (matchedRegions === 0) {
      const isLimitedRollout = feedText.toLowerCase().includes('selected regions') ||
                               feedText.toLowerCase().includes('limited regions')
      const penalty = isLimitedRollout ? 0.5 : 0.7
      reasons.push(`region mismatch: -${Math.round((1 - penalty) * 100)}%`)
      adjustedScore = Math.max(0, adjustedScore * penalty)
    } else {
      const coverage = matchedRegions / mentionedRegions.size
      const regionBoost = 0.2 * coverage
      reasons.push(`region match: ${matchedRegions}/${mentionedRegions.size} (+${Math.round(regionBoost * 100)}%)`)
      adjustedScore = Math.min(1, adjustedScore + regionBoost)
    }
  }

  return adjustedScore
}

export function matchReleases(
  inventory: RegionAwareInventory,
  releases: ReleaseItem[],
  threshold = 0.5
): MatchResult[] {
  const { byType, regions } = inventory
  const results: MatchResult[] = []
  const maxResourceCount = Math.max(...byType.values())

  for (const [resourceType, count] of byType.entries()) {
    const matches: MatchRelease[] = []

    for (const release of releases) {
      const reasons: string[] = []
      const categories = ((release as any).categories || []) as string[]

      let score = baseMatchScore(release, resourceType, count, maxResourceCount, categories, reasons)
      if (score <= 0) continue

      score = adjustForRegionsAndResourceTypes(score, release, regions, reasons)
      if (score < threshold) continue

      matches.push({
        id: release.id,
        title: release.title,
        link: release.link,
        published: release.published,
        relevanceScore: score,
        reasons,
        categories
      })
    }

    matches.sort((a, b) => {
      if (b.relevanceScore !== a.relevanceScore) return b.relevanceScore - a.relevanceScore
      const timeA = Date.parse(a.published || '') || 0
      const timeB = Date.parse(b.published || '') || 0
      return timeB - timeA
    })

    const overallScore = matches.length ? Math.max(...matches.map(m => m.relevanceScore)) : 0
    results.push({
      resourceType,
      resourceCount: count,
      matchedReleases: matches,
      overallScore
    })
  }

  return results.sort((a, b) => (b.overallScore - a.overallScore) || (b.resourceCount - a.resourceCount))
}