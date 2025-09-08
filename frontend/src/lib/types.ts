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
  aiSummary?: string
  aiConfidence?: number
}

export interface MatchResult {
  resourceType: string
  resourceCount: number
  matchedReleases: MatchRelease[]
  topImpactSummary?: string
  overallScore: number
}
