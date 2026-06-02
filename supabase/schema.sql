-- ============================================================
-- Alfafa - Schema Supabase para sincronização de perfis de crianças
-- Execute este script inteiro no SQL Editor do seu projeto Supabase
-- ============================================================

-- 1. Tabela principal: children (perfis das crianças)
create table if not exists public.children (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (length(trim(name)) > 0),
  avatar text not null default '🐘',
  stars integer not null default 0 check (stars >= 0),
  letter_mastery jsonb not null default '{}'::jsonb,
  age integer,
  gender text, -- 'masculino' | 'feminino' (para o vocativo amiguinho/amiguinha e uso do nome na voz)
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Índice para buscas rápidas por responsável
create index if not exists children_parent_id_idx on public.children (parent_id);

-- 2. Trigger para manter updated_at atualizado automaticamente
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_updated_at on public.children;
create trigger set_updated_at
  before update on public.children
  for each row
  execute function public.handle_updated_at();

-- 3. Ativar Row Level Security (CRÍTICO para LGPD / isolamento)
alter table public.children enable row level security;

-- 4. Políticas RLS — o responsável só vê/edita os próprios filhos
-- Select (ler)
create policy "Parents can view their own children"
  on public.children
  for select
  using (parent_id = auth.uid());

-- Insert (criar)
create policy "Parents can insert their own children"
  on public.children
  for insert
  with check (parent_id = auth.uid());

-- Update (editar)
create policy "Parents can update their own children"
  on public.children
  for update
  using (parent_id = auth.uid())
  with check (parent_id = auth.uid());

-- Delete (apagar)
create policy "Parents can delete their own children"
  on public.children
  for delete
  using (parent_id = auth.uid());

-- 5. (Opcional mas recomendado) Habilitar realtime para sync mais rápido no futuro
-- alter publication supabase_realtime add table public.children;

-- 6. Comentários para documentação
comment on table public.children is 'Perfis de crianças vinculados a um responsável (auth.users). RLS garante que cada pai/mãe só acessa os próprios dados.';
comment on column public.children.parent_id is 'auth.uid() do responsável. Nunca exponha este dado no client de forma que permita cross-user access.';
comment on column public.children.letter_mastery is 'Objeto JSON com { "A": { "attempts": 12, "correct": 9 }, ... } — mesma estrutura do Zustand local.';

-- ============================================================
-- MIGRAÇÃO para versão com gender (adicione isso se a tabela já existe)
-- ALTER TABLE public.children ADD COLUMN IF NOT EXISTS gender text;
-- ALTER TABLE public.children ADD COLUMN IF NOT EXISTS age integer;
-- ============================================================

-- ============================================================
-- FIM DO SCHEMA
-- Depois de rodar, vá em Authentication > Providers e habilite "Email" (Magic Link)
-- ============================================================