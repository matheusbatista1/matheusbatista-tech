# Deploy Guide — matheusbatistadev.com

Passo-a-passo para colocar o portfolio em produção na Vercel, com Postgres no Neon, rate limit opcional no Upstash, e DNS apontando para o domínio na HostGator.

> Pré-requisitos: conta na Vercel (já tem), domínio `matheusbatistadev.com` na HostGator (já tem), Node 20+ e Git locais. Você executa cada passo no respectivo dashboard — eu não posso fazer isso por você.

---

## 1. Criar database de produção no Neon

1. Acesse [console.neon.tech](https://console.neon.tech) → **Create project**.
   - Project name: `matheusbatistadev`
   - Region: **AWS São Paulo** (`sa-east-1`) — menor latência pra você
   - Postgres version: a mais recente
2. Após criar, vá em **Connection Details** e copie a connection string (algo como `postgresql://user:pass@ep-xxx.sa-east-1.aws.neon.tech/neondb?sslmode=require`).
3. **Anote essa string** — vai ser a `DATABASE_URL` na Vercel.

> Neon free tier: 0.5GB storage, branching ilimitado. Suficiente.

---

## 2. (Opcional) Criar Redis no Upstash

Sem isso, o rate limit cai em modo noop (sempre permite). Para o portfolio com AI features expostas publicamente, é recomendado configurar.

1. [console.upstash.com](https://console.upstash.com) → **Create database** → Redis.
   - Name: `matheusbatistadev-ratelimit`
   - Type: **Regional** (Global é mais caro)
   - Region: a mais perto da Vercel region (escolha São Paulo ou Virginia)
2. Em **Details**, copie:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`

> Free tier: 10k commands/dia, 256MB. Bastante.

---

## 3. Importar repo na Vercel

1. [vercel.com/new](https://vercel.com/new) → importar `matheusbatista1/matheusbatista-tech`.
2. **Framework Preset:** Next.js (auto-detectado).
3. **Root Directory:** `./` (raiz do repo).
4. **Build Command:** `pnpm build` (já configurado no `package.json` — vai rodar `prisma generate && prisma migrate deploy && next build`).
5. **Install Command:** `pnpm install` (auto).
6. **Output Directory:** `.next` (auto).

### Environment Variables (cole tudo antes do primeiro deploy)

| Variável                       | Valor                                                         |
| ------------------------------ | ------------------------------------------------------------- |
| `DATABASE_URL`                 | Connection string do Neon (passo 1)                           |
| `NEXT_PUBLIC_SITE_URL`         | `https://matheusbatistadev.com`                               |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Sua key do [aistudio.google.com](https://aistudio.google.com) |
| `UPSTASH_REDIS_REST_URL`       | Do passo 2 (ou vazio)                                         |
| `UPSTASH_REDIS_REST_TOKEN`     | Do passo 2 (ou vazio)                                         |
| `AUTH_SECRET`                  | Gere com `openssl rand -base64 32`                            |
| `AUTH_GOOGLE_ID`               | Client ID (passo 4)                                           |
| `AUTH_GOOGLE_SECRET`           | Client Secret (passo 4)                                       |
| `AUTH_ALLOWED_EMAILS`          | `matheus.sbatista@outlook.com`                                |

7. Clique em **Deploy**. Vai falhar no Google OAuth porque a redirect URI ainda não existe — segue pro próximo passo.

---

## 4. Configurar Google OAuth para produção

1. [console.cloud.google.com/apis/credentials](https://console.cloud.google.com/apis/credentials).
2. Selecione o OAuth client que você criou pra dev (ou crie um novo Web application).
3. Em **Authorized redirect URIs**, adicione:
   - `https://matheusbatistadev.com/api/auth/callback/google`
   - `https://matheusbatista-tech.vercel.app/api/auth/callback/google` _(URL temporária da Vercel — útil pra testar antes do DNS propagar)_
4. Salve. Copie Client ID e Secret pras env vars da Vercel (passo 3) se ainda não fez.

---

## 5. Apontar `matheusbatistadev.com` para a Vercel

### 5.1 No dashboard da Vercel

1. No projeto → **Settings** → **Domains** → **Add domain**.
2. Digite `matheusbatistadev.com` → **Add**.
3. Adicione também `www.matheusbatistadev.com` → **Add** (Vercel já configura redirect www → apex automaticamente).
4. A Vercel vai mostrar os DNS records que você precisa adicionar na HostGator.

### 5.2 No painel da HostGator (cPanel)

1. Acesse o cPanel da HostGator → **Zone Editor** (ou **DNS Zone Editor**).
2. Encontre `matheusbatistadev.com`.
3. **Remova** registros antigos que apontam pra HostGator (tipo `A` apontando pro servidor da HostGator, e `CNAME www` se houver).
4. **Adicione** os registros que a Vercel te deu:
   - Registro **A** apex (`@`): valor `76.76.21.21` (IP da Vercel)
   - Registro **CNAME** `www`: valor `cname.vercel-dns.com`
5. Salve. Propagação leva **15min–24h** (geralmente <1h).

> Pode acompanhar a propagação em [dnschecker.org](https://dnschecker.org) digitando `matheusbatistadev.com`.

### 5.3 Aguarde a Vercel verificar

Volte na Vercel → **Settings → Domains**. Quando ela mostrar status **Valid** com cadeado verde (SSL ativo), está pronto.

---

## 6. Seed do banco de produção (1ª vez)

A primeira vez que o build rodar, as migrations vão criar as tabelas no Neon. Mas o banco está **vazio** — sem hero, projetos, skills, etc.

### Opção A: Pelo Prisma Studio remoto (recomendado)

1. Localmente, crie um arquivo `.env.production.local`:
   ```
   DATABASE_URL="<connection string do Neon>"
   ```
2. Rode `pnpm dotenv-cli -e .env.production.local -- pnpm db:seed` (ou copie temporariamente a URL pro `.env` e rode `pnpm db:seed`).
3. Confirme com `pnpm db:studio` que os dados subiram.

### Opção B: Via admin (após login no domínio em prod)

Conecte em `https://matheusbatistadev.com/admin/signin`, faça login com Google, e popule manualmente em cada editor (Hero, About, Projects, Skills, Social, Settings).

---

## 7. Verificações finais

Depois do deploy bem-sucedido:

- [ ] `https://matheusbatistadev.com` carrega a home em inglês
- [ ] `https://matheusbatistadev.com/pt` mostra versão em português
- [ ] `https://matheusbatistadev.com/admin` redireciona pra signin
- [ ] Login com Google funciona (vai retornar 403 se o email não estiver no allowlist)
- [ ] AI Assistant abre com Cmd+K e responde
- [ ] Contact form envia mensagem (cheque o inbox em `/admin`)
- [ ] `https://matheusbatistadev.com/sitemap.xml` retorna XML
- [ ] `https://matheusbatistadev.com/robots.txt` retorna regras

---

## 8. Manutenção contínua

- **Cada push para `main`** → Vercel deploya automático em produção
- **Cada push para outras branches** → Vercel cria preview deploy (URL única)
- **Cada PR** → preview deploy comentado no GitHub
- **Migrations:** ao criar localmente com `pnpm db:migrate --name X`, commit o arquivo de migration. O build em prod roda `prisma migrate deploy` automaticamente
- **Logs:** Vercel dashboard → **Logs** (real-time + persistido 1 dia no Hobby plan)
- **Custos:** monitore em [aistudio.google.com](https://aistudio.google.com/usage) (Gemini), [upstash.com](https://upstash.com) (Redis), [neon.tech](https://console.neon.tech) (Postgres). Tudo deve ficar em $0/mês para portfolio pessoal

---

## Troubleshooting

**Build falha com "Can't reach database server":**

- Confira se `DATABASE_URL` na Vercel é exatamente igual ao do Neon
- Verifique se incluiu `?sslmode=require` no final
- Neon pode demorar pra "acordar" se ficar inativo muito tempo (free tier) — re-deploy resolve

**Google OAuth retorna `redirect_uri_mismatch`:**

- A URL exata configurada no Google Cloud precisa ser `https://matheusbatistadev.com/api/auth/callback/google` (sem `www`, com `https`)

**Rate limit não funciona em prod:**

- Confira se `UPSTASH_REDIS_REST_URL` e `UPSTASH_REDIS_REST_TOKEN` estão setadas
- Sem essas vars, fallback é noop (sempre permite — não é bug, é design)

**DNS demora muito pra propagar:**

- TTL antigo pode estar alto. Espere até 24h
- Pode forçar flush DNS local: `ipconfig /flushdns` (Windows) ou `sudo killall -HUP mDNSResponder` (Mac)
