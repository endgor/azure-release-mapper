import { useState } from 'react'
import type { MatchResult } from '../lib/types'

interface Props {
  results: MatchResult[]
}

export default function ResultsTable({ results }: Props) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  if (!results.length) return null
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">Analysis Results</h2>
        <div className="text-sm text-slate-500">{results.length} resource type(s)</div>
      </div>
      <div className="overflow-auto">
        <table className="table">
          <thead>
            <tr>
              <th className="th">Resource Type</th>
              <th className="th">Count</th>
              <th className="th">Matches</th>
              <th className="th">Top Impact</th>
              <th className="th">Max Score</th>
              <th className="th">Actions</th>
            </tr>
          </thead>
          <tbody>
            {results.map(r => (
              <>
                <tr key={r.resourceType}>
                  <td className="td font-mono text-xs md:text-sm">{r.resourceType}</td>
                  <td className="td">{r.resourceCount}</td>
                  <td className="td">{r.matchedReleases.length}</td>
                  <td className="td">{r.topImpactSummary || '—'}</td>
                  <td className="td">{r.overallScore.toFixed(2)}</td>
                  <td className="td">
                    <button
                      className="btn btn-ghost"
                      onClick={() => setExpanded(s => ({ ...s, [r.resourceType]: !s[r.resourceType] }))}
                    >
                      {expanded[r.resourceType] ? 'Hide' : 'View'}
                    </button>
                  </td>
                </tr>
                {expanded[r.resourceType] && (
                  <tr>
                    <td className="td" colSpan={6}>
                      <div className="grid gap-2">
                        {r.matchedReleases.map(m => (
                          <div key={m.id} className="p-3 rounded-md border border-slate-200">
                            <div className="flex items-center justify-between">
                              <a className="text-[color:var(--brand)] hover:underline" href={m.link} target="_blank" rel="noreferrer">{m.title}</a>
                              <div className="text-xs text-slate-500">{new Date(m.published).toLocaleDateString()}</div>
                            </div>
                            <div className="text-xs text-slate-600 mt-1">Score: {m.relevanceScore.toFixed(2)} {m.aiConfidence != null && `(AI: ${m.aiConfidence.toFixed(2)})`}</div>
                            {m.aiSummary && <div className="text-sm mt-1">{m.aiSummary}</div>}
                            {!!m.reasons?.length && (
                              <div className="text-xs text-slate-500 mt-1">Reasons: {m.reasons.join(', ')}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

