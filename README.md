# matheusbatistadev.com

Personal portfolio of **Matheus Batista** — Software Engineer.

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io)
[![Vercel AI SDK](https://img.shields.io/badge/Vercel%20AI%20SDK-4-000?logo=vercel&logoColor=white)](https://sdk.vercel.ai)
[![Deploy on Vercel](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel&logoColor=white)](https://vercel.com)

---

## About

A personal site with hero, about, projects, skills, and contact sections, available in **PT / EN / ES**. It goes beyond a static portfolio with a set of AI-powered features:

- A conversational AI assistant (opens with `Cmd/Ctrl + K`).
- A **persona system** that adapts the content in real time to the type of visitor (recruiter, tech lead, CTO, designer).
- Semantic search across projects.
- An authenticated **admin panel** for managing the entire CMS.

The AI features run on the Vercel AI SDK with **Google Gemini 2.5 Flash** (free tier), gated behind Upstash-based rate limiting to keep usage in check.

## Tech stack

- **Next.js 15** (App Router, Turbopack) + **React 19**
- **TypeScript 5** (strict)
- **Tailwind CSS v4** (configured via `@theme`)
- **Prisma 6** + **PostgreSQL** (Neon in production, Docker in development)
- **next-intl** for i18n (PT / EN / ES)
- **Vercel AI SDK** + **Google Gemini 2.5 Flash** (free tier)
- **Upstash Redis** + **`@upstash/ratelimit`** (abuse protection)
- **NextAuth v5 (Auth.js)** — Google OAuth + email allowlist for the admin
- **Vercel Blob** for image and CV uploads
- **Framer Motion** + vanilla `requestAnimationFrame`
- **react-hook-form** + **zod**
- **Husky** + **commitlint** + **lint-staged**
- Deployed on **Vercel**

## Architecture

The codebase follows Clean Architecture with four strict layers:

```
src/
├── domain/          Pure business rules, zero external deps
├── application/     Use cases + ports (interfaces)
├── infrastructure/  Prisma, Vercel AI SDK, Upstash, mappers
└── presentation/    UI — components, hooks, providers
```

Allowed dependency direction:

```
domain  ←  application  ←  infrastructure
                       ←  presentation
                             ↳  (Next.js app/ routes + container) → infrastructure
```

> Next.js routes live in `src/app/**` and act as composition roots: they wire route handlers and pages to use cases via `infrastructure/container.ts`. The ESLint `boundaries` plugin enforces these rules. See [CLAUDE.md](CLAUDE.md) for the full conventions.

## Getting started

### Prerequisites

- Node.js 20+
- pnpm (npm/yarn also work)
- Docker Desktop (for local Postgres)

### Steps

```bash
# 1. Clone and install
git clone https://github.com/matheusbatista1/matheusbatista-tech.git
cd matheusbatista-tech
pnpm install

# 2. Configure your environment
cp .env.example .env.local
# Then fill in the values described in the table below.

# 3. Start local Postgres
docker compose up -d

# 4. Run migrations and seed the database
pnpm db:migrate
pnpm db:seed

# 5. Start the dev server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

See `.env.example` for the full, commented reference. Summary:

| Variable                       | Required        | Where to get it                                                           |
| ------------------------------ | --------------- | ------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`         | Yes             | Your site URL (`http://localhost:3000` in dev)                            |
| `DATABASE_URL`                 | Yes             | Local Docker Postgres, or [Neon](https://neon.tech) (free tier)           |
| `DIRECT_URL`                   | Yes             | Non-pooled Postgres URL for migrations (equals `DATABASE_URL` in dev)     |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Yes (for AI)    | [aistudio.google.com](https://aistudio.google.com) (free)                 |
| `UPSTASH_REDIS_REST_URL`       | Optional in dev | [upstash.com](https://upstash.com) (free; falls back to no-op)            |
| `UPSTASH_REDIS_REST_TOKEN`     | Optional in dev | Same as above                                                             |
| `AUTH_SECRET`                  | Yes (for admin) | Generate with `openssl rand -base64 32`                                   |
| `AUTH_GOOGLE_ID`               | Yes (for admin) | [Google Cloud Console](https://console.cloud.google.com/apis/credentials) |
| `AUTH_GOOGLE_SECRET`           | Yes (for admin) | Same as above                                                             |
| `AUTH_ALLOWED_EMAILS`          | Yes (for admin) | Comma-separated allowlist of admin emails                                 |
| `BLOB_READ_WRITE_TOKEN`        | Yes in prod     | Vercel Dashboard → Storage → Blob                                         |
| `ANALYTICS_SALT`               | Recommended     | Random string used to hash IPs in analytics logs                          |

> In development, leaving the Upstash variables empty activates a no-op rate limiter that always allows requests.

## Scripts

| Command                  | Description                                                                      |
| ------------------------ | -------------------------------------------------------------------------------- |
| `pnpm dev`               | Dev server (Turbopack)                                                           |
| `pnpm build`             | Production build (runs `prisma generate && prisma migrate deploy && next build`) |
| `pnpm start`             | Serve the production build                                                       |
| `pnpm lint`              | Run ESLint                                                                       |
| `pnpm lint:fix`          | ESLint with autofix                                                              |
| `pnpm typecheck`         | `tsc --noEmit`                                                                   |
| `pnpm format`            | Format with Prettier                                                             |
| `pnpm format:check`      | Check formatting with Prettier                                                   |
| `pnpm db:generate`       | Generate the Prisma client                                                       |
| `pnpm db:migrate`        | Create and apply migrations (dev)                                                |
| `pnpm db:migrate:deploy` | Apply migrations (production)                                                    |
| `pnpm db:seed`           | Seed the database with initial data                                              |
| `pnpm db:studio`         | Open Prisma Studio                                                               |
| `pnpm db:reset`          | Drop and recreate the database (careful!)                                        |

## Deployment

The project is optimized for Vercel. In short:

1. **Postgres** — create a database on [Neon](https://neon.tech) (free tier) and copy `DATABASE_URL`, plus a non-pooled `DIRECT_URL` for migrations.
2. **Upstash** — create a Redis instance on [upstash.com](https://upstash.com) (free) and copy the URL + token.
3. **Google AI** — create an API key at [aistudio.google.com](https://aistudio.google.com) (free).
4. **Auth & Blob** — set up Google OAuth credentials and a Vercel Blob store for the admin panel.
5. Import the repo into [Vercel](https://vercel.com), add the environment variables, and deploy.

See [DEPLOY.md](DEPLOY.md) for the full, step-by-step guide (Neon, Upstash, Google OAuth, DNS, and seeding production).

## Conventional Commits

Commit messages follow [Conventional Commits](https://www.conventionalcommits.org), enforced by commitlint.

```
feat(hero): add 3D tilt effect
fix(ai): handle ZodError in chat use case
chore: bump dependencies
```

## Contact

Matheus Batista — [matheus.sbatista@outlook.com](mailto:matheus.sbatista@outlook.com)

## License

[MIT](LICENSE) © Matheus Batista
