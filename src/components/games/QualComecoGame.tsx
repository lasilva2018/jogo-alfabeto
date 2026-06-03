import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { getAudioManager } from '../../lib/audio/AudioManager'
import { SUCCESS_AUTO_ADVANCE_MS } from '../../lib/gameConstants'
import { 
  getRandomWord, 
  getRandomDistractors, 
  WordExample,
  Letter
} from '../../data/letters'
import { useChildProfile, getChildVocative, getChildDisplayName, personalizeSpeech } from '../../stores/useChildProfile'
import { AlfafaMini } from '../mascot/Alfafa'
import { GameTopBar } from '../layout/GameTopBar'

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
  const speechName = getChildVocative(profile)
  const displayName = getChildDisplayName(profile)

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

      await getAudioManager().playSuccess()

      const speakText = personalizeSpeech(
        `Isso, {name}! ${game.example.word} começa com ${game.letter}! Muito bem!`,
        `Isso! ${game.example.word} começa com ${game.letter}! Muito bem!`,
        speechName
      )
      // Voz principal feminina (Alice)
      await getAudioManager().speakPhrase(speakText)

      setTimeout(() => {
        nextRound()
      }, SUCCESS_AUTO_ADVANCE_MS)
    } else {
      setScore(s => ({ ...s, mistakes: s.mistakes + 1 }))
      useChildProfile.getState().recordLetterPractice(game.letter, false)

      await getAudioManager().playMistake()

      setTimeout(async () => {
        const speakText = personalizeSpeech(
          `${game.example.word} começa com a letra ${game.letter}, {name}!`,
          `${game.example.word} começa com a letra ${game.letter}!`,
          speechName
        )
        // Voz principal feminina
        await getAudioManager().speakPhrase(speakText)

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
    // Voz principal feminina
    getAudioManager().speakPhrase(speakText)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-purple-50 to-pink-50 flex flex-col safe-area">
      <GameTopBar title="Qual o Começo?" score={{ correct: score.correct, mistakes: score.mistakes }} />

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
              Quase, {displayName}! Olha a letra certa ✨
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