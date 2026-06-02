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

## 3. Habilite Magic Link (Email)

1. No dashboard Supabase: **Authentication** → **Providers**
2. Ative **Email**
3. Em **Email Templates** (opcional mas recomendado): customize o template de "Magic Link"
4. Em **URL Configuration** coloque a URL do seu site (para produção):
   - Site URL: `https://jogo-alfabeto-beta.vercel.app` (ou sua produção)
   - Redirect URLs: adicione `https://jogo-alfabeto-beta.vercel.app/**`

## 4. Variáveis no Vercel (produção)

Você precisa adicionar as mesmas duas variáveis no Vercel:

```bash
# No terminal (após vercel login)
cd _dev-apps_claude-code/apps/jogo-alfabeto
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
```

Depois rode `vercel --prod` ou dispare redeploy no dashboard.

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
