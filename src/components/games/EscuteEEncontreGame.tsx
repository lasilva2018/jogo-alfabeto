import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getAudioManager } from '../../lib/audio/AudioManager'
import { SUCCESS_AUTO_ADVANCE_MS } from '../../lib/gameConstants'
import { WORD_BANK, Letter } from '../../data/letters'
import { useChildProfile, getChildVocative, getChildDisplayName, personalizeSpeech } from '../../stores/useChildProfile'
import { AlfafaMini } from '../mascot/Alfafa'
import { GameTopBar } from '../layout/GameTopBar'

interface WordExample {
  word: string
  emoji: string
  letter: Letter
}

interface GameState {
  target: WordExample
  choices: WordExample[]
  isLocked: boolean
  lastResult: 'correct' | 'wrong' | null
  tappedIndex: number | null
}

function getAllExamples(): WordExample[] {
  const examples: WordExample[] = []
  Object.entries(WORD_BANK).forEach(([letter, list]) => {
    list.forEach(ex => {
      examples.push({
        word: ex.word,
        emoji: ex.emoji,
        letter: letter as Letter,
      })
    })
  })
  return examples
}

function createNewRound(): GameState {
  const all = getAllExamples()
  
  // Escolhe o alvo
  const target = all[Math.floor(Math.random() * all.length)]
  
  // Escolhe 2 distratores diferentes (preferencialmente de letras diferentes)
  const distractors = all
    .filter(ex => ex.word !== target.word)
    .sort(() => Math.random() - 0.5)
    .slice(0, 2)
  
  // Monta as 3 opções e embaralha
  const rawChoices = [target, ...distractors]
  const choices = [...rawChoices].sort(() => Math.random() - 0.5)
  
  return {
    target,
    choices,
    isLocked: false,
    lastResult: null,
    tappedIndex: null,
  }
}

export function EscuteEEncontreGame() {
  const { profile } = useChildProfile()
  const speechName = getChildVocative(profile)
  const displayName = getChildDisplayName(profile)

  const [score, setScore] = useState({ correct: 0, mistakes: 0 })
  const [game, setGame] = useState<GameState>(() => createNewRound())

  // Fala a palavra automaticamente no início da rodada (voz principal feminina)
  const speakTarget = useCallback(async (word: string) => {
    // Cancela qualquer fala anterior (correção de erro, etc) para evitar corte ou sobreposição
    getAudioManager().cancel()
    const text = `${word}!`
    await getAudioManager().speakPhrase(text)
  }, [])

  // Fala no início da rodada
  useEffect(() => {
    const timer = setTimeout(() => {
      speakTarget(game.target.word)
    }, 400)
    return () => clearTimeout(timer)
  }, [game.target.word, speakTarget])

  const nextRound = useCallback(() => {
    const newGame = createNewRound()
    setGame(newGame)
  }, [])

  const handleChoice = async (index: number) => {
    if (game.isLocked) return

    const chosen = game.choices[index]
    const isCorrect = chosen.word === game.target.word

    setGame(prev => ({
      ...prev,
      isLocked: true,
      lastResult: isCorrect ? 'correct' : 'wrong',
      tappedIndex: index,
    }))

    if (isCorrect) {
      setScore(s => ({ ...s, correct: s.correct + 1 }))
      useChildProfile.getState().addStars(1)
      useChildProfile.getState().recordLetterPractice(game.target.letter, true)

      await getAudioManager().playSuccess()

      const speakText = personalizeSpeech(
        `Isso mesmo, {name}! É ${game.target.word}! Muito bem!`,
        `Isso mesmo! É ${game.target.word}! Muito bem!`,
        speechName
      )
      // Voz principal feminina - aguardamos a fala terminar antes de avançar
      // para evitar que o áudio da próxima rodada enende com o parabenizando anterior
      await getAudioManager().speakPhrase(speakText)

      setTimeout(() => {
        nextRound()
      }, SUCCESS_AUTO_ADVANCE_MS)
    } else {
      setScore(s => ({ ...s, mistakes: s.mistakes + 1 }))
      useChildProfile.getState().recordLetterPractice(chosen.letter, false)

      await getAudioManager().playMistake()

      // Após o erro: destacamos a resposta correta na UI e explicamos com voz.
      // IMPORTANTE: aguardamos a fala de correção terminar ANTES de avançar a rodada.
      // Assim a voz não é cortada no meio quando a próxima rodada começa a falar a nova palavra.
      setTimeout(async () => {
        const speakText = personalizeSpeech(
          `Não foi essa... A palavra que eu falei foi ${game.target.word}, {name}!`,
          `Não foi essa... A palavra que eu falei foi ${game.target.word}!`,
          speechName
        )
        // Voz principal feminina - esperamos terminar para não interromper a explicação
        await getAudioManager().speakPhrase(speakText)

        // Depois da explicação, damos um tempinho extra para a criança ver a correta
        // e então avançamos (a nova rodada vai falar o novo alvo limpo)
        setTimeout(() => {
          nextRound()
        }, 400)
      }, 650)
    }
  }

  const handleSpeakAgain = () => {
    if (game.isLocked) return
    speakTarget(game.target.word)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-purple-50 to-pink-50 flex flex-col safe-area">
      <GameTopBar title="Escute e Encontre" score={{ correct: score.correct, mistakes: score.mistakes }} />

      <div className="flex-1 flex flex-col items-center px-6 pt-6 pb-8">
        
        {/* Instruction */}
        <div className="flex items-center gap-4 mb-6">
          <AlfafaMini mood="excited" />
          <div className="text-center">
            <p className="text-2xl font-bold text-emerald-600">
              Escute e encontre!
            </p>
            <button 
              onClick={handleSpeakAgain}
              disabled={game.isLocked}
              className="mt-1 text-sm text-purple-600 active:opacity-70 disabled:opacity-40"
            >
              🔊 Ouvir de novo
            </button>
          </div>
        </div>

        <div className="mb-4 text-center">
          <p className="text-lg text-gray-600">Toque na palavra que o Alfafa falou</p>
        </div>

        {/* 3 Big Choices */}
        <div className="flex flex-col gap-4 w-full max-w-[340px] mt-2">
          {game.choices.map((option, index) => {
            const isTapped = game.tappedIndex === index
            const isCorrectOne = option.word === game.target.word
            const showAsCorrect = game.lastResult === 'wrong' && isCorrectOne
            const showAsWrong = game.lastResult === 'wrong' && isTapped && !isCorrectOne

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
                <div className="text-[68px] leading-none drop-shadow-sm">
                  {option.emoji}
                </div>
                <div className="flex-1 text-left">
                  <div className="text-4xl font-bold text-gray-800 tracking-tight">
                    {option.word}
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        {/* Feedback */}
        <div className="h-12 mt-8 text-center">
          <AnimatePresence>
            {game.lastResult === 'correct' && (
              <motion.p 
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0 }}
                className="text-green-600 font-bold text-2xl"
              >
                Muito bem, {displayName}! ⭐
              </motion.p>
            )}
            {game.lastResult === 'wrong' && (
              <motion.p 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-emerald-600 font-semibold text-xl"
              >
                Vamos tentar de novo...
              </motion.p>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  )
}
