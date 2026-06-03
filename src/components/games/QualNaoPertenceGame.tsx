import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getAudioManager } from '../../lib/audio/AudioManager'
import { SUCCESS_AUTO_ADVANCE_MS } from '../../lib/gameConstants'
import { 
  getOddOneOutRound, 
  OddOneOutRound 
} from '../../data/letters'
import { useChildProfile, getChildVocative, getChildDisplayName } from '../../stores/useChildProfile'
import { AlfafaMini } from '../mascot/Alfafa'
import { GameTopBar } from '../layout/GameTopBar'

interface GameState extends OddOneOutRound {
  isLocked: boolean
  lastResult: 'correct' | 'wrong' | null
  tappedIndex: number | null
}

export function QualNaoPertenceGame() {
  const { profile } = useChildProfile()
  const speechName = getChildVocative(profile)
  const displayName = getChildDisplayName(profile)

  const [score, setScore] = useState({ correct: 0, mistakes: 0 })
  const [game, setGame] = useState<GameState>(() => createNewRound())

  function createNewRound(): GameState {
    const round = getOddOneOutRound()
    return {
      ...round,
      isLocked: false,
      lastResult: null,
      tappedIndex: null,
    }
  }

  const nextRound = useCallback(() => {
    const newGame = createNewRound()
    setGame(newGame)
  }, [])

  const handleChoice = async (index: number) => {
    if (game.isLocked) return

    const isCorrect = index === game.oddOneOutIndex
    const tappedOption = game.options[index]
    const oddOption = game.options[game.oddOneOutIndex]

    setGame(prev => ({
      ...prev,
      isLocked: true,
      lastResult: isCorrect ? 'correct' : 'wrong',
      tappedIndex: index,
    }))

    if (isCorrect) {
      setScore(s => ({ ...s, correct: s.correct + 1 }))
      useChildProfile.getState().addStars(1)
      useChildProfile.getState().recordLetterPractice(tappedOption.letter, true)

      await getAudioManager().playSuccess()

      const speakText = speechName
        ? `Isso mesmo, ${speechName}! Essa começa com outra letra. Muito esperto!`
        : `Isso mesmo! Essa começa com outra letra. Muito esperto!`
      // Voz principal feminina - aguardamos a fala para não emendar na próxima
      await getAudioManager().speakPhrase(speakText)

      setTimeout(() => {
        nextRound()
      }, SUCCESS_AUTO_ADVANCE_MS)
    } else {
      setScore(s => ({ ...s, mistakes: s.mistakes + 1 }))
      useChildProfile.getState().recordLetterPractice(tappedOption.letter, false)

      await getAudioManager().playMistake()

      // Feedback corretivo (voz principal feminina)
      // Mantemos a tela com o erro visível (carta correta destacada) enquanto a voz explica
      const correctWord = oddOption.example.word
      const correctLetter = oddOption.letter
      
      const speakText = speechName
        ? `Esse começa com ${tappedOption.letter}... O diferente é o ${correctWord}, que começa com ${correctLetter}, ${speechName}!`
        : `Esse começa com ${tappedOption.letter}... O diferente é o ${correctWord}, que começa com ${correctLetter}!`
      await getAudioManager().speakPhrase(speakText)

      // Só avança depois que a explicação terminar de ser falada
      nextRound()
    }
  }

  const handleSpeakHint = () => {
    if (game.isLocked) return
    
    const message = speechName
      ? `Olha as três palavras, ${speechName}. Qual não pertence?`
      : `Olha as três palavras. Qual não pertence?`
    // Voz principal feminina
    getAudioManager().speakPhrase(message)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-purple-50 to-pink-50 flex flex-col safe-area">
      <GameTopBar title="Qual Não Pertence?" score={{ correct: score.correct, mistakes: score.mistakes }} />

      <div className="flex-1 flex flex-col items-center px-6 pt-6 pb-8">
        
        {/* Instruction */}
        <div className="flex items-center gap-4 mb-6">
          <AlfafaMini mood="thinking" />
          <div className="text-center">
            <p className="text-2xl font-bold text-rose-600">
              Qual não pertence?
            </p>
            <button 
              onClick={handleSpeakHint}
              className="mt-1 text-sm text-purple-600 active:opacity-70"
            >
              🔊 Ouvir o pedido
            </button>
          </div>
        </div>

        {/* 3 Big Cards */}
        <div className="flex flex-col gap-4 w-full max-w-[340px] mt-2">
          {game.options.map((option, index) => {
            const isTapped = game.tappedIndex === index
            const isOddOne = index === game.oddOneOutIndex
            const showAsCorrect = game.lastResult === 'wrong' && isOddOne
            const showAsWrong = game.lastResult === 'wrong' && isTapped && !isOddOne

            let borderColor = 'border-gray-200'
            let bgColor = 'bg-white'

            if (game.lastResult === 'correct' && isTapped) {
              borderColor = 'border-green-400'
              bgColor = 'bg-green-50'
            } else if (showAsCorrect) {
              borderColor = 'border-green-400'
              bgColor = 'bg-green-50'
            } else if (showAsWrong) {
              borderColor = 'border-red-400'
              bgColor = 'bg-red-50'
            }

            return (
              <button
                key={index}
                onClick={() => handleChoice(index)}
                disabled={game.isLocked}
                className={`
                  w-full flex items-center gap-6 px-8 py-6 rounded-3xl border-4 transition-all active:scale-[0.985]
                  ${borderColor} ${bgColor}
                  disabled:opacity-80
                `}
              >
                <div className="text-[72px] leading-none drop-shadow-sm">
                  {option.example.emoji}
                </div>
                <div className="flex-1 text-left">
                  <div className="text-4xl font-bold text-gray-800 tracking-tight">
                    {option.example.word}
                  </div>
                  <div className="text-sm text-gray-500 mt-0.5">
                    começa com <span className="font-semibold text-purple-600">{option.letter}</span>
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        {/* Feedback area */}
        <div className="h-12 mt-8 text-center">
          <AnimatePresence>
            {game.lastResult === 'correct' && (
              <motion.p 
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0 }}
                className="text-green-600 font-bold text-2xl"
              >
                Muito esperto, {displayName}! ⭐
              </motion.p>
            )}
            {game.lastResult === 'wrong' && (
              <motion.p 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-rose-600 font-semibold text-xl"
              >
                Vamos ver o diferente...
              </motion.p>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  )
}
