function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-purple-50 to-pink-50 flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        {/* Alfafa placeholder - depois vira um componente lindo com Framer Motion */}
        <div className="text-[120px] mb-4 drop-shadow-md">🐘</div>
        
        <div className="bg-white/90 backdrop-blur rounded-3xl px-8 py-10 shadow-xl border border-white">
          <h1 className="text-4xl font-bold text-purple-600 mb-3 tracking-tight">
            Olá! Eu sou o <span className="text-orange-500">Alfafa</span>
          </h1>
          
          <p className="text-2xl text-gray-700 mb-8 leading-tight">
            O elefantinho mais fofo do mundo!
          </p>

          <div className="space-y-3 text-left bg-orange-50 rounded-2xl p-5 text-sm">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-gray-700">Projeto inicializado com sucesso</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-gray-700">AudioManager pronto (Speech + sons fofos)</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-gray-700">Banco de palavras das vogais migrado</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-gray-700">PWA + Vite configurados</span>
            </div>
          </div>

          <p className="text-xs text-gray-400 mt-6">
            Fase 0 • Alfafa o Elefantinho • Apenas neste jogo
          </p>
        </div>
      </div>
    </div>
  )
}

export default App
