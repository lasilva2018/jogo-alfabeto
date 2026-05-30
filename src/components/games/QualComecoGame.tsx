import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { audioManager } from '../../lib/audio/AudioManager'
import { 
  getRandomWord, 
  getRandomDistractors, 
  WordExample,
  Letter
} from '../../data/letters'
import { useChildProfile } from '../../stores/useChildProfile'
import { AlfafaMini } from '../mascot/Alfafa'

interface GameState {
  letter: Letter
  example: WordExample
  choices: Letter[]
  isLocked: boolean
  lastResult: 'correct' | 'wrong' | null
  showCorrect: boolean
}

export function QualComecoGame() {
  const { profile } = useChildProfile()
  const childName = profile?.name || 'amiguinho'

  const [score, setScore] = useState({ correct: 0, mistakes: 0 })
  const [game, setGame] = useState<GameState>(() => createNewRound())

  function createNewRound(): GameState {
    const { letter, example } = getRandomWord()

    // 2 distratores + a letra correta
    const distractors = getRandomDistractors(letter, 2)
    const allChoices = [letter, ...distractors].sort(() => Math.random() - 0.5) as Letter[]

    return {
      letter,
      example,
      choices: allChoices,
      isLocked: false,
      lastResult: null,
      showCorrect: false,
    }
  }

  const nextRound = useCallback(() => {
    const newGame = createNewRound()
    setGame(newGame)
  }, [])

  const handleChoice = async (chosen: Letter) => {
    if (game.isLocked) return

    const isCorrect = chosen === game.letter

    setGame(prev => ({
      ...prev,
      isLocked: true,
      lastResult: isCorrect ? 'correct' : 'wrong',
      showCorrect: !isCorrect,
    }))

    if (isCorrect) {
      setScore(s => ({ ...s, correct: s.correct + 1 }))

      // Dá uma estrelinha
      useChildProfile.getState().addStars(1)
      useChildProfile.getState().recordLetterPractice(game.letter, true)

      await audioManager.playSuccess()

      const speakText = `Isso, ${childName}! ${game.example.word} começa com ${game.letter}! Muito bem!`
      await audioManager.speakPhrase(speakText)

      setTimeout(() => {
        nextRound()
      }, 1400)
    } else {
      setScore(s => ({ ...s, mistakes: s.mistakes + 1 }))
      useChildProfile.getState().recordLetterPractice(game.letter, false)

      await audioManager.playMistake()

      setTimeout(async () => {
        const speakText = `${game.example.word} começa com a letra ${game.letter}, ${childName}!`
        await audioManager.speakPhrase(speakText)

        setGame(prev => ({
          ...prev,
          isLocked: false,
          lastResult: null,
          showCorrect: true,
        }))
      }, 900)
    }
  }

  const handleSpeakHint = () => {
    if (game.isLocked) return
    const speakText = `${game.example.word}... Qual letra começa?`
    audioManager.speakPhrase(speakText)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-purple-50 to-pink-50 flex flex-col safe-area">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-5 pt-4 pb-3 bg-white/70 backdrop-blur-lg border-b border-white/60">
        <div className="flex items-center gap-3">
          <div className="text-4xl">{profile?.avatar || '🐘'}</div>
          <div>
            <div className="text-sm font-medium text-purple-700">{profile?.name || 'Alfafa'}</div>
            <div className="text-[10px] text-gray-500 -mt-0.5">Qual o Começo?</div>
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

      {/* Game Area */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-8">
        
        {/* Instruction + Alfafa reativo */}
        <div className="flex items-center gap-3 mb-6">
          <AlfafaMini mood={game.lastResult === 'correct' ? 'celebrating' : game.lastResult === 'wrong' ? 'encouraging' : 'happy'} />
          <div className="text-center">
            <p className="text-xl font-medium text-gray-700">Qual letra começa a palavra?</p>
            <button 
              onClick={handleSpeakHint}
              disabled={game.isLocked}
              className="mt-1 text-sm text-purple-600 active:opacity-70 disabled:opacity-40"
            >
              🔊 Ouvir a palavra
            </button>
          </div>
        </div>

        {/* Emoji + Word */}
        <div className="text-center mb-8">
          <div className="text-[min(28vw,160px)] mb-3 leading-none">
            {game.example.emoji}
          </div>
          <div className="text-5xl font-black text-gray-800 tracking-[3px]">
            {game.example.word.toUpperCase()}
          </div>
        </div>

        {/* Letter Choices */}
        <div className="grid grid-cols-3 gap-4 w-full max-w-[340px]">
          {game.choices.map((letter, index) => {
            const isCorrectChoice = letter === game.letter
            const shouldHighlightCorrect = game.showCorrect && isCorrectChoice

            return (
              <motion.button
                key={`${letter}-${index}`}
                whileTap={{ scale: 0.94 }}
                onClick={() => handleChoice(letter)}
                disabled={game.isLocked}
                className={`
                  choice-button text-7xl font-black aspect-square
                  ${shouldHighlightCorrect 
                    ? 'bg-green-400 text-white border-green-500 scale-[1.03]' 
                    : 'bg-white text-purple-600 border-purple-200'
                  }
                  ${game.lastResult === 'wrong' && !shouldHighlightCorrect ? 'opacity-60' : ''}
                  disabled:cursor-not-allowed
                `}
              >
                {letter}
              </motion.button>
            )
          })}
        </div>

        {/* Feedback */}
        <div className="h-8 mt-8 text-center">
          {game.lastResult === 'wrong' && !game.isLocked && (
            <p className="text-orange-600 font-medium">
              Quase, {childName}! Olha a letra certa ✨
            </p>
          )}
          {game.lastResult === 'correct' && (
            <p className="text-green-600 font-semibold text-lg">
              Muito bem, {childName}!
            </p>
          )}
        </div>
      </div>
    </div>
  )
}