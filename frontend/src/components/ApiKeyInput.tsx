export default function ApiKeyInput() {
  return (
    <div className="card p-4">
      <div className="flex flex-col gap-2 md:flex-row md:items-center">
        <div className="flex-1">
          <label className="block text-sm font-medium text-slate-700">AI Engine</label>
          <div className="mt-1 text-sm">
            Using local Ollama (Phi-3.5 mini) inside the container. No API key required.
          </div>
          <p className="text-xs text-slate-500 mt-1">All AI analysis runs locally via the embedded Ollama service. No data leaves the container.</p>
        </div>
      </div>
    </div>
  )
}
