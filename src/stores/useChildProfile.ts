import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase, isSupabaseEnabled, signInParentWithMagicLink, signOutParent, loadChildrenFromCloud, upsertChildToCloud, deleteChildFromCloud, pushAllLocalToCloud, syncOnLogin, onAuthStateChange } from '../lib/supabase'
import type { User } from '@supabase/supabase-js'

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

  // Supabase auth + sync
  supabaseUser: User | null
  isSyncing: boolean
  isAuthenticated: boolean

  // Computed
  profile: ChildProfile | null

  createProfile: (name: string, avatar: string) => void
  switchProfile: (id: string) => void
  updateProfile: (updates: Partial<ChildProfile>) => void
  deleteProfile: (id: string) => void
  clearAllData: () => void
  clearProfile: () => void

  completeOnboarding: () => void
  addStars: (amount: number) => void
  recordLetterPractice: (letter: string, isCorrect: boolean) => void

  setPremium: (isPremium: boolean, expiresAt?: string) => void
  acceptPrivacy: (allowNameCollection: boolean) => void

  // Novas ações de auth/sync
  signInWithEmail: (email: string) => Promise<{ success: boolean; message: string }>
  signOut: () => Promise<void>
  syncNow: () => Promise<void>
  initializeSupabaseSync: () => void
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

      // Supabase
      supabaseUser: null,
      isSyncing: false,
      isAuthenticated: false,

      // Helper computed
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

        // Sync para nuvem (fire-and-forget)
        if (get().isAuthenticated) {
          upsertChildToCloud(newProfile).catch(console.error)
        }
      },

      switchProfile: (id: string) => {
        if (get().profiles.some(p => p.id === id)) {
          set({ currentProfileId: id })
        }
      },

      updateProfile: (updates) => {
        set((state) => {
          if (!state.currentProfileId) return state
          const updated = state.profiles.map(p =>
            p.id === state.currentProfileId ? { ...p, ...updates } : p
          )
          return { profiles: updated }
        })

        const current = get().profile
        if (get().isAuthenticated && current) {
          upsertChildToCloud(current).catch(console.error)
        }
      },

      deleteProfile: (id: string) => {
        const wasCurrent = get().currentProfileId === id

        set((state) => {
          const newProfiles = state.profiles.filter(p => p.id !== id)
          const newCurrent = wasCurrent
            ? (newProfiles[0]?.id ?? null)
            : state.currentProfileId

          return {
            profiles: newProfiles,
            currentProfileId: newCurrent,
            hasCompletedOnboarding: newProfiles.length > 0,
          }
        })

        if (get().isAuthenticated) {
          deleteChildFromCloud(id).catch(console.error)
        }
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
          supabaseUser: null,
          isAuthenticated: false,
        })
      },

      clearProfile: () => {
        const state = get()
        if (state.currentProfileId) {
          const idToDelete = state.currentProfileId
          const newProfiles = state.profiles.filter(p => p.id !== idToDelete)
          set({
            profiles: newProfiles,
            currentProfileId: newProfiles[0]?.id ?? null,
            hasCompletedOnboarding: newProfiles.length > 0,
          })
          if (state.isAuthenticated) {
            deleteChildFromCloud(idToDelete).catch(console.error)
          }
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

        const p = get().profile
        if (get().isAuthenticated && p) {
          upsertChildToCloud(p).catch(console.error)
        }
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

        const p = get().profile
        if (get().isAuthenticated && p) {
          upsertChildToCloud(p).catch(console.error)
        }
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

      // ==================== AUTH + SYNC ====================

      signInWithEmail: async (email: string) => {
        const result = await signInParentWithMagicLink(email)
        return result
      },

      signOut: async () => {
        await signOutParent()
        set({ supabaseUser: null, isAuthenticated: false })
      },

      syncNow: async () => {
        const state = get()
        if (!state.isAuthenticated || !isSupabaseEnabled) return

        set({ isSyncing: true })
        try {
          // Push local atual
          await pushAllLocalToCloud(state.profiles)
          // Puxa o que está na nuvem (pode ter vindo de outro device)
          const cloudProfiles = await loadChildrenFromCloud()
          if (cloudProfiles.length > 0) {
            const mapped = cloudProfiles.map((c) => ({
              id: c.id,
              name: c.name,
              avatar: c.avatar,
              stars: c.stars,
              letterMastery: c.letter_mastery || {},
              createdAt: c.created_at,
            }))
            // Mantém o current se possível
            const stillExists = mapped.some((p) => p.id === state.currentProfileId)
            set({
              profiles: mapped,
              currentProfileId: stillExists ? state.currentProfileId : (mapped[0]?.id ?? null),
            })
          }
        } finally {
          set({ isSyncing: false })
        }
      },

      initializeSupabaseSync: () => {
        if (!isSupabaseEnabled || !supabase) return

        // 1. Listener de auth (roda no bootstrap)
        onAuthStateChange(async (user) => {
          const wasAuthenticated = get().isAuthenticated
          set({
            supabaseUser: user,
            isAuthenticated: !!user,
          })

          // Uma vez que o responsável autenticou, consideramos o "onboarding do app" feito.
          // Perfis de crianças são gerenciados separadamente (podem vir da nuvem).
          if (user) {
            set({ hasCompletedOnboarding: true })
          }

          if (user && !wasAuthenticated) {
            // Novo login → faz merge inteligente (sobe local ou baixa da nuvem)
            set({ isSyncing: true })
            try {
              const local = get().profiles
              const { profiles: merged, usedCloud } = await syncOnLogin(local)
              if (merged.length > 0) {
                set({
                  profiles: merged,
                  currentProfileId: merged[0]?.id ?? null,
                })
              }
              // Se merged.length === 0, mantemos hasCompleted true (por causa da auth)
              // e o Home vai mostrar a opção de criar o primeiro perfil.
              console.log('[Supabase] Sync no login concluído. Usou nuvem?', usedCloud)
            } finally {
              set({ isSyncing: false })
            }
          }

          if (!user) {
            set({ isAuthenticated: false })
          }
        })

        // 2. Tenta restaurar sessão atual (útil em reload)
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (session?.user) {
            set({ supabaseUser: session.user, isAuthenticated: true, hasCompletedOnboarding: true })
            // O onAuthStateChange acima também vai disparar, mas fazemos um sync inicial
            setTimeout(() => {
              get().syncNow().catch(console.error)
            }, 800)
          }
        })
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

// Inicializa o listener de Supabase assim que o store é importado
// (chamado automaticamente no bootstrap da app via main.tsx ou App)
if (typeof window !== 'undefined') {
  // Delay pequeno para garantir que o persist já carregou
  setTimeout(() => {
    try {
      useChildProfile.getState().initializeSupabaseSync()
    } catch (e) {
      console.warn('[Supabase] Falha ao inicializar sync', e)
    }
  }, 50)
}