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

export interface ParentSettings {
  isPremium: boolean
  premiumExpiresAt?: string
  privacyAccepted: boolean
  privacyAcceptedAt?: string
  allowNameCollection: boolean
}

interface ChildProfileState {
  profiles: ChildProfile[]
  currentProfileId: string | null
  parentSettings: ParentSettings
  hasCompletedOnboarding: boolean

  // Computed (use via selector or direct access after update)
  profile: ChildProfile | null

  createProfile: (name: string, avatar: string) => void
  switchProfile: (id: string) => void
  updateProfile: (updates: Partial<ChildProfile>) => void
  deleteProfile: (id: string) => void
  clearAllData: () => void
  clearProfile: () => void   // compatibilidade com código antigo dos jogos

  completeOnboarding: () => void
  addStars: (amount: number) => void
  recordLetterPractice: (letter: string, isCorrect: boolean) => void

  setPremium: (isPremium: boolean, expiresAt?: string) => void
  acceptPrivacy: (allowNameCollection: boolean) => void
}

export const useChildProfile = create<ChildProfileState>()(
  persist(
    (set, get) => ({
      profiles: [],
      currentProfileId: null,
      parentSettings: {
        isPremium: false,
        privacyAccepted: false,
        allowNameCollection: true,
      },
      hasCompletedOnboarding: false,

      // Helper computed (not perfectly reactive in all cases, use selectors when possible)
      get profile() {
        const { profiles, currentProfileId } = get()
        return profiles.find(p => p.id === currentProfileId) || null
      },

      createProfile: (name: string, avatar: string) => {
        const newProfile: ChildProfile = {
          id: crypto.randomUUID(),
          name: name.trim(),
          avatar,
          createdAt: new Date().toISOString(),
          stars: 0,
          letterMastery: {},
        }

        set((state) => ({
          profiles: [...state.profiles, newProfile],
          currentProfileId: newProfile.id,
          hasCompletedOnboarding: true,
        }))
      },

      switchProfile: (id: string) => {
        if (get().profiles.some(p => p.id === id)) {
          set({ currentProfileId: id })
        }
      },

      updateProfile: (updates) => {
        set((state) => {
          if (!state.currentProfileId) return state
          return {
            profiles: state.profiles.map(p =>
              p.id === state.currentProfileId ? { ...p, ...updates } : p
            ),
          }
        })
      },

      deleteProfile: (id: string) => {
        set((state) => {
          const newProfiles = state.profiles.filter(p => p.id !== id)
          const newCurrent = state.currentProfileId === id 
            ? (newProfiles[0]?.id ?? null) 
            : state.currentProfileId

          return {
            profiles: newProfiles,
            currentProfileId: newCurrent,
            hasCompletedOnboarding: newProfiles.length > 0,
          }
        })
      },

      clearAllData: () => {
        set({
          profiles: [],
          currentProfileId: null,
          hasCompletedOnboarding: false,
          parentSettings: {
            isPremium: false,
            privacyAccepted: false,
            allowNameCollection: true,
          },
        })
      },

      clearProfile: () => {
        // Compatibilidade com os jogos (botão de engrenagem)
        const state = get()
        if (state.currentProfileId) {
          const newProfiles = state.profiles.filter(p => p.id !== state.currentProfileId)
          set({
            profiles: newProfiles,
            currentProfileId: newProfiles[0]?.id ?? null,
            hasCompletedOnboarding: newProfiles.length > 0,
          })
        }
      },

      completeOnboarding: () => {
        set({ hasCompletedOnboarding: true })
      },

      addStars: (amount: number) => {
        set((state) => {
          if (!state.currentProfileId) return state
          return {
            profiles: state.profiles.map(p =>
              p.id === state.currentProfileId
                ? { ...p, stars: (p.stars || 0) + amount }
                : p
            ),
          }
        })
      },

      recordLetterPractice: (letter: string, isCorrect: boolean) => {
        set((state) => {
          if (!state.currentProfileId) return state
          return {
            profiles: state.profiles.map(p => {
              if (p.id !== state.currentProfileId) return p
              const current = p.letterMastery[letter] || { correct: 0, attempts: 0 }
              return {
                ...p,
                letterMastery: {
                  ...p.letterMastery,
                  [letter]: {
                    attempts: current.attempts + 1,
                    correct: current.correct + (isCorrect ? 1 : 0),
                  },
                },
              }
            }),
          }
        })
      },

      setPremium: (isPremium, expiresAt) => {
        set((state) => ({
          parentSettings: { ...state.parentSettings, isPremium, premiumExpiresAt: expiresAt },
        }))
      },

      acceptPrivacy: (allowNameCollection) => {
        set((state) => ({
          parentSettings: {
            ...state.parentSettings,
            privacyAccepted: true,
            privacyAcceptedAt: new Date().toISOString(),
            allowNameCollection,
          },
        }))
      },
    }),
    {
      name: 'alfafa-child-profile',
      partialize: (state) => ({
        profiles: state.profiles,
        currentProfileId: state.currentProfileId,
        parentSettings: state.parentSettings,
        hasCompletedOnboarding: state.hasCompletedOnboarding,
      }),
    }
  )
)

// Selector helper for current profile (recommended way)
export const useCurrentProfile = () => {
  return useChildProfile((state) => 
    state.profiles.find(p => p.id === state.currentProfileId) || null
  )
}