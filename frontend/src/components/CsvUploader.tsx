import { useState, useRef, DragEvent } from 'react'
import { parseResourceCsv } from '../lib/csv'

interface Props {
  onParsed: (map: Map<string, number>) => void
}

export default function CsvUploader({ onParsed }: Props) {
  const [fileName, setFileName] = useState('')
  const [uniqueCount, setUniqueCount] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function processFile(file: File) {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('Please upload a CSV file')
      return
    }
    
    setIsProcessing(true)
    setError(null)
    setFileName(file.name)
    
    try {
      const map = await parseResourceCsv(file)
      if (map.size === 0) {
        setError('No resource type values found. Check CSV headers for Azure ("RESOURCE TYPE") or CloudOps ("type"/"sub_type").')
      } else {
        setUniqueCount(map.size)
        onParsed(map)
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to parse CSV')
    } finally {
      setIsProcessing(false)
    }
  }

  function handleFileSelect(file?: File) {
    if (file) processFile(file)
  }

  function handleDragEnter(e: DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }

  function handleDragLeave(e: DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }

  function handleDragOver(e: DragEvent) {
    e.preventDefault()
    e.stopPropagation()
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    const csvFile = files.find(file => file.name.toLowerCase().endsWith('.csv'))
    if (csvFile) {
      processFile(csvFile)
    } else {
      setError('Please drop a CSV file')
    }
  }

  const uploadZoneClass = `upload-zone ${isDragOver ? 'upload-zone-active' : ''} ${isProcessing ? 'animate-pulse' : ''}`

  return (
    <div className="card-elevated p-6 animate-fade-in">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">📊 Resource Inventory</h3>
          <p className="text-sm text-slate-600 mb-1">Upload Azure "All resources" CSV or CloudOps environment export</p>
          <p className="text-xs text-slate-500">Azure: NAME, RESOURCE GROUP, LOCATION, SUBSCRIPTION, RESOURCE TYPE • CloudOps: type[, sub_type]</p>
        </div>
      </div>

      <div
        className={uploadZoneClass}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={(e) => handleFileSelect(e.target.files?.[0])}
          disabled={isProcessing}
        />
        
        <div className="space-y-4">
          {/* Icon - changes based on state */}
          <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center transition-all duration-300 ${
            fileName && !error 
              ? 'bg-gradient-to-br from-green-500 to-emerald-600' 
              : isProcessing 
                ? 'bg-gradient-to-br from-blue-500 to-blue-600' 
                : 'bg-gradient-to-br from-sky-500 to-blue-600'
          }`}>
            {fileName && !error ? (
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : isProcessing ? (
              <svg className="w-8 h-8 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            ) : (
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            )}
          </div>
          
          {/* Content - changes based on state */}
          {fileName && !error ? (
            <div className="text-center animate-fade-in">
              <div className="text-lg font-semibold text-green-700 mb-2">File uploaded successfully!</div>
              <div className="text-sm text-slate-600 mb-2">{fileName}</div>
              {uniqueCount !== null && (
                <div className="text-sm font-medium text-green-600">
                  {uniqueCount} resource types detected
                </div>
              )}
            </div>
          ) : isProcessing ? (
            <div className="text-center">
              <div className="text-lg font-semibold text-blue-700">Processing CSV...</div>
              <div className="text-sm text-slate-500">Analyzing your resources</div>
            </div>
          ) : error ? (
            <div className="text-center">
              <div className="text-lg font-semibold text-red-700 mb-2">Upload failed</div>
              <div className="text-sm text-red-600 mb-4">{error}</div>
              <button className="btn btn-secondary">
                Try Again
              </button>
            </div>
          ) : (
            <div className="text-center">
              <div className="text-lg font-semibold text-slate-700 mb-2">
                {isDragOver ? 'Drop your CSV file here' : 'Drag & drop your CSV file'}
              </div>
              <div className="text-sm text-slate-500 mb-4">or click to browse</div>
              <button className="btn btn-secondary">
                Choose File
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
