import { motion } from 'framer-motion'

export type AlfafaMood = 'happy' | 'excited' | 'thinking' | 'encouraging' | 'celebrating'

interface AlfafaProps {
  mood?: AlfafaMood
  size?: 'sm' | 'md' | 'lg' | 'xl'
  message?: string
  animate?: boolean
}

const sizes = {
  sm: 'text-5xl',
  md: 'text-6xl',
  lg: 'text-7xl',
  xl: 'text-[90px]',
}

const moodAnimations = {
  happy: {
    animate: { scale: [1, 1.05, 1], rotate: [0, 2, -2, 0] },
    transition: { duration: 2, repeat: Infinity },
  },
  excited: {
    animate: { scale: [1, 1.15, 1], y: [0, -8, 0] },
    transition: { duration: 0.6, repeat: Infinity },
  },
  thinking: {
    animate: { rotate: [0, -8, 8, 0] },
    transition: { duration: 2.5, repeat: Infinity },
  },
  encouraging: {
    animate: { scale: [1, 1.08, 1] },
    transition: { duration: 1.8, repeat: Infinity },
  },
  celebrating: {
    animate: { 
      scale: [1, 1.25, 1], 
      rotate: [-12, 12, -8, 8, 0],
      y: [0, -10, 0]
    },
    transition: { duration: 0.8 },
  },
}

export function Alfafa({ 
  mood = 'happy', 
  size = 'lg', 
  message,
  animate = true 
}: AlfafaProps) {
  const animation = animate ? moodAnimations[mood] : {}

  return (
    <div className="flex flex-col items-center">
      <motion.div
        className={`${sizes[size]} leading-none select-none`}
        {...animation}
      >
        🐘
      </motion.div>
      
      {message && (
        <div className="mt-2 bg-white/90 text-purple-700 text-sm font-medium px-4 py-2 rounded-2xl max-w-[220px] text-center shadow-sm border border-purple-100">
          {message}
        </div>
      )}
    </div>
  )
}

// Versão menor e mais discreta para usar dentro dos jogos
export function AlfafaMini({ mood = 'happy' }: { mood?: AlfafaMood }) {
  return (
    <motion.div 
      className="text-4xl"
      animate={mood === 'excited' ? { scale: [1, 1.2, 1] } : {}}
      transition={{ duration: 0.5 }}
    >
      🐘
    </motion.div>
  )
}