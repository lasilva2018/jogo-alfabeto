import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getAudioManager } from '../../lib/audio/AudioManager'
import { LONG_CELEBRATION_AUTO_ADVANCE_MS } from '../../lib/gameConstants'
import { AVAILABLE_LETTERS, getRandomExample, Letter } from '../../data/letters'
import { useChildProfile } from '../../stores/useChildProfile'
import { AlfafaMini } from '../mascot/Alfafa'

interface MemoryCard {
  id: number
  letter: Letter
  display: string
  emoji: string
  isWord: boolean
  pairId: string
}

interface GameState {
  cards: MemoryCard[]
  flipped: number[]
  matched: Set<string>
  isChecking: boolean
  roundComplete: boolean
}

function generateMemoryCards(): MemoryCard[] {
  // Seleciona 3 letras diferentes que tenham exemplos
  const shuffledLetters = [...AVAILABLE_LETTERS].sort(() => Math.random() - 0.5)
  const selectedLetters = shuffledLetters.slice(0, 3)

  const cards: MemoryCard[] = []
  let id = 0

  selectedLetters.forEach((letter) => {
    const example = getRandomExample(letter)
    
    // Carta da Letra
    cards.push({
      id: id++,
      letter,
      display: letter,
      emoji: '',
      isWord: false,
      pairId: letter,
    })
    
    // Carta da Palavra/Emoji
    cards.push({
      id: id++,
      letter,
      display: example.word,
      emoji: example.emoji,
      isWord: true,
      pairId: letter,
    })
  })

  // Embaralha as 6 cartas
  return cards.sort(() => Math.random() - 0.5)
}

