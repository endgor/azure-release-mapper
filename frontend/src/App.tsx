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
  const [showUploader, setShowUploader] = useState(true)
  const [headerCompact, setHeaderCompact] = useState(false)

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

  function handleCsvParsed(map: Map<string, number>) {
    setResources(map)
    // Hide uploader after successful upload with a delay for better UX
    setTimeout(() => {
      setShowUploader(false)
    }, 1500)
  }

  function handleShowUploader() {
    setShowUploader(true)
    // Optionally expand header again when showing uploader
    setHeaderCompact(false)
  }

  async function analyze() {
    if (!canAnalyze) return
    setAnalyzing(true)
    // Compact header immediately when analysis starts
    setHeaderCompact(true)
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
      <Header isCompact={headerCompact} />
      
      <main className="flex-1 container mx-auto px-6 py-8 max-w-7xl">
        {/* File Upload Section - Conditionally shown with animation */}
        <section className={`${showUploader ? 'upload-section-expanded' : 'upload-section-collapsed'}`}>
          <div className="max-w-2xl mx-auto">
            <CsvUploader onParsed={handleCsvParsed} />
          </div>
        </section>

        {/* Action Section */}
        <section className="mb-6">
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
            {/* Upload New File Button - shown when uploader is hidden */}
            {!showUploader && resources.size > 0 && (
              <button 
                className="btn btn-ghost animate-slide-in" 
                onClick={handleShowUploader}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Upload New File
              </button>
            )}

            <AnalyzeButton 
              disabled={!canAnalyze || analyzing} 
              onClick={analyze} 
              isAnalyzing={analyzing}
            />
            
            {/* Status Messages */}
            {rssStatus === 'loading' && (
              <div className="flex items-center space-x-2 text-blue-600">
                <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span className="text-sm">Loading release notes...</span>
              </div>
            )}
            
            {rssStatus === 'ready' && !analyzing && resources.size > 0 && !showUploader && (
              <div className="status-badge status-success">
                {resources.size} resource type{resources.size !== 1 ? 's' : ''} loaded
              </div>
            )}

            {rssStatus === 'ready' && !analyzing && resources.size > 0 && showUploader && (
              <div className="status-badge status-success">
                Ready to analyze {resources.size} resource type{resources.size !== 1 ? 's' : ''}
              </div>
            )}

            {rssStatus === 'error' && (
              <div className="status-badge status-error">
                Failed to load RSS feeds
              </div>
            )}

            {/* Download Button */}
            {results.length > 0 && (
              <button 
                className="btn btn-ghost animate-slide-in" 
                onClick={() => downloadResultsCsv(results)}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-4-4m4 4l4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Download CSV
              </button>
            )}
          </div>

          {/* Analysis Progress */}
          {analyzing && (
            <div className="mt-4 max-w-md mx-auto">
              <div className="card p-4 animate-slide-in">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <svg className="w-5 h-5 text-blue-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-blue-800">Analysis in progress</div>
                    <div className="text-xs text-blue-600">Matching resources against release notes...</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Results Section */}
        {results.length > 0 && <ResultsTable results={results} />}
      </main>

      {/* Footer */}
      <footer className="bg-white/50 backdrop-blur-sm border-t border-slate-200/50 py-6 mt-12">
        <div className="container mx-auto px-6 text-center">
          <p className="text-sm text-slate-600">
            Built for Azure environments • Privacy-first design • Data stays local
          </p>
          <p className="text-xs text-slate-500 mt-1">
            RSS feeds fetched via local API proxy • No external dependencies
          </p>
        </div>
      </footer>
    </div>
  )
}
