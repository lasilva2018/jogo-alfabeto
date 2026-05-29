export interface ChildProfile {
  id: string
  name: string
  avatar: string // emoji ou id futuro
  createdAt: string
}

export interface LetterMastery {
  letter: string
  exposures: number
  correct: number
  attempts: number
  lastSeen: string
  masteryScore: number // 0-100
}

export type GameType = 'touch-letter' | 'which-starts' | 'listen-find'

export interface GameSession {
  id: string
  startedAt: string
  endedAt?: string
  letter: string
  gameType: GameType
  correct: number
  mistakes: number
}