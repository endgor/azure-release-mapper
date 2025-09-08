import { useState, useRef, DragEvent } from 'react'
import { parseAzureCsv } from '../lib/csv'

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
      const map = await parseAzureCsv(file)
      if (map.size === 0) {
        setError('No RESOURCE TYPE values found. Check CSV columns.')
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
          <h3 className="text-lg font-semibold text-slate-800 mb-2">📊 Azure Resource Inventory</h3>
          <p className="text-sm text-slate-600 mb-1">Upload your Azure "All resources" CSV export</p>
          <p className="text-xs text-slate-500">Required columns: NAME, RESOURCE GROUP, LOCATION, SUBSCRIPTION, RESOURCE TYPE, TYPE</p>
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
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          
          {isProcessing ? (
            <div className="text-center">
              <div className="text-lg font-semibold text-slate-700">Processing CSV...</div>
              <div className="text-sm text-slate-500">Analyzing your Azure resources</div>
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

      {fileName && (
        <div className="mt-4 p-4 bg-green-50/50 border border-green-200 rounded-xl animate-slide-in">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <div className="text-sm font-medium text-green-800">File uploaded successfully</div>
              <div className="text-xs text-green-600">{fileName}</div>
            </div>
          </div>
        </div>
      )}

      {uniqueCount !== null && (
        <div className="mt-3 p-3 bg-blue-50/50 border border-blue-200 rounded-xl animate-slide-in">
          <div className="flex items-center space-x-2">
            <div className="status-badge status-success">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              {uniqueCount} resource types detected
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-3 p-3 bg-red-50/50 border border-red-200 rounded-xl animate-slide-in">
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div className="text-sm text-red-700">{error}</div>
          </div>
        </div>
      )}
    </div>
  )
}

