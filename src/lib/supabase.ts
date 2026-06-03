/**
 * Supabase Client (preparação para sync de perfis e progresso)
 * 
 * FASE ATUAL: apenas scaffolding.
 * Quando ativado:
 *  - Responsável cria conta (email magic link ou Google/Apple)
 *  - Múltiplos perfis de crianças ficam associados ao user_id do responsável
 *  - Progresso (stars, letterMastery) sincronizado na tabela children_progress
 * 
 * Vantagens para comercialização:
 *  - Pais podem acessar o progresso de casa/celular/tablet
 *  - Backup seguro dos dados (mesmo se trocar de aparelho)
 *  - Futuro: relatórios por e-mail, múltiplos responsáveis, etc.
 * 
 * Segurança (LGPD):
 *  - RLS (Row Level Security) rigoroso: user só vê seus próprios children
 *  - Nunca expor dados de uma criança para outro responsável
 */

import { createClient, type User, type Session } from '@supabase/supabase-js'

const env = (import.meta as any).env || {}
const supabaseUrl = env.VITE_SUPABASE_URL
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY

export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null

export const isSupabaseEnabled = !!supabase

/**
 * Retorna a URL base do app para redirecionamentos (magic links, etc).
 * Prioridade:
 * 1. VITE_SITE_URL (defina no .env / Vercel)
 * 2. window.location.origin (útil em dev e previews)
 * 3. Fallback para o domínio beta conhecido
 */
export const getSiteUrl = (): string => {
  const env = (import.meta as any).env || {};
  const envUrl = env.VITE_SITE_URL;

  if (envUrl && typeof envUrl === 'string') {
    return envUrl.replace(/\/$/, ''); // remove trailing slash
  }

  if (typeof window !== 'undefined' && window.location && window.location.origin) {
    return window.location.origin;
  }

  // Fallback seguro para o beta atual
  return 'https://jogo-alfabeto-beta.vercel.app';
};

// ============================================
// Tipos (centralizados em ../types para evitar duplicação)
// ============================================
import type { CloudChild, LetterMasteryEntry } from '../types'

// Re-export for backward compat in other files that import from here
export type { CloudChild } from '../types'

/**
 * Mapeia um registro da nuvem (CloudChild) para o formato local do Zustand (ChildProfile).
 * Centraliza para evitar drift entre syncOnLogin, syncNow etc.
 */
export function mapCloudChildToLocal(c: CloudChild) {
  return {
    id: c.id,
    name: c.name,
    avatar: c.avatar,
    age: c.age,
    gender: c.gender,
    stars: c.stars,
    letterMastery: (c.letter_mastery || {}) as Record<string, LetterMasteryEntry>,
    createdAt: c.created_at,
  }
}

export interface SupabaseAuthState {
  user: User | null
  session: Session | null
  isLoading: boolean
}

// ============================================
// Auth (Magic Link - melhor UX para pais)
// ============================================
export async function signInParentWithMagicLink(email: string): Promise<{ success: boolean; message: string }> {
  if (!supabase) {
    return { success: false, message: 'Supabase não configurado (verifique .env.local)' }
  }
  const { error } = await supabase.auth.signInWithOtp({
    email: email.trim().toLowerCase(),
    options: {
      shouldCreateUser: true,
      emailRedirectTo: getSiteUrl(),
    },
  })
  if (error) {
    console.error('[Supabase] Magic link error:', error)
    return { success: false, message: error.message }
  }
  return { success: true, message: 'Link enviado! Verifique seu e-mail (inclusive spam).' }
}

export async function signOutParent(): Promise<void> {
  if (supabase) await supabase.auth.signOut()
}

export async function getCurrentUser(): Promise<User | null> {
  if (!supabase) return null
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export function onAuthStateChange(callback: (user: User | null) => void) {
  if (!supabase) return () => {}
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null)
  })
  return () => subscription.unsubscribe()
}

// ============================================
// Sync de Children (perfis)
// ============================================

export async function loadChildrenFromCloud(): Promise<CloudChild[]> {
  if (!supabase) return []
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('children')
    .select('*')
    .eq('parent_id', user.id)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('[Supabase] loadChildren error', error)
    return []
  }
  return (data as CloudChild[]) || []
}

export async function upsertChildToCloud(profile: {
  id?: string
  name: string
  avatar: string
  age?: number
  gender?: 'masculino' | 'feminino'
  stars: number
  letterMastery: Record<string, LetterMasteryEntry>
}): Promise<{ success: boolean; cloudId?: string }> {
  if (!supabase) return { success: false }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false }

  const payload: any = {
    parent_id: user.id,
    name: profile.name,
    avatar: profile.avatar,
    age: profile.age,
    gender: profile.gender,
    stars: profile.stars,
    letter_mastery: profile.letterMastery,
  }
  if (profile.id) payload.id = profile.id

  const { data, error } = await supabase
    .from('children')
    .upsert(payload, { onConflict: 'id' })
    .select('id')
    .single()

  if (error) {
    console.error('[Supabase] upsert error', error)
    return { success: false }
  }
  return { success: true, cloudId: data?.id }
}

export async function deleteChildFromCloud(childId: string): Promise<boolean> {
  if (!supabase) return false
  const { error } = await supabase.from('children').delete().eq('id', childId)
  if (error) {
    console.error('[Supabase] delete error', error)
    return false
  }
  return true
}

export async function pushAllLocalToCloud(localProfiles: any[]): Promise<number> {
  if (!supabase || localProfiles.length === 0) return 0
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return 0

  const payloads = localProfiles.map((p: any) => ({
    id: p.id,
    parent_id: user.id,
    name: p.name,
    avatar: p.avatar,
    age: p.age,
    gender: p.gender,
    stars: p.stars || 0,
    letter_mastery: p.letterMastery || {},
  }))

  const { error } = await supabase.from('children').upsert(payloads, { onConflict: 'id' })
  if (error) {
    console.error('[Supabase] batch push error', error)
    return 0
  }
  return payloads.length
}

/**
 * Lógica de merge no login:
 * - Se nuvem tem dados → usa nuvem (multi-dispositivo)
 * - Se nuvem vazia e temos local → sobe tudo automaticamente
 */
export async function syncOnLogin(localProfiles: any[]): Promise<{ profiles: any[]; usedCloud: boolean }> {
  const cloud = await loadChildrenFromCloud()

  if (cloud.length > 0) {
    const mapped = cloud.map(mapCloudChildToLocal)
    return { profiles: mapped, usedCloud: true }
  }

  if (localProfiles.length > 0) {
    await pushAllLocalToCloud(localProfiles)
    const fresh = await loadChildrenFromCloud()
    if (fresh.length > 0) {
      const mapped = fresh.map(mapCloudChildToLocal)
      return { profiles: mapped, usedCloud: false }
    }
  }
  return { profiles: [], usedCloud: false }
}
