import { useEffect, useMemo, useState } from 'react'
import Header from './components/Header'
import ApiKeyInput from './components/ApiKeyInput'
import CsvUploader from './components/CsvUploader'
import AnalyzeButton from './components/AnalyzeButton'
import ResultsTable from './components/ResultsTable'
import { fetchRss } from './lib/rss'
import { matchReleases } from './lib/match'
import { aiAugment } from './lib/ai'
import type { MatchResult } from './lib/types'
import { downloadResultsCsv } from './lib/download'

export default function App() {
  const [apiKey, setApiKey] = useState<string>(localStorage.getItem('geminiApiKey') || '')
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
      const final = apiKey ? await aiAugment(apiKey, releases, base) : base
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
          <ApiKeyInput onSave={setApiKey} />
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

