import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface ChildProfile {
  id: string
  name: string
  avatar: string
  createdAt: string
  stars: number
  letterMastery: Record<string, { correct: number; attempts: number }>
}

interface ChildProfileState {
  profile: ChildProfile | null
  hasCompletedOnboarding: boolean
  
  // Actions
  createProfile: (name: string, avatar: string) => void
  updateProfile: (updates: Partial<ChildProfile>) => void
  clearProfile: () => void
  completeOnboarding: () => void
  addStars: (amount: number) => void
  recordLetterPractice: (letter: string, isCorrect: boolean) => void
}

export const useChildProfile = create<ChildProfileState>()(
  persist(
    (set) => ({
      profile: null,
      hasCompletedOnboarding: false,

      createProfile: (name: string, avatar: string) => {
        const newProfile: ChildProfile = {
          id: crypto.randomUUID(),
          name: name.trim(),
          avatar,
          createdAt: new Date().toISOString(),
          stars: 0,
          letterMastery: {},
        }
        set({
          profile: newProfile,
          hasCompletedOnboarding: true,
        })
      },

      updateProfile: (updates) => {
        set((state) => ({
          profile: state.profile ? { ...state.profile, ...updates } : null,
        }))
      },

      clearProfile: () => {
        set({
          profile: null,
          hasCompletedOnboarding: false,
        })
      },

      completeOnboarding: () => {
        set({ hasCompletedOnboarding: true })
      },

      addStars: (amount: number) => {
        set((state) => ({
          profile: state.profile 
            ? { ...state.profile, stars: (state.profile.stars || 0) + amount } 
            : null,
        }))
      },

      recordLetterPractice: (letter: string, isCorrect: boolean) => {
        set((state) => {
          if (!state.profile) return state

          const current = state.profile.letterMastery[letter] || { correct: 0, attempts: 0 }
          const updated = {
            ...current,
            attempts: current.attempts + 1,
            correct: current.correct + (isCorrect ? 1 : 0),
          }

          return {
            profile: {
              ...state.profile,
              letterMastery: {
                ...state.profile.letterMastery,
                [letter]: updated,
              },
            },
          }
        })
      },
    }),
    {
      name: 'alfafa-child-profile', // key in localStorage
      partialize: (state) => ({
        profile: state.profile,
        hasCompletedOnboarding: state.hasCompletedOnboarding,
      }),
    }
  )
)