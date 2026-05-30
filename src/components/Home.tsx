import { TouchLetterGame } from './games/TouchLetterGame'
import { QualComecoGame } from './games/QualComecoGame'
import { RewardsScreen } from './RewardsScreen'
import { useChildProfile } from '../stores/useChildProfile'
import { useState } from 'react'

type Screen = 'home' | 'touch-letter' | 'qual-comeco' | 'rewards'

export function Home() {
  const { profile } = useChildProfile()
  const [currentScreen, setCurrentScreen] = useState<Screen>('home')

  const childName = profile?.name || 'amiguinho'
  const avatar = profile?.avatar || '🐘'
  const stars = profile?.stars || 0

  if (currentScreen === 'touch-letter') {
    return (
      <div>
        <div className="bg-white/80 backdrop-blur px-4 py-3 flex items-center justify-between border-b">
          <button 
            onClick={() => setCurrentScreen('home')}
            className="text-purple-600 font-medium flex items-center gap-1 text-lg active:opacity-70"
          >
            ← Voltar
          </button>
          <div className="text-sm text-gray-500">Toque a Letra</div>
          <div className="w-8" />
        </div>
        <TouchLetterGame />
      </div>
    )
  }

  if (currentScreen === 'qual-comeco') {
    return (
      <div>
        <div className="bg-white/80 backdrop-blur px-4 py-3 flex items-center justify-between border-b">
          <button 
            onClick={() => setCurrentScreen('home')}
            className="text-purple-600 font-medium flex items-center gap-1 text-lg active:opacity-70"
          >
            ← Voltar
          </button>
          <div className="text-sm text-gray-500">Qual o Começo?</div>
          <div className="w-8" />
        </div>
        <QualComecoGame />
      </div>
    )
  }

  if (currentScreen === 'rewards') {
    return <RewardsScreen onBack={() => setCurrentScreen('home')} />
  }

  // Home / Game Selector
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-purple-50 to-pink-50 flex flex-col safe-area">
      {/* Header */}
      <div className="px-6 pt-8 pb-4 flex items-center gap-4">
        <div className="text-6xl">{avatar}</div>
        <div>
          <div className="text-sm text-purple-600">Olá, {childName}!</div>
          <div className="text-3xl font-bold text-gray-800">O que vamos brincar hoje?</div>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center px-6 gap-5 pb-12">
        
        {/* Game 1 */}
        <button
          onClick={() => setCurrentScreen('touch-letter')}
          className="bg-white rounded-3xl p-6 shadow-lg border-2 border-purple-100 active:scale-[0.985] transition-transform text-left"
        >
          <div className="flex items-center gap-5">
            <div className="text-7xl">🔤</div>
            <div className="flex-1">
              <div className="text-3xl font-bold text-purple-700">Toque a Letra</div>
              <div className="text-lg text-gray-600 mt-1">Encontre a letra certa</div>
            </div>
          </div>
        </button>

        {/* Game 2 */}
        <button
          onClick={() => setCurrentScreen('qual-comeco')}
          className="bg-white rounded-3xl p-6 shadow-lg border-2 border-orange-100 active:scale-[0.985] transition-transform text-left"
        >
          <div className="flex items-center gap-5">
            <div className="text-7xl">❓</div>
            <div className="flex-1">
              <div className="text-3xl font-bold text-orange-600">Qual o Começo?</div>
              <div className="text-lg text-gray-600 mt-1">Qual letra começa a palavra?</div>
            </div>
          </div>
        </button>

        {/* Rewards Button */}
        <button
          onClick={() => setCurrentScreen('rewards')}
          className="bg-white rounded-3xl p-6 shadow-lg border-2 border-yellow-200 active:scale-[0.985] transition-transform text-left mt-2"
        >
          <div className="flex items-center gap-5">
            <div className="text-6xl">⭐</div>
            <div className="flex-1">
              <div className="text-3xl font-bold text-yellow-600">Meu Tesouro</div>
              <div className="text-lg text-gray-600 mt-1">
                {stars} estrelinha{stars !== 1 ? 's' : ''} brilhando
              </div>
            </div>
          </div>
        </button>

      </div>

      <div className="text-center pb-6 text-xs text-gray-400">
        Quanto mais você brinca, mais estrelinhas ganha!
      </div>
    </div>
  )
}