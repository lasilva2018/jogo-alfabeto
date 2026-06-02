import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getAudioManager } from '../../lib/audio/AudioManager'
import { LONG_CELEBRATION_AUTO_ADVANCE_MS } from '../../lib/gameConstants'
import { WORD_BANK, Letter } from '../../data/letters'
import { useChildProfile } from '../../stores/useChildProfile'
import { AlfafaMini } from '../mascot/Alfafa'

interface WordForBuilding {
  word: string
  emoji: string
  letters: string[]   // upper case letters in order
}

interface GameState {
  target: WordForBuilding
  built: string[]           // letters the child has correctly placed so far
  availableLetters: string[] // shuffled letters (correct + distractors)
  usedIndices: number[]     // which available letters were already tapped (correct ones)
  isComplete: boolean
  lastWrong: string | null
}

function getRandomBuildableWord(): WordForBuilding {
  // Prefer words with 3 or 4 letters (good for 4 year olds)
  const allExamples: Array<{ letter: Letter; example: { word: string; emoji: string } }> = []
  
  Object.entries(WORD_BANK).forEach(([letter, examples]) => {
    examples.forEach(ex => {
      if (ex.word.length >= 3 && ex.word.length <= 4) {
        allExamples.push({ letter: letter as Letter, example: ex })
      }
    })
  })

  const random = allExamples[Math.floor(Math.random() * allExamples.length)]
  const upperWord = random.example.word.toUpperCase()
  
  return {
    word: upperWord,
    emoji: random.example.emoji,
    letters: upperWord.split(''),
  }
}

function generateAvailableLetters(targetLetters: string[]): string[] {
  const distractors = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    .split('')
    .filter(l => !targetLetters.includes(l))
    .sort(() => Math.random() - 0.5)
    .slice(0, 2) // 2 distractors

  const all = [...targetLetters, ...distractors]
  return all.sort(() => Math.random() - 0.5)
}

