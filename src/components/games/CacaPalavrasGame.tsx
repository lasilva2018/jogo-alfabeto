import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getAudioManager } from '../../lib/audio/AudioManager'
import { SUCCESS_AUTO_ADVANCE_MS } from '../../lib/gameConstants'
import { WORD_BANK, Letter } from '../../data/letters'
import { useChildProfile, getChildVocative, getChildDisplayName, personalizeSpeech } from '../../stores/useChildProfile'
import { AlfafaMini } from '../mascot/Alfafa'

interface GridItem {
  emoji: string
  word: string
  letter: Letter
}

interface GameState {
  targetLetter: Letter
  grid: GridItem[]
  found: Set<number>
  totalToFind: number
  isLocked: boolean
  lastResult: 'correct' | 'wrong' | null
}

const GRID_SIZE = 12 // 3x4 grid
const TARGET_COUNT = 3

function getAllWordExamples(): Array<{ letter: Letter; example: { word: string; emoji: string } }> {
  const result: Array<{ letter: Letter; example: { word: string; emoji: string } }> = []
  Object.entries(WORD_BANK).forEach(([letter, examples]) => {
    examples.forEach(ex => {
      result.push({ letter: letter as Letter, example: ex })
    })
  })
  return result
}

function generateGrid(target: Letter): GridItem[] {
  const all = getAllWordExamples()
  
  // Get target examples (prefer unique words)
  const targetExamples = all
    .filter(item => item.letter === target)
    .sort(() => Math.random() - 0.5)
    .slice(0, TARGET_COUNT)
  
  // Fill with target items
  const grid: GridItem[] = targetExamples.map(item => ({
    emoji: item.example.emoji,
    word: item.example.word,
    letter: item.letter,
  }))
  
  // Fill the rest with distractors (different letters)
  const distractors = all.filter(item => item.letter !== target)
  const needed = GRID_SIZE - TARGET_COUNT
  
  for (let i = 0; i < needed; i++) {
    const random = distractors[Math.floor(Math.random() * distractors.length)]
    grid.push({
      emoji: random.example.emoji,
      word: random.example.word,
      letter: random.letter,
    })
  }
  
  // Shuffle
  return grid.sort(() => Math.random() - 0.5)
}

function pickTargetLetter(): Letter {
  const lettersWithEnough = Object.keys(WORD_BANK).filter(
    l => WORD_BANK[l].length >= 2
  ) as Letter[]
  return lettersWithEnough[Math.floor(Math.random() * lettersWithEnough.length)]
}

