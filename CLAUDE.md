# CLAUDE.md — Guia para colaboração com Claude neste projeto

Este arquivo orienta o Claude (e qualquer agente de IA) a trabalhar consistentemente neste codebase. **Leia antes de qualquer mudança.**

---

## 1. Visão geral

**matheusbatista-tech** é o portfolio pessoal de Matheus Batista — Software Engineer. É uma aplicação Next.js (App Router) com TypeScript estrito, Clean Architecture e features de IA (chat assistant, persona system, semantic search, generative UI blocks) construídas sobre o Vercel AI SDK com Google Gemini (free tier).

### Stack

| Camada     | Tecnologia                                                   |
| ---------- | ------------------------------------------------------------ |
| Framework  | Next.js 15 (App Router, Turbopack dev)                       |
| Linguagem  | TypeScript 5 strict                                          |
| Estilo     | Tailwind CSS v4 (config via `@theme` no CSS)                 |
| Anim       | Framer Motion + vanilla rAF                                  |
| i18n       | next-intl (rotas `/pt`, `/en`, `/es`)                        |
| ORM        | Prisma 6+                                                    |
| DB         | PostgreSQL (Neon em prod, Docker dev)                        |
| IA         | Vercel AI SDK + `@ai-sdk/google` — modelo `gemini-2.5-flash` |
| Rate limit | Upstash Redis + `@upstash/ratelimit`                         |
| Forms      | react-hook-form + zod                                        |
| Deploy     | Vercel                                                       |

---

## 2. Comandos

```bash
# Setup inicial
pnpm install
docker compose up -d                 # sobe Postgres local
pnpm db:migrate                      # cria tabelas
pnpm db:seed                         # popula com dados iniciais

# Desenvolvimento
pnpm dev                             # Next.js dev server (Turbopack)
pnpm lint                            # ESLint
pnpm lint:fix                        # ESLint com autofix
pnpm typecheck                       # tsc --noEmit
pnpm format                          # Prettier write
pnpm format:check                    # Prettier check

# Banco de dados
pnpm db:generate                     # Prisma Client
pnpm db:migrate                      # cria + aplica migrations (dev)
pnpm db:migrate:deploy               # aplica migrations (prod)
pnpm db:seed                         # roda prisma/seed.ts
pnpm db:studio                       # Prisma Studio (UI do DB)
pnpm db:reset                        # CUIDADO: dropa e recria tudo

# Build
pnpm build                           # build de produção
pnpm start                           # serve build
```

---

## 3. Clean Architecture — Regras de dependência

```
domain  ←  application  ←  infrastructure
                       ←  presentation (componentes / hooks / providers)
                          ↳  src/app/** (rotas Next) ───────────────────→  infrastructure (via container)
```

| Camada                                                      | Pode importar                                             | NUNCA importa                           |
| ----------------------------------------------------------- | --------------------------------------------------------- | --------------------------------------- |
| `src/domain/`                                               | nada externo                                              | qualquer outra camada                   |
| `src/application/`                                          | `domain`                                                  | `infrastructure`, `presentation`, `app` |
| `src/infrastructure/`                                       | `domain`, `application`                                   | `presentation`, `app`                   |
| `src/presentation/` (componentes/hooks/providers/lib)       | `domain` (tipos), `application` (use cases via container) | `infrastructure` **direto**             |
| `src/app/**` + `src/middleware.ts` (composition roots Next) | tudo                                                      | —                                       |
| `src/infrastructure/container.ts`                           | tudo                                                      | —                                       |

**Por que `src/app/` existe separado:** Next.js exige rotas em `src/app/` (convenção fixa). Tratamos `src/app/**` como **composition root** — só faz wiring entre route handlers/pages e use cases via `infrastructure/container.ts`. Lógica de UI fica em `src/presentation/components/`, hooks em `src/presentation/hooks/`, etc.

**Por quê:** o ESLint plugin `boundaries` está configurado em `eslint.config.mjs` e falha o lint se essas regras forem violadas. Exceções: route handlers e `container.ts` (composition root).

### Como adicionar uma feature nova (ordem)

