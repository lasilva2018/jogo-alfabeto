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

import { createClient } from '@supabase/supabase-js'

const env = (import.meta as any).env || {}
const supabaseUrl = env.VITE_SUPABASE_URL
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY

export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null

export const isSupabaseEnabled = !!supabase

// Tipos futuros (usar quando implementar as tabelas)
export interface CloudChild {
  id: string
  parent_id: string
  name: string
  avatar: string
  stars: number
  letter_mastery: Record<string, { correct: number; attempts: number }>
  updated_at: string
}

// Helpers de stub (serão implementados de verdade na próxima iteração)
export async function syncProfileToCloud(localProfile: any): Promise<void> {
  if (!supabase) {
    console.log('[Supabase] Sync ignorado — cliente não configurado')
    return
  }
  // TODO: upsert na tabela children com RLS
  console.log('[Supabase] (stub) Sincronizaria perfil:', localProfile.name)
}

export async function loadProfilesFromCloud(): Promise<any[]> {
  if (!supabase) return []
  // TODO: select * from children where parent_id = auth.uid()
  console.log('[Supabase] (stub) Carregaria perfis da nuvem')
  return []
}

export async function signInParent(email: string) {
  if (!supabase) {
    alert('Sincronização na nuvem ainda não está disponível nesta versão.')
    return
  }
  // magic link
  const { error } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: true } })
  if (error) {
    alert('Erro ao enviar link: ' + error.message)
  } else {
    alert('Link mágico enviado! Confira seu e-mail.')
  }
}
