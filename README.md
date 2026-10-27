# PokéQA Lab

Playground público (tema Pokédex administrativa) para treinar automação E2E e de API. Esta é a **Fase 1**: dashboard e CRUD completo de Pokémon com Supabase e PokéAPI. Os testes automatizados ficam por sua conta; o código já expõe `data-testid`, roles e labels estáveis.

## Onde os dados ficam
- **Supabase (PostgreSQL + REST + Storage)**: toda a persistência (Pokémon, atividades, uploads). Sem configuração, o site mostra um aviso e não grava nada.
- **PokéAPI**: somente leitura, consultada no navegador, com cache em `sessionStorage`. Pode ser desligada com `VITE_ENABLE_POKEAPI=false`.
- Treinadores, equipes, CSV, Component Playground e API Explorer **ainda não existem** (Fases 2 e 3). As tabelas de treinadores e equipes já estão no SQL.

## Pré-requisitos
Node 20+ e uma conta gratuita no Supabase.

## Configurar o Supabase
1. Crie um projeto em supabase.com.
2. No **SQL Editor**, execute nesta ordem: `supabase/schema.sql`, `supabase/policies.sql`, `supabase/storage.sql`, `supabase/seed.sql`.
3. Em **Project Settings > API**, copie a *Project URL* e a chave *anon/publishable*. **Nunca** use `service_role` no frontend.

## Rodar localmente
```bash
npm install
cp .env.example .env.local   # preencha URL e chave
npm run dev
```
Outros comandos: `npm run lint`, `npm run typecheck`, `npm run build`, `npm run seed:gen` (regera `supabase/seed.sql`).

## Publicar no GitHub Pages
1. Suba o repositório no GitHub (branch `main`).
2. **Settings > Pages > Source**: GitHub Actions.
3. **Settings > Secrets and variables > Actions > Variables**: crie `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` (valores públicos). Opcionais: `VITE_DEMO_MODE`, `VITE_ENABLE_POKEAPI`.
4. Faça push na `main`. O workflow `deploy.yml` roda lint, typecheck, build e publica. A navegação usa hash (`#/pokemon`) e `base: './'`, então funciona em `usuario.github.io/repositorio`.

## Modelo de segurança (demonstração pública)
- RLS ativo em todas as tabelas. Leitura pública; escrita só em linhas `is_demo = true`; `is_seed` não pode ser alterada pelo cliente.
- Limites e formatos são garantidos por CHECKs, índices únicos e triggers (ex.: máximo de 6 integrantes por equipe).
- `activity_logs` é preenchida por triggers e é somente leitura para o cliente.
- Qualquer visitante pode criar, editar e excluir registros de demonstração. Use apenas dados fictícios.

## Restaurar dados de demonstração
Dashboard > "Restaurar dados de demonstração" (exige confirmação e `demo_mode = 'true'` na tabela `app_settings`). Apaga e recria somente os registros de seed; registros criados por visitantes permanecem. Para desligar no banco: `update app_settings set value='false' where key='demo_mode';`.

## Limitações conhecidas
- Plano gratuito do Supabase pausa projetos inativos por cerca de 7 dias e tem quotas de banco e storage.
- A validação de MIME/tamanho no Storage depende da configuração do bucket (`storage.sql`) e da validação do cliente.
- Como o banco é público, edições simultâneas de outros visitantes podem gerar conflito (tratado com controle por `updated_at`).

## Troubleshooting
- *"Supabase não configurado"*: faltam as variáveis `VITE_*` (reinicie o `npm run dev` após editar o `.env.local`).
- *"Acesso negado pelas políticas (RLS)"*: rode `policies.sql` novamente.
- *Erro ao restaurar dados*: rode `seed.sql` e confirme `demo_mode = 'true'`.
- *Upload falha*: rode `storage.sql` e use PNG/JPG/WEBP/GIF até 2 MB.