1. **Entidade** em `src/domain/entities/` (tipo puro, zero deps)
2. **Interface de repositório** em `src/domain/repositories/` (se persistir)
3. **Implementação Prisma** em `src/infrastructure/repositories/`
4. **Use case** em `src/application/use-cases/<feature>/`
5. **Registrar** no `src/infrastructure/container.ts`
6. **Route handler** em `src/presentation/app/api/` (chama o use case via container)
7. **Componente** em `src/presentation/components/` (consome o endpoint, ou o use case se for server component)

---

## 4. Regras específicas para Claude

Ao gerar código, **siga estritamente**:

- **Componentes em `presentation/` recebem dados via use case** de `application/` injetado pelo container — NUNCA importe `infrastructure` direto de componente.
- **Toda nova entidade do domínio** começa em `domain/entities`, depois interface em `domain/repositories`, depois implementação Prisma em `infrastructure/repositories`, depois use case em `application/use-cases`.
- **Schema Prisma é a fonte de verdade do DB**, mas o `domain` não conhece Prisma. Use mapeadores em `infrastructure/db/mappers/` quando converter entre os dois.
- **Textos visíveis ao usuário sempre via next-intl** (arquivos `messages/{en,pt,es}.json`), nunca hardcoded.
- **Tokens visuais via Tailwind v4 `@theme` ou variáveis CSS** (`globals.css`). NUNCA cores literais em componentes (`bg-[#08080a]` → use `bg-bg`).
- **Animações:** Framer Motion para transições declarativas. Vanilla `requestAnimationFrame` para interações de alta frequência (cursor magnético, spotlight follower, parallax, 3D tilt).
- **Toda chamada à IA passa por um use case** em `application/use-cases/ai/*` e usa o port `IAIProvider`. NUNCA importe `ai` ou `@ai-sdk/google` direto em componentes ou route handlers.
- **Toda rota `/api/ai/*` aplica rate limit** (`chatLimiter.limit(ip)` + `dailyLimiter.limit(ip)`) ANTES de chamar o provider.
- **Respostas estruturadas (não-stream) são validadas com zod** — schemas em `infrastructure/ai/schemas/`. Se o JSON inválido → `ZodError` capturado → fallback amigável.
- **Cache de IA:** server-side em `AICache` (Postgres) compartilhado entre visitantes. Client-side em `localStorage` (`presentation/lib/ai-cache.ts`) para sessão pessoal. **Chaves de hash idênticas** entre os dois (`sha256(kind + locale + persona + queryNormalized)`).
- **Quando comentar:** só quando o **porquê** não for óbvio. Não comente o **o quê** — bons nomes já fazem isso.
- **Quando NÃO comentar:** não escreva docstrings/headers/blocos explicativos automaticamente. Não escreva comentários do tipo `// added for X` ou `// used by Y`.

---

## 5. Como adicionar uma nova feature de IA

Use este checklist:

1. **Defina o output** — qual JSON o modelo deve retornar? Crie o **schema zod** em `src/infrastructure/ai/schemas/<feature>.ts`.
2. **Defina o prompt** — template em `src/infrastructure/ai/prompts/<feature>.ts`. Use a função `buildPromptContext()` se precisar de dados do CMS.
3. **Crie o use case** em `src/application/use-cases/ai/<Feature>.ts`. Receba `IAIProvider`, `IAICacheRepository`, `IRateLimiter` via construtor.
4. **Cache-first:** sempre tente `cacheRepository.findByHash(hash)` antes de chamar o provider. Persistir o resultado depois.
5. **Crie o route handler** em `src/presentation/app/api/ai/<feature>/route.ts`. Aplique rate limit. Chame o use case via container.
6. **Crie o componente** em `src/presentation/components/ai/<Feature>.tsx`. Consuma o endpoint via `fetch` ou hook do AI SDK (`useChat`, `useCompletion`).
7. **i18n:** strings em `messages/{en,pt,es}.json` sob `ai.*`.

---

## 6. Conventional Commits + Gitflow

**Branches:**

- `main` — produção (protegida)
- `develop` — integração contínua
- `feature/<nome>` — novas features (saem de `develop`, merge em `develop`)
- `fix/<nome>` — bug fixes
- `chore/<nome>` — manutenção
- `release/<versao>` — preparação de release (sai de `develop`, merge em `main` + `develop`)

**Mensagens (commitlint enforced):**

```
<type>(<scope opcional>): <descrição>

[body opcional]

[footer opcional]
```

Types permitidos: `feat`, `fix`, `chore`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `revert`.

Exemplos:

