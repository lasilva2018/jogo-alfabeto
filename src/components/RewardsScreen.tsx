import { useChildProfile } from '../stores/useChildProfile'
import { motion } from 'framer-motion'
import { Alfafa } from './mascot/Alfafa'

export function RewardsScreen({ onBack }: { onBack: () => void }) {
  const { profile } = useChildProfile()
  const stars = profile?.stars || 0
  const name = profile?.name || 'amiguinho'

  // Visual stars (show up to 30 for now, grouped)
  const displayedStars = Math.min(stars, 30)
  const starArray = Array.from({ length: displayedStars })

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-purple-50 to-pink-50 flex flex-col safe-area">
      {/* Header */}
      <div className="px-5 pt-4 pb-3 bg-white/70 backdrop-blur-lg border-b border-white/60 flex items-center justify-between">
        <button 
          onClick={onBack}
          className="text-purple-600 font-medium flex items-center gap-1 text-lg active:opacity-70"
        >
          ← Voltar
        </button>
        <div className="text-sm text-gray-500">Meu Tesouro</div>
        <div className="w-8" />
      </div>

      <div className="flex-1 flex flex-col items-center px-6 pt-8">
        <Alfafa mood="excited" size="xl" />
        
        <h1 className="text-4xl font-bold text-center text-purple-700 mb-2">
          Seu Tesouro, {name}!
        </h1>
        
        <div className="flex items-baseline gap-3 mb-8">
          <div className="text-[72px] font-black text-yellow-500 leading-none">
            {stars}
          </div>
          <div className="text-2xl text-yellow-600 font-semibold">
            estrelinhas
          </div>
        </div>

        {/* Visual collection of stars */}
        <div className="bg-white/80 rounded-3xl p-6 w-full max-w-md mb-8 shadow-inner min-h-[160px]">
          <p className="text-center text-gray-600 mb-4 text-sm">Suas estrelinhas brilhando!</p>
          
          <div className="flex flex-wrap justify-center gap-3">
            {starArray.length > 0 ? (
              starArray.map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: i * 0.015 }}
                  className="text-4xl"
                >
                  ⭐
                </motion.div>
              ))
            ) : (
              <p className="text-gray-400 italic text-center py-4">
                Comece a brincar para ganhar suas primeiras estrelinhas!
              </p>
            )}
          </div>
        </div>

        {/* Encouraging message from Alfafa */}
        <div className="bg-purple-100 rounded-3xl px-6 py-5 max-w-md text-center">
          <p className="text-purple-700 font-medium">
            {stars === 0 && "Vamos ganhar nossa primeira estrelinha juntos?"}
            {stars > 0 && stars < 10 && "Você está indo muito bem! Continue assim!"}
            {stars >= 10 && stars < 25 && "Uau, olha quantas estrelinhas! Eu estou muito orgulhoso de você!"}
            {stars >= 25 && "Você é um campeão das letras, " + name + "! O Alfafa te ama!"}
          </p>
        </div>

        {stars > 5 && (
          <p className="mt-6 text-xs text-gray-500 text-center">
            Cada acerto te deixa mais perto de novas surpresas!
          </p>
        )}
      </div>
    </div>
  )
}