interface HeaderProps {
  isCompact?: boolean
}

export default function Header({ isCompact = false }: HeaderProps) {
  return (
    <header className="relative overflow-hidden">
      <div 
        className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600"
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #667eea 100%)',
        }}
      />
      <div className="absolute inset-0 bg-black/10" />
      <div className={`relative container mx-auto px-6 ${isCompact ? 'header-compact' : 'header-expanded'}`}>
        <div className="animate-fade-in">
          <h1 className={`font-bold tracking-tight text-white ${isCompact ? 'header-title-compact' : 'header-title-expanded'}`}>
            <span className="block">CloudOps Azure</span>
            <span className="block bg-gradient-to-r from-blue-200 to-cyan-200 bg-clip-text text-transparent">
              Release Mapper
            </span>
          </h1>
          <div className={isCompact ? 'header-description-hidden' : 'header-description'}>
            <p className="text-lg lg:text-xl text-blue-100/90 max-w-4xl leading-relaxed">
              Intelligently map Azure release notes to your infrastructure. Upload your resource inventory and discover relevant updates with AI-powered analysis.
            </p>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className={`absolute top-4 right-4 w-72 h-72 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-3xl ${isCompact ? 'header-decorations-hidden' : 'header-decorations'}`} />
        <div className={`absolute -bottom-12 -left-12 w-48 h-48 bg-gradient-to-br from-cyan-400/20 to-transparent rounded-full blur-2xl ${isCompact ? 'header-decorations-hidden' : 'header-decorations'}`} />
      </div>
    </header>
  )
}