- `feat(hero): add 3D tilt effect on heading`
- `fix(ai): handle ZodError in chat use case`
- `chore: bump dependencies`
- `docs(claude): add AI feature checklist`

---

## 7. Variáveis de ambiente

Veja `.env.example`. Resumo:

| Var                            | Obrigatória               | Onde pegar                         |
| ------------------------------ | ------------------------- | ---------------------------------- |
| `DATABASE_URL`                 | sim                       | Docker local OU Neon free tier     |
| `GOOGLE_GENERATIVE_AI_API_KEY` | sim (para features de IA) | https://aistudio.google.com (free) |
| `UPSTASH_REDIS_REST_URL`       | opcional em dev           | https://upstash.com (free)         |
| `UPSTASH_REDIS_REST_TOKEN`     | opcional em dev           | idem                               |
| `NEXT_PUBLIC_SITE_URL`         | sim                       | URL do site                        |

**Dev sem Upstash:** `UpstashRateLimiter` faz fallback para **noop** (sempre permite). Documentado no próprio adapter.

---

## 8. Design tokens

Estão em `src/presentation/app/globals.css` via `@theme` (Tailwind v4) + variáveis CSS clássicas.

- **Cores sólidas e fontes** → `@theme` (vira utility class `bg-bg`, `text-text-mute`, `font-sans`, etc).
- **Cores com alpha** (`surface`, `line`, `halo`) → `:root` como CSS custom property, usadas via `var(--surface)` nos componentes.

**Light mode:** override no seletor `[data-theme="light"]`.

**Fontes:** Inter, JetBrains Mono, Caveat, Instrument Serif — carregadas via `next/font/google` no root layout para zero CLS.

---

## 9. i18n (next-intl)

Idiomas: `en` (default), `pt`, `es`.

Rotas: `/`, `/pt`, `/es`. O `en` é o segmento implícito ou explícito conforme configuração em `src/presentation/lib/i18n/config.ts`.

**Adicionar uma nova chave de tradução:**

1. Adicione em `src/presentation/lib/i18n/messages/en.json`.
2. Replique em `pt.json` e `es.json`.
3. Consuma no componente:
   ```tsx
   "use client";
   import { useTranslations } from "next-intl";
   const t = useTranslations("hero");
   return <h1>{t("title")}</h1>;
   ```

---

## 10. Auth (decidido)

- **Provider:** NextAuth v5 (Auth.js) com Google OAuth + email allowlist
- **Configuração:** [src/infrastructure/auth/auth.ts](src/infrastructure/auth/auth.ts) — exporta `handlers`, `auth`, `signIn`, `signOut`
- **Vars necessárias:** `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `AUTH_ALLOWED_EMAILS` (vide `.env.example`)
- **Estrutura do /admin:**
  - `[locale]/admin/signin/page.tsx` — login com Google (não-protegido)
  - `[locale]/admin/(protected)/layout.tsx` — server component que faz `await auth()` e `redirect("/admin/signin")` se não autorizado
  - `[locale]/admin/(protected)/page.tsx` — dashboard (mensagens hoje, editors no futuro)
- **Por que não middleware:** usamos `session: { strategy: "database" }` (mais seguro que JWT). Prisma adapter não é edge-compatível, então o gate fica no Server Component do layout.
- **Setup do Google OAuth:**
  1. https://console.cloud.google.com/apis/credentials → criar OAuth client (Web)
  2. Authorized redirect URI: `http://localhost:3000/api/auth/callback/google` (dev) + `https://matheusbatistadev.com/api/auth/callback/google` (prod)
  3. Copiar Client ID e Secret pra `.env.local`

## 11. TODOs pendentes

- **Editors admin:** Hero, About, Projects, Skills, Social, Settings (vão em PRs separados)
- **Upload de assets:** Vercel Blob para imagens de projeto + CVs
- **Email:** Resend pro contact form + draft reply automático

---

## 11. Quando NÃO usar Claude / agentes

- **NÃO peça pra Claude rodar `db:reset` ou `git push --force`** sem aprovação explícita.
- **NÃO peça pra Claude criar nova migration sem revisar o diff** — migrations são duradouras.
- **NÃO peça pra Claude gastar créditos da Anthropic em endpoints expostos** sem rate limit configurado.

Para revisar um PR/branch, prefira o agente `code-reviewer` (ou peça uma segunda opinião com prompt explícito).
