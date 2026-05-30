import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface ChildProfile {
  id: string
  name: string
  avatar: string
  createdAt: string
}

interface ChildProfileState {
  profile: ChildProfile | null
  hasCompletedOnboarding: boolean
  
  // Actions
  createProfile: (name: string, avatar: string) => void
  updateProfile: (updates: Partial<ChildProfile>) => void
  clearProfile: () => void
  completeOnboarding: () => void
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