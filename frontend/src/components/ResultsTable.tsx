import { useMemo, useState } from 'react'
import type { MatchResult } from '../lib/types'

interface Props {
  results: MatchResult[]
}

function getTagClasses(tag: string): string {
  const t = tag.toLowerCase()
  if (/(launched|generally available|general availability|\bga\b)/.test(t)) {
    return 'bg-green-100 text-green-800 border border-green-200'
  }
  if (/(in preview|public preview|private preview|preview)/.test(t)) {
    return 'bg-amber-100 text-amber-800 border border-amber-200'
  }
  if (/(deprecated|retired|retirement|end of support|removal)/.test(t)) {
    return 'bg-rose-100 text-rose-800 border border-rose-200'
  }
  if (/(breaking change|breaking)/.test(t)) {
    return 'bg-red-100 text-red-800 border border-red-200'
  }
  if (/(security|vulnerability|cve)/.test(t)) {
    return 'bg-red-100 text-red-800 border border-red-200'
  }
  if (/(update|improvement|enhancement|enhanced|improved)/.test(t)) {
    return 'bg-blue-100 text-blue-800 border border-blue-200'
  }
  if (/(bug|fix|resolved)/.test(t)) {
    return 'bg-teal-100 text-teal-800 border border-teal-200'
  }
  // Default/product tags
  return 'bg-indigo-100 text-indigo-700 border border-indigo-200'
}

function ScoreBar({ score }: { score: number }) {
  const percentage = Math.min(score * 100, 100) // Scores are 0-1, so multiply by 100
  const getColor = (score: number) => {
    if (score >= 0.7) return 'bg-green-500'   // 70%+ = High relevance
    if (score >= 0.5) return 'bg-yellow-500' // 50-70% = Medium relevance  
    return 'bg-orange-500'                    // 30-50% = Lower relevance (not red since all matches are decent)
  }

  return (
    <div className="flex items-center space-x-1">
      <div className="w-12 h-1.5 bg-slate-200 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-300 ${getColor(score)}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-xs text-slate-600 font-mono">{Math.round(score * 100)}%</span>
    </div>
  )
}

function ImpactBadge({ level }: { level: 'high' | 'medium' | 'low' | null }) {
  if (!level) return <span className="text-slate-400 text-xs">No matches</span>
  
  const config = {
    high: { 
      style: 'bg-green-100 text-green-700 border-green-200',
      label: 'High Match',
      title: '70%+ relevance - Strong keyword matches in title/summary'
    },
    medium: { 
      style: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      label: 'Good Match',
      title: '50-70% relevance - Some keyword matches found'
    },
    low: { 
      style: 'bg-orange-100 text-orange-700 border-orange-200',
      label: 'Possible',
      title: '30-50% relevance - Weak keyword matches or fuzzy matching'
    }
  }
  
  const { style, label, title } = config[level]
  
  return (
    <span 
      className={`px-2 py-1 text-xs font-medium rounded-full border ${style} cursor-help`}
      title={title}
    >
      {label}
    </span>
  )
}