export function MemoriaGame() {
  const { profile } = useChildProfile()
  const childName = profile?.name || 'amiguinho'

  const [score, setScore] = useState({ correct: 0, mistakes: 0 })
  const [game, setGame] = useState<GameState>(() => createNewRound())

  function createNewRound(): GameState {
    return {
      cards: generateMemoryCards(),
      flipped: [],
      matched: new Set(),
      isChecking: false,
      roundComplete: false,
    }
  }

  const nextRound = useCallback(() => {
    const newGame = createNewRound()
    setGame(newGame)
  }, [])

  const handleCardTap = async (index: number) => {
    const card = game.cards[index]

    // Impede toques inválidos
    if (game.isChecking) return
    if (game.flipped.includes(index)) return
    if (game.matched.has(card.pairId)) return
    if (game.flipped.length === 2) return

    const newFlipped = [...game.flipped, index]
    setGame(prev => ({ ...prev, flipped: newFlipped }))

    // Se virou 2 cartas, verifica se formam par
    if (newFlipped.length === 2) {
      const [firstIdx, secondIdx] = newFlipped
      const firstCard = game.cards[firstIdx]
      const secondCard = game.cards[secondIdx]

      const isMatch = firstCard.pairId === secondCard.pairId

      if (isMatch) {
        // Par encontrado!
        const newMatched = new Set(game.matched)
        newMatched.add(firstCard.pairId)

        setGame(prev => ({
          ...prev,
          matched: newMatched,
          isChecking: false,
          flipped: [],
        }))

        setScore(s => ({ ...s, correct: s.correct + 1 }))
        useChildProfile.getState().addStars(1)
        useChildProfile.getState().recordLetterPractice(firstCard.letter, true)

        await getAudioManager().playSuccess()

        const speakText = `Par encontrado! ${firstCard.letter} de ${secondCard.isWord ? secondCard.display : firstCard.display}. Muito bem, ${childName}!`
        getAudioManager().speakAsAlfafa(speakText)

        // Verifica se o round terminou (3 pares)
        if (newMatched.size === 3) {
          setTimeout(() => {
            setGame(prev => ({ ...prev, roundComplete: true }))
            
            // Nova rodada automática após celebração
            setTimeout(() => {
              nextRound()
            }, LONG_CELEBRATION_AUTO_ADVANCE_MS)
          }, 600)
        }
      } else {
        // Não é par - erro
        setScore(s => ({ ...s, mistakes: s.mistakes + 1 }))
        useChildProfile.getState().recordLetterPractice(firstCard.letter, false)

        await getAudioManager().playMistake()

        setGame(prev => ({ ...prev, isChecking: true }))

        // Espera um pouco e vira as cartas de volta
        setTimeout(() => {
          setGame(prev => ({
            ...prev,
            flipped: [],
            isChecking: false,
          }))
        }, 1100)
      }
    }
  }

  const handleSpeakHint = () => {
    if (game.isChecking) return

    const message = `Vire as cartas e encontre os pares, ${childName}!`
    getAudioManager().speakAsAlfafa(message)
  }

  const isCardOpen = (index: number) => {
    const card = game.cards[index]
    return game.flipped.includes(index) || game.matched.has(card.pairId)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-purple-50 to-pink-50 flex flex-col safe-area">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-5 pt-4 pb-3 bg-white/70 backdrop-blur-lg border-b border-white/60">
        <div className="flex items-center gap-3">
          <div className="text-4xl">{profile?.avatar || '🐘'}</div>
          <div>
            <div className="text-sm font-medium text-purple-700">{profile?.name || 'Alfafa'}</div>
            <div className="text-[10px] text-gray-500 -mt-0.5">Jogo da Memória</div>
          </div>
        </div>

        <div className="flex gap-4 text-sm font-semibold">
          <div className="flex items-center gap-1.5 bg-green-100 text-green-700 px-3 py-1 rounded-2xl">
            ✅ <span>{score.correct}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-red-100 text-red-600 px-3 py-1 rounded-2xl">
            ❌ <span>{score.mistakes}</span>
          </div>
        </div>

        <button
          onClick={() => {
            if (confirm('Quer começar com outro nome?')) {
              useChildProfile.getState().clearProfile()
            }
          }}
          className="text-xl opacity-50 active:opacity-100 px-2"
          title="Trocar perfil"
        >
          ⚙️
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center px-6 pt-6 pb-8">
        
        {/* Instruction */}
        <div className="flex items-center gap-4 mb-6">
          <AlfafaMini mood={game.roundComplete ? "celebrating" : "happy"} />
          <div className="text-center">
            <p className="text-2xl font-bold text-sky-600">
              {game.roundComplete ? "Parabéns! 🎉" : "Encontre os pares!"}
            </p>
            <button 
              onClick={handleSpeakHint}
              className="mt-1 text-sm text-purple-600 active:opacity-70"
            >
              🔊 Ouvir o pedido
            </button>
          </div>
        </div>

        {/* Memory Grid - 2x3 */}
        <div className="grid grid-cols-3 gap-3 w-full max-w-[340px]">
          {game.cards.map((card, index) => {
            const isOpen = isCardOpen(index)
            const isMatched = game.matched.has(card.pairId)

            return (
              <button
                key={card.id}
                onClick={() => handleCardTap(index)}
                disabled={isOpen || game.isChecking}
                className="relative aspect-[4/3] rounded-2xl focus:outline-none"
                style={{ perspective: '1000px' }}
              >
                <motion.div
                  className={`
                    absolute inset-0 rounded-2xl border-4 [transform-style:preserve-3d]
                    ${isOpen 
                      ? isMatched 
                        ? 'border-green-400 bg-green-50' 
                        : 'border-sky-300 bg-white' 
                      : 'border-sky-200 bg-gradient-to-br from-sky-400 via-sky-500 to-indigo-500 shadow-inner'
                    }
                  `}
                  animate={{ rotateY: isOpen ? 0 : 180 }}
                  transition={{ 
                    type: 'spring', 
                    stiffness: 260, 
                    damping: 20,
                    duration: 0.4 
                  }}
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  {/* Front face (visible when open) */}
                  <div 
                    className={`absolute inset-0 flex flex-col items-center justify-center p-2 ${isMatched ? 'bg-green-50' : 'bg-white'}`}
                    style={{ 
                      backfaceVisibility: 'hidden',
                      transform: 'rotateY(0deg)' 
                    }}
                  >
                    {card.isWord ? (
                      <>
                        <div className="text-5xl mb-1">{card.emoji}</div>
                        <div className="text-lg font-bold text-gray-800 text-center leading-tight">
                          {card.display}
                        </div>
                      </>
                    ) : (
                      <div className="text-6xl font-black text-sky-700 tracking-tighter">
                        {card.display}
                      </div>
                    )}
                  </div>

                  {/* Back face (visible when closed) */}
                  <div 
                    className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-sky-400 via-sky-500 to-indigo-500 shadow-inner"
                    style={{ 
                      backfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)' 
                    }}
                  >
                    <div className="text-4xl opacity-90">🐘</div>
                  </div>
                </motion.div>
              </button>
            )
          })}
        </div>

        {/* Status / Feedback */}
        <div className="h-14 mt-8 text-center flex flex-col items-center justify-center">
          <AnimatePresence>
            {game.roundComplete && (
              <motion.p 
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="text-green-600 font-bold text-2xl"
              >
                Você encontrou todos! ⭐⭐
              </motion.p>
            )}
            {!game.roundComplete && game.flipped.length === 1 && (
              <p className="text-gray-500 text-lg">
                Vire outra carta...
              </p>
            )}
            {!game.roundComplete && game.flipped.length === 2 && game.isChecking && (
              <p className="text-sky-600 font-medium text-lg">
                Será que combinam?
              </p>
            )}
          </AnimatePresence>
        </div>

        <div className="text-xs text-gray-400 mt-auto pb-2">
          Toque nas cartas para virar. Encontre os 3 pares!
        </div>

      </div>
    </div>
  )
}
