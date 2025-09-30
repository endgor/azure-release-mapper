export interface ReleaseItem {
  id: string
  title: string
  link: string
  published: string
  summary: string
  categories?: string[]
}

export interface MatchRelease {
  id: string
  title: string
  link: string
  published: string
  relevanceScore: number
  reasons: string[]
  categories?: string[]
}

export interface MatchResult {
  resourceType: string
  resourceCount: number
  matchedReleases: MatchRelease[]
  overallScore: number
}

// Region-aware inventory for scoring adjustments
export interface RegionAwareInventory {
  byType: Map<string, number>
  regions: Set<string>
}
