import { useEffect, useMemo, useState } from 'react'
import Header from './components/Header'
import CsvUploader from './components/CsvUploader'
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


  async function handleCsvParsed(map: Map<string, number>) {
    setResources(map)
    
    // Automatically start analysis after showing success state
    if (rssStatus === 'ready') {
      // Show success state for a brief moment
      setTimeout(() => {
        // Start analysis and hide uploader at the same time
        setAnalyzing(true)
        setShowUploader(false)
        
        // Compact header slightly after to sync with upload zone hiding animation
        setTimeout(() => {
          setHeaderCompact(true)
        }, 100)
        
        // Start the actual analysis
        setTimeout(async () => {
          try {
            const base = matchReleases(map, releases)
            const final = await aiAugment(releases, base)
            setResults(final)
          } finally {
            setAnalyzing(false)
          }
        }, 200)
      }, 600) // Brief delay to show success state
    } else {
      // If RSS isn't ready yet, just hide the uploader
      setTimeout(() => {
        setShowUploader(false)
      }, 800)
    }
  }

  function handleShowUploader() {
    setShowUploader(true)
    // Optionally expand header again when showing uploader
    setHeaderCompact(false)
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
            
            {/* Status Messages */}
            {rssStatus === 'loading' && (
              <div className="flex items-center space-x-2 text-blue-600">
                <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span className="text-sm">Loading release notes...</span>
              </div>
            )}

            {rssStatus === 'error' && (
              <div className="status-badge status-error">
                Failed to load RSS feeds
              </div>
            )}

            {/* Action buttons - only shown after results are available */}
            {results.length > 0 && (
              <>
                <button 
                  className="btn btn-ghost animate-slide-in" 
                  onClick={handleShowUploader}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Upload New File
                </button>
                
                <button 
                  className="btn btn-ghost animate-slide-in" 
                  onClick={() => downloadResultsCsv(results)}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-4-4m4 4l4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Download CSV
                </button>
              </>
            )}
          </div>

          {/* Analysis Progress */}
          {analyzing && (
            <div className="mt-4 max-w-md mx-auto">
              <div className="card p-4 animate-lift-up">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <svg className="w-5 h-5 text-blue-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-blue-800">Analysis in progress</div>
                    <div className="text-xs text-blue-600">Matching {resources.size} resource type{resources.size !== 1 ? 's' : ''} against release notes...</div>
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
      <footer className="bg-white/50 backdrop-blur-sm border-t border-slate-200/50 py-4 mt-12">
        <div className="container mx-auto px-6 text-center">
          <a 
            href="https://github.com/endgor/cloudops-release-mapper"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
            title="View on GitHub"
          >
            <svg className="w-5 h-5 text-slate-700" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
            </svg>
          </a>
        </div>
      </footer>
    </div>
  )
}
