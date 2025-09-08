import { useState } from 'react'
import type { MatchResult } from '../lib/types'

interface Props {
  results: MatchResult[]
}

function ScoreBar({ score }: { score: number }) {
  const percentage = Math.min(score * 10, 100) // Assuming scores are 0-10
  const getColor = (score: number) => {
    if (score >= 7) return 'bg-green-500'
    if (score >= 4) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <div className="flex items-center space-x-2">
      <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-300 ${getColor(score)}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-xs text-slate-600 font-mono">{score.toFixed(2)}</span>
    </div>
  )
}

function ImpactBadge({ level }: { level: 'high' | 'medium' | 'low' | null }) {
  if (!level) return <span className="text-slate-400">—</span>
  
  const styles = {
    high: 'bg-red-100 text-red-700 border-red-200',
    medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    low: 'bg-green-100 text-green-700 border-green-200'
  }
  
  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${styles[level]}`}>
      {level.toUpperCase()}
    </span>
  )
}

export default function ResultsTable({ results }: Props) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  if (!results.length) return null

  const sortedResults = [...results].sort((a, b) => b.overallScore - a.overallScore)

  return (
    <div className="card-elevated p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">📋 Analysis Results</h2>
          <p className="text-sm text-slate-600">
            {results.length} resource type(s) analyzed • {results.reduce((sum, r) => sum + r.matchedReleases.length, 0)} total matches found
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {sortedResults.map((result, index) => {
          const isExpanded = expanded[result.resourceType]
          const hasMatches = result.matchedReleases.length > 0
          const impactLevel = result.overallScore >= 7 ? 'high' : result.overallScore >= 4 ? 'medium' : result.overallScore > 0 ? 'low' : null

          return (
            <div 
              key={result.resourceType} 
              className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                  {/* Resource Type */}
                  <div className="lg:col-span-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-indigo-500 rounded-full flex-shrink-0" />
                      <div>
                        <div className="font-mono text-sm font-semibold text-slate-800 break-all">
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
                    <div className="flex items-center space-x-2">
                      <div className="status-badge bg-blue-100 text-blue-800">
                        {result.matchedReleases.length} match{result.matchedReleases.length !== 1 ? 'es' : ''}
                      </div>
                    </div>
                  </div>

                  {/* Impact Level */}
                  <div className="lg:col-span-2">
                    <ImpactBadge level={impactLevel} />
                  </div>

                  {/* Score */}
                  <div className="lg:col-span-3">
                    <ScoreBar score={result.overallScore} />
                  </div>

                  {/* Actions */}
                  <div className="lg:col-span-1 flex justify-end">
                    {hasMatches && (
                      <button
                        className="btn btn-ghost text-sm"
                        onClick={() => setExpanded(s => ({ ...s, [result.resourceType]: !s[result.resourceType] }))}
                      >
                        <svg 
                          className={`w-4 h-4 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
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
                  <div className="mt-4 p-3 bg-slate-50 rounded-lg">
                    <div className="text-sm text-slate-700">
                      <strong>Key Impact:</strong> {result.topImpactSummary}
                    </div>
                  </div>
                )}
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="px-6 pb-6 animate-slide-in">
                  <div className="border-t border-slate-200 pt-4 space-y-4">
                    {result.matchedReleases.map((match, matchIndex) => (
                      <div key={match.id} className="bg-gradient-to-r from-slate-50/50 to-white rounded-lg p-4 border border-slate-100">
                        <div className="flex items-start justify-between mb-3">
                          <a 
                            className="text-indigo-600 hover:text-indigo-800 font-medium text-sm hover:underline transition-colors" 
                            href={match.link} 
                            target="_blank" 
                            rel="noreferrer"
                          >
                            {match.title}
                          </a>
                          <div className="flex items-center space-x-2 flex-shrink-0 ml-4">
                            <span className="text-xs text-slate-500">
                              {new Date(match.published).toLocaleDateString()}
                            </span>
                            <ScoreBar score={match.relevanceScore} />
                          </div>
                        </div>

                        {match.aiSummary && (
                          <div className="mb-3 p-3 bg-blue-50/50 border border-blue-100 rounded-md">
                            <div className="text-sm text-slate-700">{match.aiSummary}</div>
                            {match.aiConfidence != null && (
                              <div className="text-xs text-blue-600 mt-1">
                                AI Confidence: {(match.aiConfidence * 100).toFixed(0)}%
                              </div>
                            )}
                          </div>
                        )}

                        {match.reasons && match.reasons.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {match.reasons.map((reason, reasonIndex) => (
                              <span 
                                key={reasonIndex}
                                className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full"
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