export function MontePalavraGame() {
  const { profile } = useChildProfile()
  const childName = profile?.name || 'amiguinho'

  const [score, setScore] = useState({ correct: 0, mistakes: 0 })
  const [game, setGame] = useState<GameState>(() => createNewRound())

  function createNewRound(): GameState {
    const target = getRandomBuildableWord()
    const available = generateAvailableLetters(target.letters)
    
    return {
      target,
      built: [],
      availableLetters: available,
      usedIndices: [],
      isComplete: false,
      lastWrong: null,
    }
  }

  const nextRound = useCallback(() => {
    const newGame = createNewRound()
    setGame(newGame)
  }, [])

  const handleLetterTap = async (letter: string, index: number) => {
    if (game.isComplete) return
    if (game.usedIndices.includes(index)) return

    const nextNeededIndex = game.built.length
    const isCorrect = letter === game.target.letters[nextNeededIndex]

    if (isCorrect) {
      const newBuilt = [...game.built, letter]
      const newUsed = [...game.usedIndices, index]
      const isNowComplete = newBuilt.length === game.target.letters.length

      setGame(prev => ({
        ...prev,
        built: newBuilt,
        usedIndices: newUsed,
        isComplete: isNowComplete,
        lastWrong: null,
      }))

      if (isNowComplete) {
        setScore(s => ({ ...s, correct: s.correct + 1 }))
        useChildProfile.getState().addStars(2) // 2 stars: jogo de construção/sequenciação é mais desafiador
        useChildProfile.getState().recordLetterPractice(game.target.letters[0], true)

        await getAudioManager().playSuccess()

        const fullWord = game.target.word
        const speakText = `Perfeito, ${childName}! Você montou ${fullWord} certinho! Que legal!`
        // Voz principal feminina
        getAudioManager().speakPhrase(speakText)

        setTimeout(() => {
          nextRound()
        }, LONG_CELEBRATION_AUTO_ADVANCE_MS)
      } else {
        // Partial success - encourage next letter (voz principal feminina)
        const speakText = `${letter}! Muito bem!`
        getAudioManager().speakPhrase(speakText)
      }
    } else {
      // Wrong letter
      setScore(s => ({ ...s, mistakes: s.mistakes + 1 }))
      useChildProfile.getState().recordLetterPractice(letter, false)

      await getAudioManager().playMistake()

      setGame(prev => ({ ...prev, lastWrong: letter }))

      setTimeout(() => {
        setGame(prev => ({ ...prev, lastWrong: null }))
      }, 600)
    }
  }

  const handleClear = () => {
    setGame(prev => ({
      ...prev,
      built: [],
      usedIndices: [],
      lastWrong: null,
    }))
  }

  const handleSpeakHint = () => {
    const message = `Monte a palavra ${game.target.word} tocando as letras na ordem certa, ${childName}!`
    // Voz principal feminina
    getAudioManager().speakPhrase(message)
  }

  const blanks = game.target.letters.map((_, i) => game.built[i] || '_')

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-purple-50 to-pink-50 flex flex-col safe-area">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-5 pt-4 pb-3 bg-white/70 backdrop-blur-lg border-b border-white/60">
        <div className="flex items-center gap-3">
          <div className="text-4xl">{profile?.avatar || '🐘'}</div>
          <div>
            <div className="text-sm font-medium text-purple-700">{profile?.name || 'Alfafa'}</div>
            <div className="text-[10px] text-gray-500 -mt-0.5">Monte a Palavra</div>
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
        
        {/* Instruction + Emoji */}
        <div className="flex items-center gap-4 mb-5">
          <AlfafaMini mood="encouraging" />
          <div className="text-center">
            <p className="text-2xl font-bold text-violet-600">
              Monte a palavra!
            </p>
            <button 
              onClick={handleSpeakHint}
              className="mt-1 text-sm text-purple-600 active:opacity-70"
            >
              🔊 Ouvir o pedido
            </button>
          </div>
        </div>

        {/* Big Emoji + Building Word */}
        <div className="flex flex-col items-center mb-8">
          <div className="text-[92px] mb-3 drop-shadow-sm">{game.target.emoji}</div>
          
          <div className="flex gap-2 mb-2">
            {blanks.map((char, i) => (
              <div
                key={i}
                className={`
                  w-14 h-16 flex items-center justify-center text-4xl font-black rounded-2xl border-4
                  ${char === '_' 
                    ? 'border-violet-200 bg-white text-transparent' 
                    : 'border-violet-400 bg-violet-100 text-violet-700'
                  }
                  transition-all
                `}
              >
                {char}
              </div>
            ))}
          </div>
          
          <div className="text-sm text-gray-500 mt-1">
            {game.target.word.length} letras
          </div>
        </div>

        {/* Letter Buttons - flex wrap para toques grandes e confortáveis */}
        <div className="flex flex-wrap justify-center gap-3 w-full max-w-[340px] mb-6">
          {game.availableLetters.map((letter, index) => {
            const isUsed = game.usedIndices.includes(index)
            const isWrong = game.lastWrong === letter

            return (
              <button
                key={`${letter}-${index}`}
                onClick={() => handleLetterTap(letter, index)}
                disabled={isUsed || game.isComplete}
                className={`
                  min-w-[56px] h-14 px-3 text-3xl font-black rounded-2xl border-4 active:scale-95 transition-all
                  ${isUsed 
                    ? 'border-gray-200 bg-gray-100 text-gray-400' 
                    : isWrong 
                      ? 'border-red-400 bg-red-100 text-red-600 animate-pulse' 
                      : 'border-violet-300 bg-white text-violet-700 hover:border-violet-400'
                  }
                  disabled:opacity-60
                `}
              >
                {letter}
              </button>
            )
          })}
        </div>

        {/* Actions */}
        <div className="flex gap-4 w-full max-w-[340px]">
          <button
            onClick={handleClear}
            disabled={game.built.length === 0 || game.isComplete}
            className="flex-1 bg-white border-2 border-violet-300 text-violet-700 font-bold py-4 rounded-3xl text-xl active:bg-violet-50 disabled:opacity-40"
          >
            Limpar
          </button>
        </div>

        {/* Feedback */}
        <div className="h-12 mt-6 text-center">
          <AnimatePresence>
            {game.isComplete && (
              <motion.p 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-green-600 font-bold text-2xl"
              >
                Você conseguiu! ⭐⭐
              </motion.p>
            )}
            {game.lastWrong && (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-red-500 font-semibold text-xl"
              >
                Essa não é a próxima...
              </motion.p>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  )
}
