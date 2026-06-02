import { useCurrentProfile } from '../stores/useChildProfile'
import { Alfafa } from './mascot/Alfafa'

interface LetterCardProps {
  letter: string
  correct: number
  attempts: number
}

function LetterCard({ letter, correct, attempts }: LetterCardProps) {
  const accuracy = attempts > 0 ? Math.round((correct / attempts) * 100) : 0
  
  // Simple mastery levels
  let masteryColor = 'bg-gray-200 text-gray-500'
  let masteryLabel = 'Ainda não praticou'
  let stars = 0

  if (attempts > 0) {
    if (accuracy >= 80 && attempts >= 4) {
      masteryColor = 'bg-green-400 text-white'
      masteryLabel = 'Muito bem!'
      stars = 3
    } else if (accuracy >= 60) {
      masteryColor = 'bg-yellow-400 text-white'
      masteryLabel = 'Está indo bem!'
      stars = 2
    } else {
      masteryColor = 'bg-orange-400 text-white'
      masteryLabel = 'Continue praticando'
      stars = 1
    }
  }

  return (
    <div className="bg-white rounded-3xl p-4 shadow-md border-2 border-purple-100 flex flex-col items-center">
      <div className="text-7xl font-black text-purple-700 mb-1">{letter}</div>
      
      <div className="flex gap-1 mb-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <span key={i} className={i < stars ? 'text-yellow-500' : 'text-gray-300'}>
            ⭐
          </span>
        ))}
      </div>

      <div className={`text-xs font-semibold px-3 py-1 rounded-full ${masteryColor}`}>
        {masteryLabel}
      </div>

      {attempts > 0 && (
        <div className="text-[10px] text-gray-500 mt-1.5">
          {correct}/{attempts} acertos
        </div>
      )}
    </div>
  )
}

export function MinhasLetras({ onBack }: { onBack: () => void }) {
  const profile = useCurrentProfile()
  const mastery = profile?.letterMastery || {}
  const name = profile?.name || 'amiguinho'

  const practicedLetters = Object.entries(mastery)
    .sort(([a], [b]) => a.localeCompare(b))

  const totalPracticed = practicedLetters.length
  const masteredCount = practicedLetters.filter(([_, data]) => {
    const acc = data.attempts > 0 ? (data.correct / data.attempts) * 100 : 0
    return acc >= 80 && data.attempts >= 4
  }).length

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
        <div className="text-sm text-gray-500">Minhas Letras</div>
        <div className="w-8" />
      </div>

      <div className="flex-1 px-5 pt-6 pb-8 overflow-auto">
        <div className="flex items-center gap-4 mb-6">
          <Alfafa mood="happy" size="md" />
          <div>
            <h1 className="text-3xl font-bold text-purple-700">Minhas Letras</h1>
            <p className="text-gray-600">Olha o que você já aprendeu, {name}!</p>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-white rounded-3xl p-5 mb-6 shadow-sm border border-purple-100">
          <div className="flex justify-between text-center">
            <div>
              <div className="text-4xl font-black text-purple-600">{totalPracticed}</div>
              <div className="text-xs text-gray-500">letras praticadas</div>
            </div>
            <div>
              <div className="text-4xl font-black text-green-500">{masteredCount}</div>
              <div className="text-xs text-gray-500">já dominadas</div>
            </div>
            <div>
              <div className="text-4xl font-black text-yellow-500">{profile?.stars || 0}</div>
              <div className="text-xs text-gray-500">estrelinhas</div>
            </div>
          </div>
        </div>

        {/* Letters Grid */}
        {practicedLetters.length > 0 ? (
          <div className="grid grid-cols-3 gap-3">
            {practicedLetters.map(([letter, data]) => (
              <LetterCard 
                key={letter} 
                letter={letter} 
                correct={data.correct} 
                attempts={data.attempts} 
              />
            ))}
          </div>
        ) : (
          <div className="bg-white/80 rounded-3xl p-8 text-center">
            <Alfafa mood="thinking" size="lg" />
            <p className="mt-4 text-lg text-gray-600">
              Comece a brincar nos jogos!<br />Suas letras vão aparecer aqui.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}