// ============================================
// Tipos centrais do Jogo Alfabeto
// Fonte da verdade para evitar duplicação e divergência
// ============================================

export interface ChildProfile {
  id: string
  name: string
  avatar: string
  age?: number
  gender?: 'masculino' | 'feminino'
  createdAt: string
  stars: number
  letterMastery: Record<string, { correct: number; attempts: number }>
}

export interface ParentSettings {
  isPremium: boolean
  premiumExpiresAt?: string
  privacyAccepted: boolean
  privacyAcceptedAt?: string
  allowNameCollection: boolean
}

export type LetterMasteryEntry = {
  correct: number
  attempts: number
}

// Cloud representation (Supabase)
export interface CloudChild {
  id: string
  parent_id: string
  name: string
  avatar: string
  age?: number
  gender?: 'masculino' | 'feminino'
  stars: number
  letter_mastery: Record<string, LetterMasteryEntry>
  created_at: string
  updated_at: string
}

// Legacy / future use (kept for compatibility)
export interface LetterMastery {
  letter: string
  exposures: number
  correct: number
  attempts: number
  lastSeen: string
  masteryScore: number // 0-100
}

export type GameType = 'touch-letter' | 'which-starts' | 'listen-find' | 'draw-letter' | 'complete-word' | 'memory' | 'odd-one-out' | 'hunt-letter' | 'hunt-words' | 'build-word' | 'listen-find'

export interface GameSession {
  id: string
  startedAt: string
  endedAt?: string
  letter: string
  gameType: GameType
  correct: number
  mistakes: number
}