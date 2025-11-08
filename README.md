<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/17sDqieKDJX6OVyI4gIxZaamPzUVUrgV3

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
4. Abra em `http://localhost:3000/`

Backend remoto
- O app consome um JSON Server remoto (Vercel, Railway, etc.).
- Configure variáveis de ambiente:
  - `VITE_API_MODE=json-server`
  - `VITE_API_BASE=https://db-logic-reflect.vercel.app` (sem barra final)
  - Faça o deploy com essas variáveis na Vercel.
  
Endpoints esperados:
- `GET/POST \`${VITE_API_BASE}/ranking\``
- `GET/PATCH/POST \`${VITE_API_BASE}/communityLevels\``
- `GET/PATCH/POST \`${VITE_API_BASE}/communityRatings\``

## Deploy apenas usando Git (sem servidor)

Em ambientes como Vercel, processos longos (como `json-server`) não rodam. Para um deploy sem backend, use o “Modo Git”:

- Defina variáveis de ambiente no build:
  - `VITE_API_MODE=git`
  - `VITE_GITHUB_OWNER=<seu-usuario>`
  - `VITE_GITHUB_REPO=<seu-repo>`
  - `VITE_GITHUB_REF=main` (ou a branch desejada)
- O app passa a ler `db.json` direto do GitHub (API de conteúdo) para:
  - `ranking`
  - `communityLevels`
  - `communityRatings`
- Publicar fases e avaliar no modo Git ficam desabilitados na UI. Para publicar/avaliar:
  - Abra o link de edição do `db.json` no GitHub e envie um PR editando os blocos `communityLevels`/`communityRatings`.
- O ranking continua gravando localmente (`localStorage`) para o jogador atual.

Observação: se quiser usar um backend no futuro, basta trocar `VITE_API_MODE` para `json-server` e subir o `json-server` em um host acessível.

## Usar JSON Server remoto

Se você preferir um servidor separado (Railway, Render, Fly.io, etc.), defina:

- `VITE_API_MODE=json-server`
- `VITE_API_BASE=https://seu-json-server.exemplo.com` (sem barra final)

O app consumirá:
- `GET/POST \`${VITE_API_BASE}/ranking\``
- `GET/PATCH/POST \`${VITE_API_BASE}/communityLevels\``
- `GET/PATCH/POST \`${VITE_API_BASE}/communityRatings\``

Requisitos:
- O endpoint deve responder em `https` (evitar bloqueio de mixed content no deploy em Vercel).
- CORS aberto (`Access-Control-Allow-Origin: *`), o JSON Server já habilita por padrão.
- Para expor publicamente, inicie com `--host 0.0.0.0` (em seu provedor) e use uma URL pública.

## Usar Supabase (recomendado)

Configure o app para usar Supabase em vez de JSON Server:

- `VITE_API_MODE=supabase`
- `VITE_SUPABASE_URL=https://kdyhhnrlkioywfgpbtgb.supabase.co`
- `VITE_SUPABASE_ANON_KEY=<sua chave anon>`

Schema esperado (tabelas e colunas):
- `ranking(id, initials text, score int, level text, at timestamp)`
- `community_levels(id, name text, grid jsonb, start_position jsonb, start_direction jsonb, inventory jsonb, teleporters jsonb, force_tiles jsonb, total_coins int, high_score int, origin text, created_by text, created_at timestamp)`
- `community_ratings(id, level_id bigint, user_name text, stars int, at timestamp)`

Políticas RLS (para permitir leitura/escrita com chave anônima):
```sql
-- Ranking
alter table ranking enable row level security;
create policy "ranking select" on ranking for select using (true);
create policy "ranking insert" on ranking for insert with check (true);

-- Community Levels
alter table community_levels enable row level security;
create policy "levels select" on community_levels for select using (true);
create policy "levels insert" on community_levels for insert with check (true);
create policy "levels update" on community_levels for update using (true) with check (true);

-- Community Ratings
alter table community_ratings enable row level security;
create policy "ratings select" on community_ratings for select using (true);
create policy "ratings insert" on community_ratings for insert with check (true);
create policy "ratings update" on community_ratings for update using (true) with check (true);
```

Uso no app:
- Publicar fase: insere/atualiza em `community_levels` (um por autor).
- Avaliar fase: insere/atualiza em `community_ratings` por `(level_id, user_name)`.
- Ranking: insere em `ranking` e lista top 10 por `score`.
