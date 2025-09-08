import { useEffect, useState } from 'react'

interface Props {
  onSave: (key: string) => void
}

export default function ApiKeyInput({ onSave }: Props) {
  const [key, setKey] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const k = localStorage.getItem('geminiApiKey')
    if (k) setKey(k)
  }, [])

  function save() {
    localStorage.setItem('geminiApiKey', key)
    setSaved(true)
    onSave(key)
    setTimeout(() => setSaved(false), 1500)
  }

  return (
    <div className="card p-4">
      <div className="flex flex-col gap-2 md:flex-row md:items-center">
        <div className="flex-1">
          <label className="block text-sm font-medium text-slate-700">Gemini API Key</label>
          <input
            type="password"
            className="input w-full mt-1"
            placeholder="Paste your Gemini API key"
            value={key}
            onChange={(e) => setKey(e.target.value)}
          />
          <p className="text-xs text-slate-500 mt-1">Stored only in your browser (localStorage). Optional.</p>
        </div>
        <button className="btn btn-primary mt-2 md:mt-6" onClick={save} disabled={!key}>
          {saved ? 'Saved' : 'Save Key'}
        </button>
      </div>
    </div>
  )
}

