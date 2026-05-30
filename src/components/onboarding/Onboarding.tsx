import { useState } from 'react'
import { motion } from 'framer-motion'
import { useChildProfile } from '../../stores/useChildProfile'

const AVATAR_OPTIONS = [
  '🐘', // Alfafa (elephant)
  '🦁', // Lion
  '🐻', // Bear
  '🐰', // Rabbit
  '🐼', // Panda
  '🦒', // Giraffe
  '🐢', // Turtle
  '🦊', // Fox
]

export function Onboarding() {
  const [name, setName] = useState('')
  const [selectedAvatar, setSelectedAvatar] = useState('🐘')
  const [step, setStep] = useState<'welcome' | 'name' | 'avatar'>('welcome')
  const createProfile = useChildProfile((state) => state.createProfile)

  const handleStart = () => {
    setStep('name')
  }

  const handleNameSubmit = () => {
    if (name.trim().length < 2) return
    setStep('avatar')
  }

  const handleCreateProfile = () => {
    if (name.trim().length < 2) return
    
    createProfile(name.trim(), selectedAvatar)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (step === 'name') {
        handleNameSubmit()
      } else if (step === 'avatar') {
        handleCreateProfile()
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-purple-50 to-pink-50 flex flex-col items-center justify-center p-6 safe-area">
      <div className="w-full max-w-md">
        
        {/* Step: Welcome */}
        {step === 'welcome' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="text-[120px] mb-4">🐘</div>
            
            <h1 className="text-4xl font-bold text-purple-600 mb-4 tracking-tight">
              Olá! Eu sou o <span className="text-orange-500">Alfafa</span>
            </h1>
            
            <p className="text-2xl text-gray-700 mb-10 leading-tight">
              Vamos aprender o alfabeto juntos?
            </p>

            <button
              onClick={handleStart}
              className="button-large w-full bg-purple-600 text-white text-3xl font-bold active:bg-purple-700"
            >
              Vamos começar!
            </button>
          </motion.div>
        )}

        {/* Step: Name */}
        {step === 'name' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="text-7xl mb-6">👋</div>
            
            <h2 className="text-3xl font-bold text-gray-800 mb-3">
              Como você se chama?
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Alfafa quer saber seu nome!
            </p>

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Seu nome aqui"
              className="w-full text-4xl text-center py-6 px-8 rounded-3xl border-4 border-purple-200 focus:border-purple-500 outline-none mb-8 font-medium"
              autoFocus
            />

            <button
              onClick={handleNameSubmit}
              disabled={name.trim().length < 2}
              className="button-large w-full bg-purple-600 text-white text-3xl font-bold disabled:bg-gray-300 disabled:text-gray-500 active:bg-purple-700"
            >
              Continuar
            </button>
          </motion.div>
        )}

        {/* Step: Avatar */}
        {step === 'avatar' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Escolha seu amiguinho!
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Qual bichinho você mais gosta?
            </p>

            <div className="grid grid-cols-4 gap-4 mb-10">
              {AVATAR_OPTIONS.map((avatar) => (
                <button
                  key={avatar}
                  onClick={() => setSelectedAvatar(avatar)}
                  className={`
                    text-6xl aspect-square flex items-center justify-center rounded-3xl border-4 transition-all
                    ${selectedAvatar === avatar 
                      ? 'border-purple-500 bg-purple-100 scale-105' 
                      : 'border-white bg-white active:scale-95'
                    }
                  `}
                >
                  {avatar}
                </button>
              ))}
            </div>

            <button
              onClick={handleCreateProfile}
              className="button-large w-full bg-purple-600 text-white text-3xl font-bold active:bg-purple-700"
            >
              Começar a brincar!
            </button>

            <p className="mt-4 text-sm text-gray-500">
              Olá, <span className="font-semibold">{name}</span>! Eu sou o Alfafa 🐘
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}