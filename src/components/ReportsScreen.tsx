import { useCurrentProfile, getChildDisplayName } from '../stores/useChildProfile'
import { Alfafa } from './mascot/Alfafa'

export function ReportsScreen({ onBack }: { onBack: () => void }) {
  const profile = useCurrentProfile()
  const displayName = getChildDisplayName(profile)
  const mastery = profile?.letterMastery || {}
  const stars = profile?.stars || 0

  const entries = Object.entries(mastery)
    .map(([letter, data]) => {
      const acc = data.attempts > 0 ? Math.round((data.correct / data.attempts) * 100) : 0
      return {
        letter,
        correct: data.correct,
        attempts: data.attempts,
        accuracy: acc,
      }
    })
    .sort((a, b) => b.attempts - a.attempts)

  const totalAttempts = entries.reduce((sum, e) => sum + e.attempts, 0)
  const totalCorrect = entries.reduce((sum, e) => sum + e.correct, 0)
  const overallAccuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0

  const weakLetters = entries
    .filter(e => e.attempts >= 2 && e.accuracy < 70)
    .slice(0, 5)
    .map(e => e.letter)

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-purple-50 to-pink-50 flex flex-col safe-area">
      {/* Header */}
      <div className="px-5 pt-4 pb-3 bg-white/70 backdrop-blur-lg border-b border-white/60 flex items-center justify-between">
        <button 
          onClick={onBack}
          className="text-purple-600 font-medium flex items-center gap-1 text-lg active:opacity-70"
        >
          ← Voltar
        </button>
        <div className="text-sm text-gray-500">Relatórios para Pais</div>
        <div className="w-8" />
      </div>

      <div className="flex-1 px-6 pt-6 pb-8 overflow-auto">
        <div className="flex items-center gap-4 mb-6">
          <Alfafa mood="happy" size="md" />
          <div>
            <h1 className="text-3xl font-bold text-purple-700">Relatório de {displayName}</h1>
            <p className="text-gray-600">Progresso detalhado • {stars} estrelinhas</p>
          </div>
        </div>

        {/* Resumo */}
        <div className="bg-white rounded-3xl p-5 mb-6 shadow-sm border border-purple-100">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-3xl font-black text-purple-600">{entries.length}</div>
              <div className="text-xs text-gray-500">letras praticadas</div>
            </div>
            <div>
              <div className="text-3xl font-black text-green-600">{overallAccuracy}%</div>
              <div className="text-xs text-gray-500">acertos gerais</div>
            </div>
            <div>
              <div className="text-3xl font-black text-amber-600">{totalAttempts}</div>
              <div className="text-xs text-gray-500">tentativas totais</div>
            </div>
          </div>
        </div>

        {/* Letras fracas */}
        {weakLetters.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5 mb-6">
            <h2 className="font-semibold text-amber-700 mb-2">Letras que precisam de mais prática</h2>
            <div className="flex flex-wrap gap-2">
              {weakLetters.map(l => (
                <span key={l} className="px-3 py-1 bg-white rounded-2xl text-lg font-bold text-amber-700 border border-amber-300">
                  {l}
                </span>
              ))}
            </div>
            <p className="text-xs text-amber-600 mt-2">Sugestão: foque nestas letras nos próximos dias.</p>
          </div>
        )}

        {/* Lista detalhada */}
        <h2 className="font-semibold text-xl mb-3">Desempenho por letra</h2>
        {entries.length > 0 ? (
          <div className="space-y-3">
            {entries.map(({ letter, correct, attempts, accuracy }) => (
              <div key={letter} className="bg-white rounded-3xl p-4 border border-purple-100 flex items-center gap-4">
                <div className="text-4xl font-black w-10 text-purple-700">{letter}</div>
                <div className="flex-1">
                  <div className="flex justify-between text-sm">
                    <span>{correct}/{attempts} acertos</span>
                    <span className="font-semibold">{accuracy}%</span>
                  </div>
                  <div className="h-2 bg-purple-100 rounded mt-1 overflow-hidden">
                    <div 
                      className="h-2 bg-purple-600 rounded" 
                      style={{ width: `${accuracy}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white/80 rounded-3xl p-8 text-center">
            <p className="text-gray-600">Ainda não há dados suficientes. Brinque mais um pouco!</p>
          </div>
        )}

        <p className="mt-8 text-[10px] text-gray-400 text-center">
          Dados sincronizados com a nuvem quando conectado. Bom para acompanhar o desenvolvimento.
        </p>
      </div>
    </div>
  )
}