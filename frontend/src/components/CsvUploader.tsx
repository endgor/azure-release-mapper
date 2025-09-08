import { useState } from 'react'
import { parseAzureCsv } from '../lib/csv'

interface Props {
  onParsed: (map: Map<string, number>) => void
}

export default function CsvUploader({ onParsed }: Props) {
  const [fileName, setFileName] = useState('')
  const [uniqueCount, setUniqueCount] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleFile(file?: File) {
    if (!file) return
    setError(null)
    setFileName(file.name)
    try {
      const map = await parseAzureCsv(file)
      if (map.size === 0) {
        setError('No RESOURCE TYPE values found. Check CSV columns.')
      }
      setUniqueCount(map.size)
      onParsed(map)
    } catch (e: any) {
      setError(e?.message || 'Failed to parse CSV')
    }
  }

  return (
    <div className="card p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-medium text-slate-700">Upload Azure All-resources CSV</div>
          <div className="text-xs text-slate-500">Columns required: NAME, RESOURCE GROUP, LOCATION, SUBSCRIPTION, RESOURCE TYPE, TYPE</div>
        </div>
        <label className="btn btn-ghost cursor-pointer">
          <input type="file" accept=".csv" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
          Choose File
        </label>
      </div>
      {fileName && (
        <div className="text-sm text-slate-600">Selected: {fileName}</div>
      )}
      {uniqueCount !== null && (
        <div className="text-sm text-slate-600">Unique resource types: {uniqueCount}</div>
      )}
      {error && <div className="text-sm text-red-600">{error}</div>}
    </div>
  )
}

