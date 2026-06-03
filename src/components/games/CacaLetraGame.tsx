import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getAudioManager } from '../../lib/audio/AudioManager'
import { SUCCESS_AUTO_ADVANCE_MS } from '../../lib/gameConstants'
import { AVAILABLE_LETTERS } from '../../data/letters'
import { useChildProfile, getChildVocative, getChildDisplayName, personalizeSpeech } from '../../stores/useChildProfile'
import { AlfafaMini } from '../mascot/Alfafa'
import { GameTopBar } from '../layout/GameTopBar'

type Letter = string

interface GameState {
  targetLetter: Letter
  grid: Letter[]
  found: Set<number>
  totalToFind: number
  isLocked: boolean
  lastResult: 'correct' | 'wrong' | null
}

const GRID_SIZE = 15 // 3x5 grid
const TARGET_COUNT = 4

function generateGrid(target: Letter): Letter[] {
  const grid: Letter[] = []
  
  // Add target letters
  for (let i = 0; i < TARGET_COUNT; i++) {
    grid.push(target)
  }
  
  // Fill the rest with random distractors
  const distractors = AVAILABLE_LETTERS.filter(l => l !== target)
  for (let i = TARGET_COUNT; i < GRID_SIZE; i++) {
    const random = distractors[Math.floor(Math.random() * distractors.length)]
    grid.push(random)
  }
  
  // Shuffle
  return grid.sort(() => Math.random() - 0.5)
}

export function CacaLetraGame() {
  const { profile } = useChildProfile()
  const speechName = getChildVocative(profile)
  const displayName = getChildDisplayName(profile)

  const [score, setScore] = useState({ correct: 0, mistakes: 0 })
  const [game, setGame] = useState<GameState>(() => createNewRound())

  function createNewRound(): GameState {
    const target = AVAILABLE_LETTERS[Math.floor(Math.random() * AVAILABLE_LETTERS.length)]
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

    const tappedLetter = game.grid[index]
    const isCorrect = tappedLetter === game.targetLetter

    if (isCorrect) {
      const newFound = new Set(game.found)
      newFound.add(index)

      const newGame = {
        ...game,
        found: newFound,
        lastResult: 'correct' as const,
      }

      setGame(newGame)

      // Play nice tap sound
      await getAudioManager().playSuccess()

      // Check if all found
      if (newFound.size === game.totalToFind) {
        setScore(s => ({ ...s, correct: s.correct + 1 }))
        useChildProfile.getState().addStars(1)
        useChildProfile.getState().recordLetterPractice(game.targetLetter, true)

        const speakText = personalizeSpeech(
          `Isso, {name}! Você encontrou todas as ${game.targetLetter}! Muito bem!`,
          `Isso! Você encontrou todas as ${game.targetLetter}! Muito bem!`,
          speechName
        )
        // Voz principal feminina
        await getAudioManager().speakPhrase(speakText)

        setTimeout(() => {
          nextRound()
        }, SUCCESS_AUTO_ADVANCE_MS)
      }
    } else {
      // Wrong tap - gentle feedback (não registramos erro no mastery para não poluir letras distratoras)
      setScore(s => ({ ...s, mistakes: s.mistakes + 1 }))
      setGame(prev => ({ ...prev, lastResult: 'wrong' }))

      await getAudioManager().playMistake()

      // Brief wiggle feedback then reset result
      setTimeout(() => {
        setGame(prev => ({ ...prev, lastResult: null }))
      }, 600)
    }
  }

  const handleSpeakHint = () => {
    if (game.isLocked) return
    const speakText = personalizeSpeech(
      `Encontre todas as letras ${game.targetLetter}, {name}!`,
      `Encontre todas as letras ${game.targetLetter}!`,
      speechName
    )
    // Voz principal feminina
    getAudioManager().speakPhrase(speakText)
  }

  const foundCount = game.found.size

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-purple-50 to-pink-50 flex flex-col safe-area">
      <GameTopBar title="Caça à Letra" score={{ correct: score.correct, mistakes: score.mistakes }} />

      {/* Game Area */}
      <div className="flex-1 flex flex-col px-5 pt-6 pb-8">
        
        {/* Instruction + Alfafa */}
        <div className="flex items-center gap-4 mb-6">
          <AlfafaMini mood={foundCount === game.totalToFind ? 'celebrating' : game.lastResult === 'wrong' ? 'encouraging' : 'happy'} />
          <div className="flex-1">
            <p className="text-2xl font-bold text-purple-700">
              Encontre todas as letras <span className="text-orange-500">{game.targetLetter}</span>!
            </p>
            <button 
              onClick={handleSpeakHint}
              disabled={game.isLocked}
              className="mt-1 text-sm text-purple-600 active:opacity-70"
            >
              🔊 Ouvir o pedido
            </button>
          </div>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-3 mb-4 px-1">
          <div className="text-lg font-semibold text-gray-700">
            Encontradas: <span className="text-purple-600">{foundCount}</span> de {game.totalToFind}
          </div>
          <div className="flex-1 h-3 bg-purple-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-purple-500 transition-all duration-300 rounded-full"
              style={{ width: `${(foundCount / game.totalToFind) * 100}%` }}
            />
          </div>
        </div>

        {/* Letter Grid */}
        <div className="grid grid-cols-3 gap-3 flex-1 content-start">
          {game.grid.map((letter, index) => {
            const isFound = game.found.has(index)
            const isTarget = letter === game.targetLetter
            const showAsCorrect = isFound && isTarget

            return (
              <motion.button
                key={index}
                whileTap={{ scale: 0.92 }}
                onClick={() => handleTap(index)}
                disabled={game.isLocked || isFound}
                className={`
                  aspect-square text-6xl font-black rounded-3xl border-4 flex items-center justify-center
                  transition-all active:scale-[0.95]
                  ${showAsCorrect 
                    ? 'bg-green-400 text-white border-green-500' 
                    : isFound 
                      ? 'bg-gray-200 text-gray-400 border-gray-300' 
                      : 'bg-white text-purple-700 border-purple-200'
                  }
                  ${game.lastResult === 'wrong' && !isFound ? 'animate-[wiggle_0.4s_ease-in-out]' : ''}
                `}
              >
                {letter}
              </motion.button>
            )
          })}
        </div>

        {/* Feedback */}
        <div className="h-10 mt-4 text-center">
          <AnimatePresence>
            {game.lastResult === 'wrong' && (
              <motion.p 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-orange-600 font-medium"
              >
                Essa não é {game.targetLetter}, {displayName}. Tenta outra!
              </motion.p>
            )}
            {foundCount === game.totalToFind && (
              <motion.p 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-green-600 font-bold text-xl"
              >
                Parabéns, {displayName}! Você conseguiu! ⭐
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}