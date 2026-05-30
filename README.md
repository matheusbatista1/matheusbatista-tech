# matheusbatistadev.com

Portfolio pessoal de **Matheus Batista** — Software Engineer.

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io)
[![Vercel AI SDK](https://img.shields.io/badge/Vercel%20AI%20SDK-4-000?logo=vercel&logoColor=white)](https://sdk.vercel.ai)
[![Deploy on Vercel](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel&logoColor=white)](https://vercel.com)

---

## Sobre

Site pessoal com seções de hero, about, projects, skills e contato, em **PT / EN / ES**. Conta com um assistente de IA conversacional, sistema de personas que adapta o conteúdo em tempo real ao tipo de visitante (recruiter, tech lead, CTO, designer), busca semântica de projetos e um painel admin para gerenciar todo o CMS.

## Stack

- **Next.js 15** (App Router, Turbopack)
- **TypeScript 5** estrito
- **Tailwind CSS v4** (config via `@theme`)
- **Prisma 6** + **PostgreSQL** (Neon em prod, Docker dev)
- **next-intl** para i18n
- **Vercel AI SDK** + **Google Gemini 2.5 Flash** (free tier)
- **Upstash Redis** + **`@upstash/ratelimit`** (anti-abuso)
- **Framer Motion** + vanilla rAF
- **react-hook-form** + **zod**
- **Husky** + **commitlint** + **lint-staged**
- Deploy na **Vercel**

## Arquitetura

Clean Architecture com 4 camadas estritas:

```
src/
├── domain/          Regras puras, zero deps externas
├── application/     Use cases + ports (interfaces)
├── infrastructure/  Prisma, Vercel AI SDK, Upstash, mappers
└── presentation/    Next.js (app/, components/, hooks/, providers/)
```

Dependências permitidas:

```
domain  ←  application  ←  infrastructure
                       ←  presentation
                             ↳  (api routes + container) → infrastructure
```

ESLint `boundaries` aplica essas regras. Detalhes em [CLAUDE.md](CLAUDE.md).

## Setup local

### Pré-requisitos

- Node.js 20+
- pnpm (ou npm/yarn)
- Docker Desktop (para Postgres local)

### Passos

```bash
# 1. Clone e instale
git clone <repo>
cd matheusbatista-tech
pnpm install

# 2. Configure .env.local
cp .env.example .env.local
# Edite e adicione:
#   GOOGLE_GENERATIVE_AI_API_KEY — pegue em https://aistudio.google.com
#   UPSTASH_REDIS_REST_URL/TOKEN — opcional em dev (fallback noop)

# 3. Sobe o Postgres local
docker compose up -d

# 4. Migrations + seed
pnpm db:migrate
pnpm db:seed

# 5. Dev server
pnpm dev
```

Abra http://localhost:3000.

## Scripts

| Comando           | Descrição                    |
| ----------------- | ---------------------------- |
| `pnpm dev`        | Dev server (Turbopack)       |
| `pnpm build`      | Build de produção            |
| `pnpm start`      | Serve o build                |
| `pnpm lint`       | ESLint                       |
| `pnpm typecheck`  | TypeScript check             |
| `pnpm format`     | Prettier write               |
| `pnpm db:migrate` | Aplica migrations dev        |
| `pnpm db:seed`    | Popula DB com dados iniciais |
| `pnpm db:studio`  | UI do Prisma                 |
| `pnpm db:reset`   | Dropa e recria (cuidado!)    |

## Deploy

O projeto é otimizado para Vercel:

1. **Postgres:** crie um banco no [Neon](https://neon.tech) (free tier) → copie `DATABASE_URL`.
2. **Upstash:** crie Redis em [upstash.com](https://upstash.com) (free) → copie URL + TOKEN.
3. **Google AI:** API key em [aistudio.google.com](https://aistudio.google.com) (free).
4. Importe o repo no [Vercel](https://vercel.com), adicione as env vars e faça deploy.

## Conventional Commits

Mensagens de commit seguem [Conventional Commits](https://www.conventionalcommits.org) (commitlint enforced).

```
feat(hero): add 3D tilt effect
fix(ai): handle ZodError in chat use case
chore: bump dependencies
```

## Licença

[MIT](LICENSE) © Matheus Batista
