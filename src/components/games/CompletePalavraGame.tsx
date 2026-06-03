import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { getAudioManager } from '../../lib/audio/AudioManager'
import { SUCCESS_AUTO_ADVANCE_MS } from '../../lib/gameConstants'
import { getRandomWord, getRandomDistractors } from '../../data/letters'
import { useChildProfile, getChildVocative, getChildDisplayName } from '../../stores/useChildProfile'
import { AlfafaMini } from '../mascot/Alfafa'

interface GameState {
  word: string
  emoji: string
  hiddenIndex: number
  correctLetter: string
  choices: string[]
  isLocked: boolean
  lastResult: 'correct' | 'wrong' | null
}

export function CompletePalavraGame() {
  const { profile } = useChildProfile()
  const speechName = getChildVocative(profile)
  const displayName = getChildDisplayName(profile)

  const [score, setScore] = useState({ correct: 0, mistakes: 0 })
  const [game, setGame] = useState<GameState>(() => createNewRound())

  function createNewRound(): GameState {
    const { letter, example } = getRandomWord()
    
    // Choose a position to hide (prefer not first letter for better learning)
    let hiddenIndex = Math.floor(Math.random() * example.word.length)
    if (hiddenIndex === 0 && example.word.length > 2) {
      hiddenIndex = 1
    }

    const correctLetter = example.word[hiddenIndex].toUpperCase()
    
    // Get distractors (other letters)
    const distractors = getRandomDistractors(letter, 2)
    const choices = [correctLetter, ...distractors].sort(() => Math.random() - 0.5)

    return {
      word: example.word.toUpperCase(),
      emoji: example.emoji,
      hiddenIndex,
      correctLetter,
      choices,
      isLocked: false,
      lastResult: null,
    }
  }

  const nextRound = useCallback(() => {
    const newGame = createNewRound()
    setGame(newGame)
  }, [])

  const handleChoice = async (chosen: string) => {
    if (game.isLocked) return

    const isCorrect = chosen === game.correctLetter

    setGame(prev => ({
      ...prev,
      isLocked: true,
      lastResult: isCorrect ? 'correct' : 'wrong',
    }))

    if (isCorrect) {
      setScore(s => ({ ...s, correct: s.correct + 1 }))
      useChildProfile.getState().addStars(1)
      useChildProfile.getState().recordLetterPractice(game.correctLetter, true)

      await getAudioManager().playSuccess()

      const speakText = speechName
        ? `Isso, ${speechName}! ${game.word} começa com ${game.word[0]} e tem ${game.correctLetter} aqui. Muito bem!`
        : `Isso! ${game.word} começa com ${game.word[0]} e tem ${game.correctLetter} aqui. Muito bem!`
      // Voz principal feminina - aguardamos terminar para não emendar com próxima rodada
      await getAudioManager().speakPhrase(speakText)

      setTimeout(() => {
        nextRound()
      }, SUCCESS_AUTO_ADVANCE_MS)
    } else {
      setScore(s => ({ ...s, mistakes: s.mistakes + 1 }))
      useChildProfile.getState().recordLetterPractice(game.correctLetter, false)

      await getAudioManager().playMistake()

      setTimeout(async () => {
        const speakText = `A letra certa aqui é ${game.correctLetter}${speechName ? ', ' + speechName : ''}!`
        // Voz principal feminina
        getAudioManager().speakPhrase(speakText)

        setGame(prev => ({
          ...prev,
          isLocked: false,
          lastResult: null,
        }))
      }, 900)
    }
  }

  const handleSpeakHint = () => {
    if (game.isLocked) return
    const speakText = `Complete a palavra. Qual letra falta aqui?`
    // Voz principal feminina
    getAudioManager().speakPhrase(speakText)
  }

  // Build the displayed word with blank
  const displayedWord = game.word.split('').map((letter, index) => {
    if (index === game.hiddenIndex) {
      return (
        <span key={index} className="text-orange-500 mx-0.5">_</span>
      )
    }
    return <span key={index}>{letter}</span>
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-purple-50 to-pink-50 flex flex-col safe-area">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-5 pt-4 pb-3 bg-white/70 backdrop-blur-lg border-b border-white/60">
        <div className="flex items-center gap-3">
          <div className="text-4xl">{profile?.avatar || '🐘'}</div>
          <div>
            <div className="text-sm font-medium text-purple-700">{displayName}</div>
            <div className="text-[10px] text-gray-500 -mt-0.5">Complete a Palavra</div>
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

      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-8">
        
        {/* Instruction */}
        <div className="flex items-center gap-4 mb-6">
          <AlfafaMini mood={game.lastResult === 'correct' ? 'celebrating' : game.lastResult === 'wrong' ? 'encouraging' : 'happy'} />
          <div>
            <p className="text-2xl font-bold text-purple-700">Complete a palavra!</p>
            <button 
              onClick={handleSpeakHint}
              disabled={game.isLocked}
              className="mt-1 text-sm text-purple-600 active:opacity-70"
            >
              🔊 Ouvir a dica
            </button>
          </div>
        </div>

        {/* Emoji + Word with blank */}
        <div className="text-center mb-10">
          <div className="text-[min(26vw,150px)] mb-4 leading-none">
            {game.emoji}
          </div>
          <div className="text-6xl font-black text-gray-800 tracking-[4px] mb-3">
            {displayedWord}
          </div>
          <div className="text-2xl text-gray-600">
            Qual letra falta aqui?
          </div>
        </div>

        {/* Letter Choices */}
        <div className="grid grid-cols-3 gap-4 w-full max-w-[340px]">
          {game.choices.map((letter, index) => (
            <motion.button
              key={index}
              whileTap={{ scale: 0.94 }}
              onClick={() => handleChoice(letter)}
              disabled={game.isLocked}
              className={`
                choice-button text-7xl font-black aspect-square
                ${game.lastResult === 'wrong' && letter === game.correctLetter 
                  ? 'bg-green-400 text-white border-green-500 scale-[1.03]' 
                  : 'bg-white text-purple-700 border-purple-200'
                }
                disabled:cursor-not-allowed
              `}
            >
              {letter}
            </motion.button>
          ))}
        </div>

        {/* Feedback */}
        <div className="h-8 mt-8 text-center">
          {game.lastResult === 'wrong' && !game.isLocked && (
            <p className="text-orange-600 font-medium">
              Quase, {displayName}! A letra certa é {game.correctLetter} ✨
            </p>
          )}
          {game.lastResult === 'correct' && (
            <p className="text-green-600 font-semibold text-lg">
              Muito bem, {displayName}!
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