export function CacaPalavrasGame() {
  const { profile } = useChildProfile()
  const speechName = getChildVocative(profile)
  const displayName = getChildDisplayName(profile)

  const [score, setScore] = useState({ correct: 0, mistakes: 0 })
  const [game, setGame] = useState<GameState>(() => createNewRound())

  function createNewRound(): GameState {
    const target = pickTargetLetter()
    const grid = generateGrid(target)
    
    return {
      targetLetter: target,
      grid,
      found: new Set(),
      totalToFind: TARGET_COUNT,
      isLocked: false,
      lastResult: null,
    }
  }

  const nextRound = useCallback(() => {
    const newGame = createNewRound()
    setGame(newGame)
  }, [])

  const handleTap = async (index: number) => {
    if (game.isLocked) return
    if (game.found.has(index)) return

    const tappedItem = game.grid[index]
    const isCorrect = tappedItem.letter === game.targetLetter

    if (isCorrect) {
      const newFound = new Set(game.found)
      newFound.add(index)

      setGame(prev => ({
        ...prev,
        found: newFound,
        lastResult: 'correct',
      }))

      await getAudioManager().playSuccess()

      // Check if round complete
      if (newFound.size === game.totalToFind) {
        setScore(s => ({ ...s, correct: s.correct + 1 }))
        useChildProfile.getState().addStars(2) // 2 stars: caça com múltiplos alvos é mais desafiadora
        useChildProfile.getState().recordLetterPractice(game.targetLetter, true)

        const speakText = speechName
          ? `Isso, ${speechName}! Você encontrou todas as palavras com ${game.targetLetter}! Que caçador incrível!`
          : `Isso! Você encontrou todas as palavras com ${game.targetLetter}! Que caçador incrível!`
        // Voz principal feminina - aguardamos para evitar sobreposição de áudio
        await getAudioManager().speakPhrase(speakText)

        setTimeout(() => {
          nextRound()
        }, SUCCESS_AUTO_ADVANCE_MS)
      }
    } else {
      // Wrong tap - gentle feedback, no mark
      // Não registramos no mastery para evitar poluir letras que não são o alvo da caçada
      setScore(s => ({ ...s, mistakes: s.mistakes + 1 }))

      await getAudioManager().playMistake()

      setGame(prev => ({ ...prev, lastResult: 'wrong' }))

      setTimeout(() => {
        setGame(prev => ({ ...prev, lastResult: null }))
      }, 500)
    }
  }

  const handleSpeakHint = () => {
    if (game.isLocked) return
    const message = speechName
      ? `Encontre todas as palavras que começam com a letra ${game.targetLetter}, ${speechName}!`
      : `Encontre todas as palavras que começam com a letra ${game.targetLetter}!`
    // Voz principal feminina
    getAudioManager().speakPhrase(message)
  }

  const foundCount = game.found.size

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-purple-50 to-pink-50 flex flex-col safe-area">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-5 pt-4 pb-3 bg-white/70 backdrop-blur-lg border-b border-white/60">
        <div className="flex items-center gap-3">
          <div className="text-4xl">{profile?.avatar || '🐘'}</div>
          <div>
            <div className="text-sm font-medium text-purple-700">{displayName}</div>
            <div className="text-[10px] text-gray-500 -mt-0.5">Caça às Palavras</div>
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
      </div>

      <div className="flex-1 flex flex-col items-center px-5 pt-5 pb-8">
        
        {/* Instruction */}
        <div className="flex items-center gap-3 mb-4">
          <AlfafaMini mood="thinking" />
          <div className="text-center">
            <p className="text-xl font-bold text-amber-600">
              Encontre as palavras com <span className="text-3xl font-black tracking-tighter">{game.targetLetter}</span>
            </p>
            <button 
              onClick={handleSpeakHint}
              className="mt-1 text-sm text-purple-600 active:opacity-70"
            >
              🔊 Ouvir o pedido
            </button>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-4 text-lg font-semibold text-amber-700">
          {foundCount} de {game.totalToFind} encontradas
        </div>

        {/* Grid 3x4 */}
        <div className="grid grid-cols-3 gap-2.5 w-full max-w-[340px]">
          {game.grid.map((item, index) => {
            const isFound = game.found.has(index)
            const isWrongTap = game.lastResult === 'wrong' && !isFound // simplistic last wrong flash

            return (
              <button
                key={index}
                onClick={() => handleTap(index)}
                disabled={isFound || game.isLocked}
                className={`
                  aspect-[4/3] flex flex-col items-center justify-center p-3 rounded-2xl border-4 transition-all active:scale-[0.97]
                  ${isFound 
                    ? 'border-green-400 bg-green-50' 
                    : isWrongTap 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-amber-200 bg-white hover:border-amber-300'
                  }
                  disabled:opacity-90
                `}
              >
                <div className="text-5xl mb-0.5">{item.emoji}</div>
                <div className={`text-lg font-bold text-center leading-tight ${isFound ? 'text-green-700' : 'text-gray-700'}`}>
                  {item.word}
                </div>
                {isFound && (
                  <div className="text-green-500 text-xs mt-0.5 font-bold">✓</div>
                )}
              </button>
            )
          })}
        </div>

        {/* Feedback area */}
        <div className="h-10 mt-6 text-center">
          <AnimatePresence>
            {foundCount === game.totalToFind && (
              <motion.p 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-green-600 font-bold text-2xl"
              >
                Você achou todas! ⭐⭐
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <div className="text-xs text-gray-400 mt-auto pb-2 text-center max-w-[280px]">
          Toque nas palavras que começam com a letra {game.targetLetter}. Cuidado com as outras!
        </div>

      </div>
    </div>
  )
}
