import { useState } from 'react'
import type { MatchResult } from '../lib/types'

interface Props {
  results: MatchResult[]
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

  if (!results.length) return null

  const sortedResults = [...results].sort((a, b) => b.overallScore - a.overallScore)

  return (
    <div className="card-elevated p-4 animate-fade-in">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 mb-1">📋 Analysis Results</h2>
          <p className="text-xs text-slate-600 mb-2">
            {results.length} resource type(s) • {results.reduce((sum, r) => sum + r.matchedReleases.length, 0)} matches found
          </p>
          <div className="text-xs text-slate-500">
            <span className="font-medium">Relevance Score:</span> Based on keyword matches in release titles, summaries, and categories. 
            Only releases with 30%+ relevance are shown.
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {sortedResults.map((result, index) => {
          const isExpanded = expanded[result.resourceType]
          const hasMatches = result.matchedReleases.length > 0
          const impactLevel = result.overallScore >= 0.7 ? 'high' : result.overallScore >= 0.5 ? 'medium' : result.overallScore > 0 ? 'low' : null

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
                      {result.matchedReleases.length}
                    </div>
                  </div>

                  {/* Impact Level */}
                  <div className="lg:col-span-2">
                    <ImpactBadge level={impactLevel} />
                  </div>

                  {/* Score */}
                  <div className="lg:col-span-2">
                    <ScoreBar score={result.overallScore} />
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
                {result.topImpactSummary && (
                  <div className="mt-2 p-2 bg-slate-50 rounded-md">
                    <div className="text-xs text-slate-700">
                      <strong>Key Impact:</strong> {result.topImpactSummary}
                    </div>
                  </div>
                )}
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="px-3 pb-3 animate-slide-in">
                  <div className="border-t border-slate-200 pt-2 space-y-2">
                    {result.matchedReleases.map((match, matchIndex) => (
                      <div key={match.id} className="bg-gradient-to-r from-slate-50/50 to-white rounded-md p-3 border border-slate-100">
                        <div className="flex items-start justify-between mb-2">
                          <a 
                            className="text-indigo-600 hover:text-indigo-800 font-medium text-xs hover:underline transition-colors flex-1 mr-3" 
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

                        {match.reasons && match.reasons.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {match.reasons.map((reason, reasonIndex) => (
                              <span 
                                key={reasonIndex}
                                className="px-1.5 py-0.5 bg-indigo-100 text-indigo-700 text-xs rounded-full"
                              >
                                {reason}
                              </span>
                            ))}
                          </div>
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

