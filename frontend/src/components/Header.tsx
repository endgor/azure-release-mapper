export default function Header() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-semibold tracking-tight">CloudOps Azure Release Mapper</h1>
        <p className="mt-1 text-slate-600 max-w-3xl">
          Upload your Azure “All resources” CSV to discover which latest Azure updates are relevant to your existing resource types. Analyze with built-in heuristics and optionally enhance using local Ollama (Phi-3.5 mini).
        </p>
      </div>
    </header>
  )
}
