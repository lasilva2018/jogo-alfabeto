# Supabase Setup — Alfafa (Passo a passo)

## 1. Credenciais já configuradas localmente
As variáveis já foram colocadas em `.env.local` usando o token de acesso do 1Password + Management API.

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY` (a chave pública "anon")

**Nunca** coloque a service_role key no client.

## 2. Rode o schema no Supabase (obrigatório)

1. Acesse https://supabase.com/dashboard/project/sqyhshtfcuilednkfnex
2. Vá em **SQL Editor** → **New query**
3. Abra o arquivo `supabase/schema.sql` deste projeto
4. Cole todo o conteúdo e clique **Run**

Isso cria a tabela `children` + RLS policies corretas (cada responsável só vê os próprios filhos).

## 3. Habilite Magic Link (Email) e configure Redirects (IMPORTANTE!)

1. No dashboard Supabase: **Authentication** → **Providers**
2. Ative **Email** (para Magic Link sem senha)

3. **URL Configuration** (o mais importante para o redirect funcionar corretamente):
   - Vá em **Authentication** → **URL Configuration**
   - **Site URL**: coloque `https://jogo-alfabeto-beta.vercel.app`
   - **Redirect URLs**: adicione as seguintes linhas (clique em "Add URL"):
     - `https://jogo-alfabeto-beta.vercel.app`
     - `https://jogo-alfabeto-beta.vercel.app/**`
   - (Opcional, para desenvolvimento local) Adicione também:
     - `http://localhost:5173`
     - `http://localhost:5173/**`

4. Em **Email Templates** (recomendado): personalize o template de "Magic Link" se quiser.

**Atenção**: Depois de mudar as URLs, pode demorar alguns segundos para propagar. Sempre peça um **novo link mágico** depois de configurar.

## 4. Variáveis no Vercel (produção)

Adicione estas variáveis de ambiente no Vercel (Settings → Environment Variables):

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_SITE_URL` → `https://jogo-alfabeto-beta.vercel.app` (ou o domínio final que você for usar)

Depois de adicionar, dispare um novo deploy (`vercel --prod` ou pelo dashboard).

Dica: você pode definir valores diferentes para Preview / Production se tiver múltiplos domínios.

## 5. Testando

- Abra o app (hard refresh ou incognito)
- Vá em Configurações (engrenagem)
- Na seção "Backup e Sincronização" coloque seu e-mail real
- Clique "Enviar link mágico"
- Abra o e-mail e clique no link
- O app deve voltar já logado e sincronizar seus perfis

## Segurança / LGPD

- Todas as policies usam `parent_id = auth.uid()`
- Mesmo com a anon key vazada, ninguém consegue ler dados de outras famílias
- Os dados de crianças nunca são expostos publicamente

## Próximos passos possíveis (quando quiser)

- Adicionar tabela `parent_settings` para sincronizar `isPremium` (hoje é local)
- Relatórios agregados (sem expor dados individuais)
- Realtime subscriptions (para múltiplos dispositivos abertos ao mesmo tempo)
- Exportar CSV do progresso para os pais

Qualquer dúvida, me avise que ajusto.