export default function ResultsTable({ results }: Props) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [openMonthDropdown, setOpenMonthDropdown] = useState(false)
  const [openStatusDropdown, setOpenStatusDropdown] = useState(false)
  const [openTagsDropdown, setOpenTagsDropdown] = useState(false)
  // Selected months as numbers 1-12. Empty = All months
  const [selectedMonths, setSelectedMonths] = useState<number[]>([])
  // Selected statuses. Empty = All statuses
  const [selectedStatuses, setSelectedStatuses] = useState<Array<'launched' | 'preview'>>([])
  // Selected category tags. Empty = All tags
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  const monthNames = useMemo(
    () => [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ],
    []
  )

  // Collect available months from all matched releases
  const availableMonths = useMemo(() => {
    const set = new Set<number>()
    for (const r of results) {
      for (const m of r.matchedReleases) {
        const d = new Date(m.published)
        if (!isNaN(d.getTime())) {
          set.add(d.getMonth() + 1)
        }
      }
    }
    // Sort by most recent month first (relative to calendar order 12..1)
    return Array.from(set).sort((a, b) => b - a)
  }, [results])

  const isAllMonths = selectedMonths.length === 0
  const isAllStatuses = selectedStatuses.length === 0
  const isAllTags = selectedTags.length === 0
  const toggleMonth = (monthNum: number) => {
    setSelectedMonths(prev => {
      const has = prev.includes(monthNum)
      const next = has ? prev.filter(m => m !== monthNum) : [...prev, monthNum]
      // If none selected, treat as All
      return next
    })
  }
  const selectAllMonths = () => setSelectedMonths([])

  const toggleStatus = (status: 'launched' | 'preview') => {
    setSelectedStatuses(prev => {
      const has = prev.includes(status)
      const next = has ? prev.filter(s => s !== status) : [...prev, status]
      return next
    })
  }
  const selectAllStatuses = () => setSelectedStatuses([])

  // Collect available category tags across all releases
  const availableTags = useMemo(() => {
    const set = new Set<string>()
    for (const r of results) {
      for (const m of r.matchedReleases) {
        for (const c of m.categories || []) set.add(c)
      }
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b))
  }, [results])

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => {
      const has = prev.includes(tag)
      const next = has ? prev.filter(t => t !== tag) : [...prev, tag]
      return next
    })
  }
  const selectAllTags = () => setSelectedTags([])

  if (!results.length) return null

  const sortedResults = [...results].sort((a, b) => b.overallScore - a.overallScore)

  // Helper to filter a list of releases based on selected filters
  const filterReleases = (items: MatchResult['matchedReleases']) => {
    const launchedRegex = /(launched|generally available|general availability|\bga\b)/i
    const previewRegex = /(in preview|public preview|private preview|preview)/i

    return items.filter(m => {
      // Month filter
      if (!isAllMonths) {
        const d = new Date(m.published)
        if (isNaN(d.getTime())) return false
        const month = d.getMonth() + 1
        if (!selectedMonths.includes(month)) return false
      }

      // Status filter
      if (!isAllStatuses) {
        const text = `${m.title} ${(m.categories || []).join(' ')}`
        const isLaunched = launchedRegex.test(text)
        const isPreview = previewRegex.test(text)
        const statusMatch = (
          (selectedStatuses.includes('launched') && isLaunched) ||
          (selectedStatuses.includes('preview') && isPreview)
        )
        if (!statusMatch) return false
      }

      // Tags filter (OR semantics)
      if (!isAllTags) {
        const cats = (m.categories || [])
        const catsLower = cats.map(c => c.toLowerCase())
        const anyTag = selectedTags.some(t => catsLower.includes(t.toLowerCase()))
        if (!anyTag) return false
      }

      return true
    })
  }

  const totalVisibleMatches = useMemo(() => {
    return sortedResults.reduce((sum, r) => sum + filterReleases(r.matchedReleases).length, 0)
  }, [sortedResults, selectedMonths, selectedStatuses, selectedTags])

  const visibleResults = useMemo(() => {
    return sortedResults.filter(r => filterReleases(r.matchedReleases).length > 0)
  }, [sortedResults, selectedMonths, selectedStatuses, selectedTags])

  return (
    <div className="card-elevated p-4 animate-fade-in">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 mb-1">📋 Analysis Results</h2>
          <p className="text-xs text-slate-600 mb-2">
            {visibleResults.length} resource type(s) • {totalVisibleMatches} matches found
          </p>
          <div className="text-xs text-slate-500">
            <span className="font-medium">Relevance Score:</span> Based on keyword matches in release titles, summaries, and categories. 
            Only releases with 30%+ relevance are shown.
          </div>
        </div>
        {/* Filters */}
        <div className="flex items-center gap-2">
          {/* Month filter */}
          <div className="relative">
          <button
            type="button"
            onClick={() => setOpenMonthDropdown(o => !o)}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs rounded border border-slate-300 bg-white hover:bg-slate-50"
          >
            <svg className="w-3 h-3 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3M3 11h18M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2h-1M5 5H4a2 2 0 00-2 2v10a2 2 0 002 2" />
            </svg>
            {isAllMonths ? 'All months' : `${selectedMonths.length} month${selectedMonths.length > 1 ? 's' : ''}`}
            <svg className={`w-3 h-3 transform ${openMonthDropdown ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {openMonthDropdown && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded shadow-lg z-10 p-2">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-medium text-slate-700">Filter by month</div>
                <button onClick={() => setOpenMonthDropdown(false)} className="text-xs text-slate-500 hover:text-slate-700">Close</button>
              </div>
              <div className="mb-2">
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAllMonths}
                    onChange={selectAllMonths}
                  />
                  <span>All</span>
                </label>
              </div>
              <div className="max-h-48 overflow-auto pr-1">
                {availableMonths.length === 0 && (
                  <div className="text-xs text-slate-500">No months available</div>
                )}
                {availableMonths.map((m) => (
                  <label key={m} className="flex items-center gap-2 py-0.5 text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedMonths.includes(m)}
                      onChange={() => toggleMonth(m)}
                    />
                    <span>{monthNames[m - 1]}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
          </div>

          {/* Status filter */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenStatusDropdown(o => !o)}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-xs rounded border border-slate-300 bg-white hover:bg-slate-50"
            >
              <svg className="w-3 h-3 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14M5 6h14M5 18h14" />
              </svg>
              {isAllStatuses ? 'All status' : `${selectedStatuses.length} selected`}
              <svg className={`w-3 h-3 transform ${openStatusDropdown ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {openStatusDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded shadow-lg z-10 p-2">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs font-medium text-slate-700">Filter by status</div>
                  <button onClick={() => setOpenStatusDropdown(false)} className="text-xs text-slate-500 hover:text-slate-700">Close</button>
                </div>
                <div className="mb-2">
                  <label className="flex items-center gap-2 text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isAllStatuses}
                      onChange={selectAllStatuses}
                    />
                    <span>All</span>
                  </label>
                </div>
                <div className="space-y-1">
                  <label className="flex items-center gap-2 text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedStatuses.includes('launched')}
                      onChange={() => toggleStatus('launched')}
                    />
                    <span>Launched</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedStatuses.includes('preview')}
                      onChange={() => toggleStatus('preview')}
                    />
                    <span>In preview</span>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Tags filter */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenTagsDropdown(o => !o)}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-xs rounded border border-slate-300 bg-white hover:bg-slate-50"
            >
              <svg className="w-3 h-3 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7l10 10M7 17L17 7" />
              </svg>
              {isAllTags ? 'All tags' : `${selectedTags.length} tag${selectedTags.length > 1 ? 's' : ''}`}
              <svg className={`w-3 h-3 transform ${openTagsDropdown ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {openTagsDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded shadow-lg z-10 p-2">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs font-medium text-slate-700">Filter by tag</div>
                  <button onClick={() => setOpenTagsDropdown(false)} className="text-xs text-slate-500 hover:text-slate-700">Close</button>
                </div>
                <div className="mb-2">
                  <label className="flex items-center gap-2 text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isAllTags}
                      onChange={selectAllTags}
                    />
                    <span>All</span>
                  </label>
                </div>
                <div className="max-h-48 overflow-auto pr-1">
                  {availableTags.length === 0 && (
                    <div className="text-xs text-slate-500">No tags available</div>
                  )}
                  {availableTags.map((t) => (
                    <label key={t} className="flex items-center gap-2 py-0.5 text-xs cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedTags.includes(t)}
                        onChange={() => toggleTag(t)}
                      />
                      <span className="truncate" title={t}>{t}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {visibleResults.length === 0 && (
          <div className="text-xs text-slate-500 p-3 border border-slate-200 rounded bg-slate-50">
            No results match the current filters.
          </div>
        )}
        {visibleResults.map((result, index) => {
          const isExpanded = expanded[result.resourceType]
          const filteredReleases = filterReleases(result.matchedReleases)
          const hasMatches = filteredReleases.length > 0
          const filteredScore = hasMatches ? Math.max(...filteredReleases.map(m => Math.max(m.relevanceScore, m.aiConfidence ?? 0))) : 0
          const impactLevel = filteredScore >= 0.7 ? 'high' : filteredScore >= 0.5 ? 'medium' : filteredScore > 0 ? 'low' : null

          return (
            <div 
              key={result.resourceType} 
              className="bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="p-3">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
                  {/* Resource Type */}
                  <div className="lg:col-span-5">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="font-mono text-xs font-semibold text-slate-800 truncate" title={result.resourceType}>
                          {result.resourceType}
                        </div>
                        <div className="text-xs text-slate-500">
                          {result.resourceCount} resource{result.resourceCount !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Matches */}
                  <div className="lg:col-span-2">
                    <div className="status-badge bg-blue-100 text-blue-800 text-xs px-2 py-1">
                      {filteredReleases.length}
                    </div>
                  </div>

                  {/* Impact Level */}
                  <div className="lg:col-span-2">
                    <ImpactBadge level={impactLevel} />
                  </div>

                  {/* Score */}
                  <div className="lg:col-span-2">
                    <ScoreBar score={filteredScore} />
                  </div>

                  {/* Actions */}
                  <div className="lg:col-span-1 flex justify-end">
                    {hasMatches && (
                      <button
                        className="p-1 hover:bg-slate-100 rounded transition-colors"
                        onClick={() => setExpanded(s => ({ ...s, [result.resourceType]: !s[result.resourceType] }))}
                      >
                        <svg 
                          className={`w-3 h-3 transform transition-transform ${isExpanded ? 'rotate-180' : ''} text-slate-600`}
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>

                {/* Top Impact Summary */}
                {filteredReleases[0]?.aiSummary && (
                  <div className="mt-2 p-2 bg-slate-50 rounded-md">
                    <div className="text-xs text-slate-700">
                      <strong>Key Impact:</strong> {filteredReleases[0]?.aiSummary}
                    </div>
                  </div>
                )}
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="px-3 pb-3 animate-slide-in">
                  <div className="border-t border-slate-200 pt-2 space-y-2">
                    {filteredReleases.map((match, matchIndex) => (
                      <div key={match.id} className="bg-gradient-to-r from-slate-50/50 to-white rounded-md p-3 border border-slate-100">
                        <div className="flex items-start justify-between mb-2">
                          <a 
                            className="text-slate-900 hover:text-slate-700 font-medium text-xs hover:underline transition-colors flex-1 mr-3" 
                            href={match.link} 
                            target="_blank" 
                            rel="noreferrer"
                          >
                            {match.title}
                          </a>
                          <div className="flex items-center space-x-2 flex-shrink-0">
                            <span className="text-xs text-slate-500">
                              {new Date(match.published).toLocaleDateString()}
                            </span>
                            <div className="w-12">
                              <ScoreBar score={match.relevanceScore} />
                            </div>
                          </div>
                        </div>

                        {match.aiSummary && (
                          <div className="mb-2 p-2 bg-blue-50/50 border border-blue-100 rounded-md">
                            <div className="text-xs text-slate-700">{match.aiSummary}</div>
                            {match.aiConfidence != null && (
                              <div className="text-xs text-blue-600 mt-1">
                                AI: {(match.aiConfidence * 100).toFixed(0)}%
                              </div>
                            )}
                          </div>
                        )}

                        {/* Prefer RSS categories as tags; fall back to reasons */}
                        {(match.categories?.length || 0) > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {match.categories!.map((cat, idx) => (
                              <span
                                key={idx}
                                className={`px-1.5 py-0.5 text-xs rounded-full ${getTagClasses(cat)}`}
                                title="Feed tag"
                              >
                                {cat}
                              </span>
                            ))}
                          </div>
                        ) : (
                          match.reasons && match.reasons.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {match.reasons.map((reason, reasonIndex) => (
                                <span 
                                  key={reasonIndex}
                                  className="px-1.5 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 text-xs rounded-full"
                                  title="Match reason"
                                >
                                  {reason}
                                </span>
                              ))}
                            </div>
                          )
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
