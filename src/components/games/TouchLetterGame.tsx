import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { audioManager } from '../../lib/audio/AudioManager'
import { 
  getRandomExample, 
  getRandomDistractors, 
  WordExample 
} from '../../data/letters'
import { useChildProfile } from '../../stores/useChildProfile'

const VOWELS = ['A', 'E', 'I', 'O', 'U'] as const

type Vowel = typeof VOWELS[number]

interface GameState {
  currentLetter: Vowel
  choices: Vowel[]
  example: WordExample
  isLocked: boolean
  lastResult: 'correct' | 'wrong' | null
  showCorrect: boolean
}

export function TouchLetterGame() {
  const { profile } = useChildProfile()
  const childName = profile?.name || 'amiguinho'

  const [score, setScore] = useState({ correct: 0, mistakes: 0 })
  const [game, setGame] = useState<GameState>(() => createNewRound())

  function createNewRound(previous?: Vowel): GameState {
    // Escolhe uma vogal diferente da anterior se possível
    let current: Vowel
    do {
      current = VOWELS[Math.floor(Math.random() * VOWELS.length)]
    } while (previous && VOWELS.length > 1 && current === previous)

    const example = getRandomExample(current)
    
    // 2 distratores + a correta = 3 opções
    const distractors = getRandomDistractors(current, 2) as Vowel[]
    const allChoices = [current, ...distractors].sort(() => Math.random() - 0.5)

    return {
      currentLetter: current,
      choices: allChoices,
      example,
      isLocked: false,
      lastResult: null,
      showCorrect: false,
    }
  }

  const nextRound = useCallback((prevLetter?: Vowel) => {
    const newGame = createNewRound(prevLetter)
    setGame(newGame)
  }, [])

  const handleChoice = async (chosen: Vowel) => {
    if (game.isLocked) return

    const isCorrect = chosen === game.currentLetter

    setGame(prev => ({
      ...prev,
      isLocked: true,
      lastResult: isCorrect ? 'correct' : 'wrong',
      showCorrect: !isCorrect, // mostra a correta quando erra
    }))

    if (isCorrect) {
      // Acerto!
      setScore(s => ({ ...s, correct: s.correct + 1 }))
      
      await audioManager.playSuccess()
      
      // Fala a letra + exemplo de forma carinhosa com o nome da criança
      const speakText = `Muito bem, ${childName}! ${game.currentLetter} de ${game.example.word}!`
      await audioManager.speakPhrase(speakText)

      // Celebra e avança
      setTimeout(() => {
        nextRound(game.currentLetter)
      }, 1350)
    } else {
      // Erro - feedback gentil
      setScore(s => ({ ...s, mistakes: s.mistakes + 1 }))
      
      await audioManager.playMistake()

      // Depois de um tempo, revela a resposta certa e libera
      setTimeout(async () => {
        await audioManager.speakPhrase(`A letra certa é ${game.currentLetter}, ${childName}!`)
        
        // Libera para tentar de novo (não avança automaticamente no erro)
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
    audioManager.speakLetter(game.currentLetter, game.example.word)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-purple-50 to-pink-50 flex flex-col safe-area">
      {/* Top Bar - Placar + Mascote */}
      <div className="flex items-center justify-between px-5 pt-4 pb-3 bg-white/70 backdrop-blur-lg border-b border-white/60">
        <div className="flex items-center gap-3">
          <div className="text-4xl">{profile?.avatar || '🐘'}</div>
          <div>
            <div className="text-sm font-medium text-purple-700">{profile?.name || 'Alfafa'}</div>
            <div className="text-[10px] text-gray-500 -mt-0.5">com Alfafa</div>
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

        {/* Small settings button (for now allows resetting profile) */}
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

      {/* Área principal do jogo */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-8 relative">
        
        {/* Instrução */}
        <div className="text-center mb-6">
          <p className="text-xl font-medium text-gray-700">Toque na letra certa!</p>
          <button 
            onClick={handleSpeakHint}
            disabled={game.isLocked}
            className="mt-1 text-sm text-purple-600 active:opacity-70 disabled:opacity-40"
          >
            🔊 Ouvir a letra
          </button>
        </div>

        {/* Letra gigante */}
        <div className="relative mb-10">
          <motion.div
            key={game.currentLetter}
            animate={{ 
              scale: game.lastResult === 'correct' ? [1, 1.25, 1] : 1,
              rotate: game.lastResult === 'correct' ? [-6, 6, 0] : 0 
            }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className={`
              text-[min(38vw,220px)] font-black leading-none select-none
              ${game.lastResult === 'wrong' ? 'text-red-500' : 'text-purple-600'}
              drop-shadow-[0_8px_20px_rgb(0,0,0,0.1)]
            `}
          >
            {game.currentLetter}
          </motion.div>

          {/* Emoji de exemplo abaixo da letra */}
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-6xl opacity-90">
            {game.example.emoji}
          </div>
        </div>

        {/* Palavra de exemplo */}
        <div className="mb-8 text-center">
          <div className="text-3xl font-bold text-gray-800 tracking-wider">
            {game.example.word.toUpperCase()}
          </div>
          <div className="text-xs text-gray-500 mt-0.5">É a letra {game.currentLetter}</div>
        </div>

        {/* Opções grandes */}
        <div className="grid grid-cols-3 gap-4 w-full max-w-[340px]">
          <AnimatePresence>
            {game.choices.map((letter, index) => {
              const isCorrectChoice = letter === game.currentLetter
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
          </AnimatePresence>
        </div>

        {/* Feedback textual gentil */}
        <div className="h-8 mt-6 text-center">
          {game.lastResult === 'wrong' && !game.isLocked && (
            <p className="text-orange-600 font-medium">
              Quase, {childName}! Tenta de novo ✨
            </p>
          )}
          {game.lastResult === 'correct' && (
            <p className="text-green-600 font-semibold text-lg">
              Muito bem, {childName}!
            </p>
          )}
        </div>
      </div>

      {/* Rodapé suave */}
      <div className="pb-6 text-center text-[10px] text-gray-400">
        Toque na letra que começa a palavra
      </div>
    </div>
  )
}