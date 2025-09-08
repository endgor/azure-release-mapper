import { useEffect, useMemo, useState } from 'react'
import Header from './components/Header'
import CsvUploader from './components/CsvUploader'
import AnalyzeButton from './components/AnalyzeButton'
import ResultsTable from './components/ResultsTable'
import { fetchRss } from './lib/rss'
import { matchReleases } from './lib/match'
import { aiAugment } from './lib/ai'
import type { MatchResult } from './lib/types'
import { downloadResultsCsv } from './lib/download'

export default function App() {
  const [resources, setResources] = useState<Map<string, number>>(new Map())
  const [rssStatus, setRssStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle')
  const [releases, setReleases] = useState<any[]>([])
  const [results, setResults] = useState<MatchResult[]>([])
  const [analyzing, setAnalyzing] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setRssStatus('loading')
      try {
        const items = await fetchRss()
        if (!cancelled) {
          setReleases(items)
          setRssStatus('ready')
        }
      } catch (e) {
        setRssStatus('error')
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const canAnalyze = useMemo(() => resources.size > 0 && rssStatus === 'ready', [resources, rssStatus])

  async function analyze() {
    if (!canAnalyze) return
    setAnalyzing(true)
    try {
      const base = matchReleases(resources, releases)
      // Always try to augment with local Ollama via server; falls back to base on error
      const final = await aiAugment(releases, base)
      setResults(final)
    } finally {
      setAnalyzing(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="container mx-auto px-4 py-6 grid gap-4 max-w-6xl">
        <section className="grid gap-4 md:grid-cols-2">
          <div className="card p-4">
            <div className="flex flex-col gap-2">
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-700">AI Engine</label>
                <div className="mt-1 text-sm">
                  Using local Ollama (Phi-3.5 mini) inside the container. No API key required.
                </div>
                <p className="text-xs text-slate-500 mt-1">All AI analysis runs locally via the embedded Ollama service. No data leaves the container.</p>
              </div>
            </div>
          </div>
          <CsvUploader onParsed={setResources} />
        </section>

        <section className="flex items-center gap-3">
          <AnalyzeButton disabled={!canAnalyze || analyzing} onClick={analyze} />
          {analyzing && <span className="text-sm text-slate-600">Analyzing…</span>}
          {rssStatus === 'loading' && <span className="text-sm text-slate-600">Loading release notes…</span>}
          {rssStatus === 'error' && <span className="text-sm text-red-600">Failed to load RSS. Check server.</span>}
          {!!results.length && (
            <button className="btn btn-ghost" onClick={() => downloadResultsCsv(results)}>Download CSV</button>
          )}
        </section>

        <ResultsTable results={results} />
      </main>
      <footer className="mt-auto py-6 text-center text-xs text-slate-500">
        Built for Azure environments. Data stays in your browser. RSS fetched via local API proxy.
      </footer>
    </div>
  )
}
