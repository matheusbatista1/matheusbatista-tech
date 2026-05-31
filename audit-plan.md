# Plano consolidado de correcao — Admin

## 1. Resumo dos achados

**Total: 134 deltas** distribuidos em 7 areas.

### Por severidade

| Severidade | Qtd | %   |
| ---------- | --- | --- |
| critical   | 18  | 13% |
| high       | 36  | 27% |
| medium     | 50  | 37% |
| low        | 30  | 23% |

### Por area

| Area                                    | critical | high | medium | low | total |
| --------------------------------------- | -------- | ---- | ------ | --- | ----- |
| Login + AccessDenied + Visual Identity  | 4        | 4    | 5      | 2   | 15    |
| Shell (sidebar/topbar/content/pagehead) | 2        | 4    | 5      | 6   | 17    |
| Dashboard + Logs                        | 2        | 4    | 6      | 2   | 14    |
| Inbox + Draft Reply                     | 4        | 5    | 5      | 4   | 18    |
| Hero + About                            | 1        | 7    | 6      | 7   | 21    |
| Projects                                | 0        | 8    | 4      | 1   | 13    |
| CV + Social + Skills                    | 3        | 4    | 4      | 2   | 13    |
| Settings + AI + FX                      | 2        | 4    | 7      | 4   | 17    |

### Temas transversais (afetam multiplas areas)

1. **Classes CSS sem regras** — `admin-modal-*` (Confirm), `admin-toast-*` (Toast), `admin-access-denied-*`, modifiers `is-dragging`/`is-drop-target` quebrados por bug de string template.
2. **Tokens publicos vazando no admin** — signin usa `--color-bg-elev`/`--line`/`--radius-lg` em vez dos tokens `--admin-*`.
3. **Drift de tokens** — `--admin-text` `#f5f5f7` (deveria ser `#ffffff`), mute/dim com valores mais claros que o original.
4. **AIButton com gradient errado** — vivo `#7c5cff→#4aa6ff→#5cf2ff` em vez de gradient sutil cinza com sparkle azul `#3b82f6`.
5. **Form-row sem grid 200px / 1fr** — afeta Hero, About, Projects, Social, CV; todos usam stack vertical em vez do layout label-col esquerda.
6. **Animacoes globais ausentes** — stat-in stagger, row-in, card-in, button press scale(0.96), sidebar icon hover.
7. **Extras nao presentes no original** — drag-reorder em Social, archived no Inbox, slug/visible/pill-enum em Projects, SEO/Features/Contact em Settings.

---

## 2. Plano de correcao em fases

### Fase 1 — Foundation: tokens, primitives, classes quebradas

**Por que primeiro:** todas as fases subsequentes consomem `.admin-form-row`, `.admin-toggle`, `.admin-modal-*`, `.admin-btn-ai`, tokens `--admin-*`. Corrigir aqui evita repintar 20 componentes depois.

**Arquivos:**

- `src/presentation/app/admin.css`
- `src/presentation/components/admin/ui/primitives.css`
- `src/presentation/components/admin/forms/forms.css`
- `src/presentation/components/admin/providers/ConfirmProvider.tsx`
- `src/presentation/components/admin/providers/ToastProvider.tsx`
- `src/presentation/components/admin/ui/AIButton.tsx` (verificar)

**Tasks:**

1. **Restaurar tokens admin canonicos** em `admin.css` (`:root` ou `.admin-shell`):

   ```css
   --admin-text: #ffffff;
   --admin-text-mute: #8e8e95;
   --admin-text-dim: #5a5a62;
   ```

2. **Reescrever `.admin-form-row`** (forms.css) para grid 200px / 1fr:

   ```css
   .admin-form-row {
     display: grid;
     grid-template-columns: 200px minmax(0, 1fr);
     gap: 32px;
     align-items: start;
     padding: 20px 0;
     border-bottom: 1px solid var(--admin-border);
     margin-bottom: 0;
   }
   .admin-form-row:last-child {
     border-bottom: 0;
   }
   .admin-form-row-label-col {
     font-size: 13px;
     font-weight: 500;
     color: var(--admin-text);
   }
   .admin-form-row-label-col .help {
     margin-top: 4px;
     font-size: 12px;
     color: var(--admin-text-mute);
     font-weight: 400;
   }
   @media (max-width: 880px) {
     .admin-form-row {
       grid-template-columns: 1fr;
       gap: 8px;
       padding: 16px 0;
     }
   }
   ```

   Remover `text-transform: uppercase` e letter-spacing dos labels.

3. **Corrigir `.admin-btn-ai`** (primitives.css):

   ```css
   .admin-btn-ai {
     background: linear-gradient(180deg, var(--admin-surface-2), var(--admin-surface));
     color: var(--admin-text);
     border: 1px solid var(--admin-border-soft);
     font-weight: 500;
   }
   .admin-btn-ai:hover:not(:disabled) {
     border-color: var(--admin-border-strong);
     box-shadow: 0 4px 16px rgba(120, 130, 255, 0.1);
   }
   .admin-btn-ai .admin-btn-icon-slot {
     color: var(--admin-accent-blue);
   }
   .admin-btn-ai[aria-busy="true"] .admin-btn-icon-slot {
     color: var(--admin-text-mute);
   }
   ```

4. **Corrigir Toggle** (primitives.css `.admin-toggle`):
   - Off: bg `--admin-bg-2`, thumb 14x14 em `--admin-text-mute`.
   - On: bg `--admin-text` (branco), thumb 14x14 em `--admin-bg`, translateX 16px.

5. **Reescrever ConfirmProvider**:
   - Classe correta `admin-modal-confirm` + CSS completo (420px, 16px radius, shadow, rise 200ms).
   - Icon 44x44 circular surface-2 ACIMA do titulo, nao inline.
   - Backdrop blur 10px e bg `rgba(0,0,0,0.62)`.
   - Adicionar `.admin-modal-title`, `.admin-modal-message`, `.admin-modal-actions { min-width: 110px }` com media query column-reverse <=640px.

6. **Reescrever ToastProvider + CSS**:
   - Portar regras de admin-styles.css L1199-1244 para um arquivo dedicado.
   - Adicionar `<div class="admin-toast-icon">` com SVG por kind (success=check, error=alert-circle, info=info, warning=triangle) e tint backgrounds.
   - Progress bar 2px draining via scaleX(1)→scaleX(0).
   - Default kind = `success` (nao `info`).
   - Duration default 3200ms.

7. **Button press feedback** (primitives.css): `.admin-btn:active:not(:disabled) { transform: scale(0.96); }` + `.admin-btn-primary:hover { box-shadow: 0 6px 20px rgba(255,255,255,0.08); }`.

8. **Global reduced-motion**:
   ```css
   @media (prefers-reduced-motion: reduce) {
     .admin-shell *,
     .admin-shell *::before,
     .admin-shell *::after {
       animation-duration: 0.01ms !important;
       animation-iteration-count: 1 !important;
       transition-duration: 0.01ms !important;
     }
   }
   ```

**Verificacao:** `pnpm typecheck`, `pnpm lint`, abrir qualquer pagina admin e validar Confirm/Toast renderizam visualmente; AIButton tem fundo cinza com sparkle azul.

---

### Fase 2 — Shell: sidebar, topbar, content, pagehead

**Arquivos:**

- `src/presentation/components/admin/shell/AdminSidebar.tsx`
- `src/presentation/components/admin/shell/AdminSidebarServer.tsx`
- `src/presentation/components/admin/shell/AdminTopbar.tsx`
- `src/presentation/components/admin/shell/AdminTopbarBreadcrumb.tsx`
- `src/presentation/app/admin.css`
- `src/presentation/lib/i18n/messages/{en,pt,es}.json`

**Tasks:**

1. **Sidebar — secoes corrigidas:**
   - Overview: Dashboard (LayoutGrid) + Inbox (Mail) + **Logs (ScrollText/AlignJustify)** [novo].
   - Content: Hero (**Home**), Projects (Folder), **Skills (Sparkles)**, About (User).
   - Configuration: Social (**Link/Link2**), **Curriculum (FileText)**, Settings.
   - Adicionar tipo `AdminNavItemKey` incluindo `'logs'`.

2. **Brand sidebar:** mark default `'mb'` (nao `'M'`), font-size 13px. Adicionar bloco info de duas linhas:

   ```tsx
   <span className="admin-sidebar-brand-info">
     <span className="t">Portfolio</span>
     <span className="s">{tShell("title")}</span>
   </span>
   ```

   CSS: `.admin-sidebar-brand-info { display: flex; flex-direction: column; line-height: 1.2 }` + `.t { font-size:14px; font-weight:600 } .s { font-size:11px; color: var(--admin-text-mute) }`.

3. **Sidebar — paddings + active rail:**
   - Container: `padding: 0; gap: 0`.
   - Brand: `padding: 22px 24px 18px`.
   - Cada section wrap: `.admin-sidebar-section { padding: 18px 12px 4px }`.
   - Active rail: `top: 6px; bottom: 6px; height: auto; border-radius: 0 2px 2px 0` (remover translateY centering).

4. **Badge sidebar:** remover pulse animation, voltar para `padding: 1px 6px; border-radius: 8px; font-weight: 700`.

5. **Sidebar footer:** uma unica linha horizontal — avatar 32x32 (gradient `linear-gradient(135deg, #4285f4, #34a853)`) + info + botao logout ICON-ONLY (sem texto "Sign out"). Remover a segunda row full-width.

6. **Topbar:**
   - Padding `0 32px` (era 40px).
   - Separator breadcrumb `›` (U+203A), nao `/`.
   - kbd: `⌘K` (U+2318+K), nao `Ctrl K`. Padding 1px 5px, bg transparent.
   - Adicionar botao Eye "View portfolio" apos Bell: `<Link href="/" target="_blank" rel="noreferrer" className="admin-topbar-bell"><Eye/></Link>`.
   - Breadcrumb sempre mostra `Admin › Dashboard` mesmo no root.

7. **Content:** remover `margin: 0 auto` (left-aligned).

8. **PageHead:** `margin-bottom: 28px` (era 24px).

9. **Mobile breakpoint:** trocar `@media (max-width: 880px)` por `980px`. Sidebar mobile width 280px.

10. **i18n:** adicionar `admin.shell.viewPortfolio` em en/pt/es.

**Verificacao:** clicar todos os links do sidebar; verificar nav items, mark "mb", breadcrumb com `›`, View portfolio button abre `/` em nova aba.

---

### Fase 3 — Signin + AccessDenied (visual identity)

**Arquivos:**

- `src/app/[locale]/admin/signin/page.tsx`
- `src/presentation/components/admin/AccessDenied.tsx`
- `src/presentation/components/admin/GoogleIcon.tsx` [novo]
- `src/presentation/components/admin/AdminGlow.tsx` [novo]
- Mover CSS de `globals.css` (linhas 3404-3503) para `admin.css`
- `src/presentation/lib/i18n/messages/{en,pt,es}.json`

**Tasks:**

1. **Migrar tokens:** mover bloco signin de globals.css para admin.css e trocar:
   - `var(--color-bg-elev)` → `var(--admin-surface)`
   - `var(--line)` → `var(--admin-border)`
   - `var(--radius-lg)` → `16px`
   - `var(--color-text)` → `var(--admin-text)`
   - `var(--color-danger)` → `var(--admin-red)`

2. **Wrapper signin:** envolver com `.admin-shell` + `<AmbientBackground />` + `<AdminGlow />`. Card precisa `position: relative; z-index: 2`.

3. **Mark signin:**

   ```css
   .admin-signin-mark {
     margin: 0 auto 28px;
     width: 56px;
     height: 56px;
     border-radius: 14px;
     background: var(--admin-bg);
     border: 1px solid rgba(255, 255, 255, 0.1);
     display: grid;
     place-items: center;
     font-weight: 900;
     font-size: 22px;
     letter-spacing: -0.05em;
   }
   .admin-signin-mark::after {
     content: "·";
     margin-left: 2px;
     color: var(--admin-text-mute);
   }
   ```

   JSX: `<div className="admin-signin-mark">mb</div>` (o `·` vira do `::after`).

4. **Animacoes card-rise + mark-pop:**

   ```css
   @keyframes admin-signin-card-rise {
     from {
       opacity: 0;
       transform: translateY(20px) scale(0.98);
     }
     to {
       opacity: 1;
       transform: none;
     }
   }
   @keyframes admin-signin-mark-pop {
     from {
       opacity: 0;
       transform: scale(0.5);
     }
     to {
       opacity: 1;
       transform: scale(1);
     }
   }
   .admin-signin-card {
     animation: admin-signin-card-rise 700ms cubic-bezier(0.22, 1, 0.36, 1) both;
   }
   .admin-signin-mark {
     animation: admin-signin-mark-pop 600ms cubic-bezier(0.34, 1.4, 0.64, 1) 0.15s both;
   }
   ```

5. **AdminGlow component** (`'use client'`):

   ```tsx
   useEffect(() => {
     const onMove = (e: MouseEvent) => {
       document.documentElement.style.setProperty("--glow-x", `${e.clientX}px`);
       document.documentElement.style.setProperty("--glow-y", `${e.clientY}px`);
     };
     window.addEventListener("mousemove", onMove);
     return () => window.removeEventListener("mousemove", onMove);
   }, []);
   return <div className="admin-glow" aria-hidden />;
   ```

   CSS: `.admin-glow { position:fixed; width:480px; height:480px; border-radius:50%; background: radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 60%); pointer-events:none; z-index:1; mix-blend-mode:screen; top:0; left:0; transform: translate(calc(var(--glow-x,0px) - 240px), calc(var(--glow-y,0px) - 240px)); }`

6. **Card signin:** width `min(440px, 100%)`, padding `48px 40px`, border-radius `16px`. Sub-margin 36px, h1 letter-spacing `-0.01em`.

7. **GoogleIcon component** com 4 paths coloridos oficiais (#4285F4 / #34A853 / #FBBC05 / #EA4335) viewBox `0 0 18 18`.

8. **Botao Google** retangular: `padding: 13px 16px; border-radius: 10px; font-size: 15px; font-weight: 500; gap: 12px`. Hover `opacity: 0.92` (nao translateY).

9. **AccessDenied refatorado:**

   ```tsx
   <div className="admin-shell" data-theme="dark">
     <AmbientBackground />
     <AdminGlow />
     <main className="admin-signin">
       <div className="admin-signin-card">
         <span className="admin-signin-mark is-danger">!</span>
         <h1>{t("title")}</h1>
         <p>{t.rich("message", { email, strong: (c) => <strong>{c}</strong> })}</p>
         <form action={signOutAction}>
           <button className="admin-signin-google">{t("tryAnother")}</button>
         </form>
       </div>
     </main>
   </div>
   ```

   Modifier CSS: `.admin-signin-mark.is-danger { background: rgba(239,68,68,0.1); color: var(--admin-red); border-color: rgba(239,68,68,0.3); }`.

10. **Divider + foot** opcionais no signin (Terms / Privacy / Back to portfolio). NAO portar demo button (backdoor em NextAuth real).

11. **i18n signin:** mover strings hardcoded para `admin.signin.{title,subtitle,continueWithGoogle,backToPortfolio,terms,privacy,authNotConfigured,errorAccessDenied,errorGeneric}`. Title = `Sign in to Admin`. Subtitle = `Manage your portfolio content, projects, and messages.\nOnly the owner can access this panel.`.

**Verificacao:** abrir `/admin/signin` em dark, ver mark animar, botao Google com SVG colorido, ambient backdrop visivel; logar com conta nao allowlisted -> AccessDenied centralizado com `!` vermelho.

---

### Fase 4 — Dashboard + rota /admin/logs

**Arquivos:**

- `src/app/[locale]/admin/(protected)/page.tsx`
- `src/app/[locale]/admin/(protected)/logs/page.tsx` [novo]
- `src/presentation/components/admin/dashboard/StatsGrid.tsx`
- `src/presentation/components/admin/dashboard/Sparkline.tsx` [novo]
- `src/presentation/components/admin/dashboard/CountUp.tsx` [novo]
- `src/presentation/components/admin/dashboard/RecentMessages.tsx`
- `src/presentation/components/admin/dashboard/RecentActivity.tsx`
- `src/presentation/components/admin/logs/LogsPage.tsx` [novo]
- `src/application/use-cases/dashboard/GetDashboardStats.ts`
- `src/presentation/app/admin.css`
- `src/presentation/lib/i18n/messages/{en,pt,es}.json`

**Tasks:**

1. **GetDashboardStats** estender output: `{ totalVisits, totalMessages, unreadMessages, visibleProjects, cvDownloads, visitsSpark[], messagesSpark[], projectsSpark[], cvSpark[], visitsTrend, unreadCount }`.

2. **Sparkline** SVG polyline + dots, viewBox proporcional, stroke `currentColor`, props `data: number[]; height: number`.

3. **CountUp** (`'use client'`): rAF 0→target em 600-900ms, respeita prefers-reduced-motion.

4. **StatCard** props extras: `spark: number[]`, `trend: string`, `trendKind: 'up'|'down'`. Render order: label → value (CountUp) → sparkline → trend.

5. **Stats grid** corrigido: 4 cards Eye/Mail/Folder/Download com semantica certa (Total visits, Messages, Projects, CV downloads).

6. **CSS stats:**

   ```css
   .admin-stats-grid {
     grid-template-columns: repeat(4, 1fr);
     gap: 14px;
     margin-bottom: 24px;
   }
   .admin-stat-card > .admin-card-body {
     padding: 18px 20px;
     gap: 6px;
   }
   .admin-stat-label {
     font-size: 12px;
     letter-spacing: 0.02em;
     color: var(--admin-text-mute);
     text-transform: none;
   }
   .admin-stat-trend {
     font-size: 11px;
     color: var(--admin-green);
   }
   .admin-stat-trend.down {
     color: var(--admin-red);
   }
   @keyframes admin-stat-in {
     from {
       opacity: 0;
       transform: translateY(14px);
     }
     to {
       opacity: 1;
       transform: none;
     }
   }
   .admin-stats-grid .admin-stat-card {
     animation: admin-stat-in 520ms var(--ease-out-soft) both;
     transition:
       border-color 220ms,
       transform 320ms var(--ease-out-soft),
       background 220ms;
   }
   .admin-stats-grid > .admin-stat-card:nth-child(1) {
     animation-delay: 0.04s;
   }
   .admin-stats-grid > .admin-stat-card:nth-child(2) {
     animation-delay: 0.1s;
   }
   .admin-stats-grid > .admin-stat-card:nth-child(3) {
     animation-delay: 0.16s;
   }
   .admin-stats-grid > .admin-stat-card:nth-child(4) {
     animation-delay: 0.22s;
   }
   .admin-stat-card:hover {
     transform: translateY(-3px);
     background: var(--admin-surface-2);
     border-color: var(--admin-border-strong);
   }
   ```

7. **Dashboard grid:** `grid-template-columns: 2fr 1fr` (era 1.4fr 1fr).

8. **RecentMessages** virar `<table class="admin-tbl">` com cols From/Subject/Received/arrow, dot azul antes do From quando unread, row clickavel para `/admin/inbox?id=X`.

9. **RecentActivity** feed humanizado: icone 28x28 circular + texto narrativo + when 11.5px dim. Source data: ultimas mensagens, ultimo Project updatedAt, ultima Skill, etc.

10. **PageHead Dashboard** com action `<Link href="/" target="_blank"><Eye/> View portfolio</Link>` (ghost).

11. **Nova rota /admin/logs:**
    - Page client component LogsPage portado de admin-logs.jsx.
    - Severity strip (4 botoes error/warn/info/debug com dots coloridos).
    - Live tail toggle (Pause/Play) com setInterval 2.2s.
    - Filtros source (api/database/auth/system/ai/email) + level + search com clear.
    - Console font-mono bg `#0a0a0e`, rows com timestamp/badge/srcchip/msg/ms/rel.
    - Click expande detalhe com `.ld-grid` 4 cols + `.ld-block` SQL/stack + Copy JSON.
    - Portar ~170 linhas de CSS `.log-*` para admin.css.
    - Seed sintetico no client por enquanto (sem rota /api/logs).

**Verificacao:** dashboard mostra 4 cards com sparklines verdes, valores contam de 0; tabela de mensagens recentes; activity feed; `/admin/logs` abre com console preto, severity strip, live toggle.

---

### Fase 5 — Inbox + Draft Reply

**Arquivos:**

- `src/app/[locale]/admin/(protected)/inbox/page.tsx`
- `src/presentation/components/admin/inbox/InboxFilters.tsx`
- `src/presentation/components/admin/inbox/MessageList.tsx`
- `src/presentation/components/admin/inbox/MessageRow.tsx`
- `src/presentation/components/admin/inbox/MessageDetail.tsx`
- `src/presentation/components/admin/inbox/MessageActions.tsx`
- `src/presentation/components/admin/inbox/MarkAllReadButton.tsx`
- `src/app/api/ai/draft-reply/route.ts`
- `src/presentation/app/admin.css`

**Tasks:**

1. **Remover feature archived completa:**
   - `InboxFilter = 'all' | 'unread'` (dropar `archived`).
   - parseFilter default = `'all'`.
   - Remover branch archived em listOptsFor.
   - Remover Archive/Unarchive de MessageActions.
   - Considerar drop da coluna `archived` no Prisma OU ignorar (decisao de produto — recomendado manter coluna mas nao expor UI).

2. **Layout 2-pane:**

   ```css
   .admin-inbox-grid {
     display: grid;
     grid-template-columns: 380px 1fr;
     gap: 16px;
     height: calc(100vh - var(--tb-h) - 64px - 80px);
     min-height: 520px;
   }
   ```

   Remover `.admin-inbox-side` aside da page.tsx.

3. **InboxFilters segmented pill** no PageHead actions:

   ```tsx
   <div className="admin-inbox-filter-pill">
     <Button size="sm" variant={f === "all" ? "primary" : "ghost"}>
       All ({total})
     </Button>
     <Button size="sm" variant={f === "unread" ? "primary" : "ghost"}>
       Unread ({unread})
     </Button>
   </div>
   ```

   CSS: `display:flex; background: var(--admin-surface); border: 1px solid var(--admin-border); border-radius: 8px; padding: 2px;`. Botoes border-radius 6px.

4. **MarkAllReadButton** variant `ghost` (era default), icon `Check`.

5. **Auto-mark-read:** em `inbox/page.tsx` server component:

   ```ts
   if (selected && !selected.read) {
     await container.useCases.markMessageRead.execute(selected.id);
   }
   ```

6. **MessageDetail header refeito:**

   ```tsx
   <div className="admin-msg-detail-head">
     <div>
       <h2>{subject}</h2>
       <div className="meta">
         <strong>{from}</strong> · {email}
         <br />
         Received {formatDateTime(receivedAt)}
       </div>
     </div>
     <div className="head-actions">
       <IconButton variant="ghost" icon={read ? <EyeOff /> : <Eye />} onClick={toggleRead} />
       <IconButton variant="danger" icon={<Trash2 />} onClick={handleDelete} />
     </div>
   </div>
   ```

7. **MessageActions bottom toolbar reduzido a 3:**
   - Primary mailto: `<a className="admin-btn admin-btn-primary" href={`mailto:${email}?subject=Re: ${encodeURIComponent(subject)}`}><Reply/> Reply via email</a>`
   - AIButton `Draft reply`
   - Ghost `Copy email` (sem icone)

8. **Draft reply INLINE (nao Modal):**

   ```tsx
   {draftOpen && (
     <div className="admin-ai-draft">
       <div className="admin-ai-draft-head">
         <span className="admin-ai-draft-tag"><Sparkles size={12}/> AI draft</span>
         <button className="admin-ai-draft-x" onClick={() => setDraftOpen(false)}><X size={13}/></button>
       </div>
       <textarea className="admin-form-textarea" rows={6} value={draft} onChange={...} />
       <div className="admin-ai-draft-actions">
         <a className="admin-btn admin-btn-primary admin-btn-sm" href={mailtoWithBody}>Open in email</a>
         <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={copyDraft}>Copy draft</button>
       </div>
     </div>
   )}
   ```

   CSS: `margin-top:18px; border:1px solid var(--admin-border-soft); border-radius:12px; padding:14px; background:var(--admin-bg-2);` + variants ai-draft-tag/ai-draft-x.

9. **API route `/api/ai/draft-reply`** retornar `{ body: string }` apenas (dropar subject). Atualizar prompt para "Return ONLY the reply body text, no subject line".

10. **MessageRow:**
    - Padding `14px 18px` (era 12px 14px).
    - From 13.5px/600, subject 13px, preview 12.5px nowrap ellipsis.
    - Unread dot via `::before` absolute em `is-unread`, NAO inline.
    - Selected: bg `var(--admin-surface-2)`, sem border-left azul.
    - Subject literal (dropar fallback de body).
    - Tempo relativo compacto: `3d ago`, `2h ago`, `5m ago`.

11. **Empty state:**

    ```tsx
    <div className="admin-msg-empty-state">
      <Mail size={32} style={{ opacity: 0.4, marginBottom: 12 }} />
      <div>{t("selectOne")}</div>
    </div>
    ```

12. **Detail padding** 28px (20px mobile).

13. **Row-in animation:** `@keyframes admin-row-in { from { opacity:0; transform: translateY(4px) } to { opacity:1; transform:none } } .admin-msg-item { animation: admin-row-in 400ms ease both; }`.

**Verificacao:** inbox abre em 2 panes; filtros sao pill no header; selecionar mensagem auto-marca lida; header tem icon buttons Eye/Trash a direita; draft abre inline (nao modal) com textarea body-only.

---

### Fase 6 — Hero + About (editores i18n)

**Arquivos:**

- `src/presentation/components/admin/hero/HeroForm.tsx`
- `src/presentation/components/admin/about/AboutForm.tsx`
- `src/app/[locale]/admin/(protected)/hero/page.tsx`
- `src/app/[locale]/admin/(protected)/about/page.tsx`
- `src/presentation/components/admin/forms/forms.css`
- `src/presentation/lib/i18n/messages/{en,pt,es}.json`

**Tasks:**

1. **Decisao de produto sobre i18n:** manter greeting i18n (upgrade arquitetural) mas documentar divergencia em `admin.hero.notes`. Manter zod validation client+server.

2. **Padronizar estrutura page+form:** decidir um padrao unico. Recomendado: `page.tsx` renderiza `PageHead + Card > Form`, form contem apenas rows + `.admin-form-foot`.

3. **HeroForm:** envolver cada row em:

   ```tsx
   <div className="admin-form-row">
     <div className="admin-form-row-label-col">
       {label}
       <div className="help">{helpText}</div>
     </div>
     <div className="admin-form-row-field">{/* LangTabs se i18n + Input/Textarea */}</div>
   </div>
   ```

   - LangTabs movem para dentro do segundo cell, ACIMA do input (margin-bottom 12px).
   - Help texts: "Script word + label shown above the name.", "Displayed stacked on the hero.", "Sentence under the name. Per language.", "Short editorial line (right column).", "Green-dot status badge.".

4. **HeroForm Availability row** unificada: Toggle + status text + (available ? grid 3cols : null) tudo dentro do segundo cell de um unico `.admin-form-row`. Esconder availabilityPre/A/B quando `!available`.

5. **AboutForm:**
   - PageHead title `About section`, lead `Personal bio. Edit each language independently.`.
   - Remover sufixo ` · LOCALE` dos labels.
   - Body textarea `rows={5}` (era 8).
   - Currently virar `<Textarea rows={3}>` (era Input).
   - Profile facts envolver em `.admin-form-row` com label-col "Profile facts" + help "Static facts shown on the sidebar." + grid 3 cols com role/location/years.
   - AI buttons (Improve + Translate) ficam dentro do row de Body, ABAIXO do textarea.

6. **HeroForm form-foot:**
   - Reset disabled quando `!formState.isDirty`.
   - Save com icon `<Save/>` e disabled quando `!isDirty`.
   - Toasts: `{ kind: 'success', title: t('saved'), message: t('savedMessage') }` para Hero ("Changes are live on your portfolio.") e About ("Your bio is updated.").
   - Remover border-top do `.admin-form-foot`.

7. **i18n messages** adicionar:
   - `admin.hero.help.{greeting,name,subtitle,tagline,availability}`.
   - `admin.hero.{saved,savedMessage}`.
   - `admin.about.{saved,savedMessage}`.

**Verificacao:** abrir /admin/hero e /admin/about; labels esquerda em capa normal (nao uppercase); LangTabs acima do input; help text visivel; Reset/Save desabilitam corretamente.

---

### Fase 7 — Projects (lista, modal, gallery)

**Arquivos:**

- `src/presentation/components/admin/projects/ProjectsView.tsx`
- `src/presentation/components/admin/projects/ProjectModal.tsx`
- `src/presentation/components/admin/projects/ProjectForm.tsx`
- `src/presentation/components/admin/projects/GalleryEditor.tsx`
- `src/presentation/components/admin/projects/projects.css`
- `src/app/[locale]/admin/(protected)/projects/page.tsx`
- `src/app/[locale]/admin/(protected)/projects/new/page.tsx`
- `src/app/[locale]/admin/(protected)/projects/[id]/page.tsx`
- `src/application/use-cases/projects/*Project.ts`
- `prisma/schema.prisma` (se remover slug/visible)

**Tasks:**

1. **Toolbar removido:** apagar search + tabs visibility. Mover Grid/Table toggle e "+ New project" para PageHead actions.

2. **Toggle Grid|Table** virar segmented pill com Buttons text "Grid"/"Table":

   ```tsx
   <div className="admin-projects-view-toggle">
     <Button
       size="sm"
       variant={view === "grid" ? "primary" : "ghost"}
       onClick={() => setView("grid")}
     >
       Grid
     </Button>
     <Button
       size="sm"
       variant={view === "table" ? "primary" : "ghost"}
       onClick={() => setView("table")}
     >
       Table
     </Button>
   </div>
   ```

   CSS wrapper bg/border/radius 8/padding 2.

3. **ProjectForm refatorado para single-column form-grid:**
   - Remover Slug input (auto-derivar no server actions).
   - Remover Visible toggle.
   - Trocar Pill Select por Input free-text com placeholder "FLAGSHIP".
   - Collapse `url`/`liveUrl` em UM unico `url` field; renderizar "Live link" Input apenas quando `watch('deployed')===true`.
   - Description virar SINGLE textarea (rows=4) — manter i18n se for decisao de produto, mas remover obrigatoriedade triple.
   - Ordem: Name → URL → Deployed? → Live link (conditional) → Description (+ AI Improve/Generate inline) → Tags (+ AI Suggest inline) → Badge → Images.
   - Cada row vira `.admin-form-row` com label-col.

4. **AI buttons inline** (nao em row separado):
   - Sob Description: `<AIButton size='sm' label='Improve' onRun={runImprove} />` + `<AIButton size='sm' label='Generate' onRun={runGenerateDescription} />`.
   - Sob Tags: `<AIButton size='sm' label='Suggest tags' onRun={runSuggestTags} />`.
   - Criar `/api/ai/improve-text` se nao existir.

5. **ProjectModal footer:** primary button label = "Save" (nao "Save changes" / "Create project") com icon `<Save/>`. Delete danger a esquerda + spacer + Cancel ghost + Save primary.

6. **Grid card refeito:**
   - Border-radius 12 (era 10).
   - Thumb aspect 16/10 com `linear-gradient(135deg, #1a1a22, #0e0e12)`.
   - Hover translateY(-2px) + border-color soft.
   - Inline ` · DRAFT` no h4 em 10px uppercase 0.08em dim weight 500 (nao chip amarelo).
   - URL line mono 11px dim ellipsis.
   - Tags slice(0,3) com `.tag-chip` (radius 9999, padding 3px 8px, border-soft, surface-2, font 10px 0.06em).
   - Chip extra verde quando images.length>0: bg `rgba(48,209,88,0.10)`, border `rgba(48,209,88,0.3)`, color `var(--admin-green)`, texto "{N} img".
   - Card-actions floating top:10 right:10 opacity 0→1 hover, Edit + Trash IconButtons em backdrop blur rgba(0,0,0,0.7).
   - **Remover** `.reorder` row do grid card.

7. **Table view** colunas: # (50w) | Project (name + DRAFT + description ellipsis) | URL | Tags | Imgs | Order (Up/Down) | actions (130w). Row-actions opacity 0 reveal on hover.

8. **GalleryEditor:**
   - Grid: `repeat(auto-fill, minmax(120px, 1fr))` gap 10, margin-top 12.
   - Tile aspect 16/10, radius 10, bg `var(--admin-bg-2)`, border 1px.
   - **Cover badge bottom-left** (era top-left): `bottom:6; left:6; bg: rgba(0,0,0,0.7); color:#fff; font-size:9px; letter-spacing:0.12em; text-transform:uppercase; padding: 3px 6px; border-radius: 4px;`.
   - **ic-actions top-right cluster** (sem scrim full-tile): 3 botoes 24x24 radius 6 bg rgba(0,0,0,0.7) blur 6 — Move left (ChevronUp -90deg), Move right (ChevronDown -90deg), Trash. Opacidade 0→1 no hover do tile.
   - **Remover** botao Set Cover star (primeira imagem sempre eh cover).
   - **Upload tile:** 1.5px dashed border-soft (era 2px strong), Plus icon 20px + label "Add image". Hover border-strong + bg surface + text white.
   - **Drag-drop file upload** onto upload tile: `onDragOver` + `onDrop` lendo `dataTransfer.files`.
   - **Bug fix className:** trocar template string sem espacos por `[..., dragIndex===index && 'is-dragging', overIndex===index && 'is-drop-target'].filter(Boolean).join(' ')`.
   - **Bottom hint:** `<p className="admin-field-hint" style={{ marginTop: 8 }}>First image is the cover. Drag-drop multiple files at once. PNG / JPG / WebP.</p>`.

9. **Schema decisao:** se remover slug/visible exige migration. Recomendado **manter colunas no DB** mas nao expor no formulario (slug auto-gerado, visible default true). Evita risco de migration destrutiva.

**Verificacao:** /admin/projects mostra toggle no header, grid card com DRAFT inline cinza, hover revela edit/trash; modal abre com form single-column; gallery tile mostra Cover badge bottom-left + 3 botoes top-right; drag-drop files no Add tile faz upload.

---

### Fase 8 — CV + Social + Skills

**Arquivos:**

- `src/app/[locale]/admin/(protected)/cv/page.tsx`
- `src/presentation/components/admin/cv/CVManager.tsx` [novo]
- `src/presentation/components/admin/cv/CVOverview.tsx` [novo]
- `src/presentation/components/admin/cv/CVCurrentBar.tsx` [novo]
- `src/presentation/components/admin/cv/CVDropzone.tsx` [extrair de CVSlot]
- `src/presentation/components/admin/cv/CVTips.tsx`
- `src/presentation/components/admin/cv/cv.css`
- `src/presentation/components/admin/social/SocialView.tsx`
- `src/presentation/components/admin/social/SocialTable.tsx` [novo]
- `src/presentation/components/admin/social/SocialForm.tsx`
- `src/presentation/components/admin/social/SocialModal.tsx`
- `src/app/[locale]/admin/(protected)/social/page.tsx`
- `src/presentation/components/admin/skills/skills.css`
- `src/presentation/components/admin/skills/SkillCategoryCard.tsx`

**Tasks:**

**CV:**

1. Criar `CVManager` (client) com `useState<Locale>` active.
2. Renderizar: LangTabs page-action + CVOverview (3 cards clickaveis) + CVCurrentBar (se uploaded) + CVDropzone unico grande.
3. Cards overview: 32x32 PDF ficon (red bg quando uploaded, surface-2 quando empty) + locale label uppercase + filename ou "Not uploaded".
4. CVCurrentBar: 40x40 red PDF ficon + filename + "X KB · LNG version · uploaded date" + Download (ghost) + Remove (danger).
5. Dropzone: 1.5px dashed border-soft, bg `var(--admin-bg-2)`, padding 36, icon container 44x44 surface circular, label "Upload LNG CV" / "Replace LNG CV", sub "Drag a PDF here, or click to select. Max 10 MB.".
6. **MAX_BYTES = 10 \* 1024 \* 1024** (era 5).
7. CVTips: 3 `<li>` explicitos com `<code class="admin-cv-tips-code">matheus-batista-cv-en.pdf</code>` no terceiro. i18n keys `admin.cv.tips.{one,two,three}` usando `t.rich`.
8. Lead: "Upload one CV per language. The portfolio download button uses the current language.".

**Social:**

1. Remover drag-reorder completo:
   - Deletar GripVertical column, drag handlers, actions.reorder do UI (manter server action endpoint sem chamada).
2. Refatorar para `<table class="admin-tbl">` em Card padding 0:
   - Cols: 60w icon · Name · Handle/URL · 80w Visible · 120w actions.
   - Row: `<Icon size={18}/>` (text-mute), `<strong>{name}</strong>`, handle/url mono 12px dim, Toggle, IconButtons edit (ghost) + trash (danger).
3. SocialForm: 4 campos apenas — Network `<select>` com opcoes (GitHub, LinkedIn, Behance, Email, X / Twitter, Instagram, Dribbble, YouTube, Other), URL, Handle (+ help "Display string (e.g. @matheus or your@email.com)."), Visible Toggle.
4. Remover field Name (Network IS Name) e iconKey Select (derivar no server).
5. Mover "New link" button do toolbar para PageHead actions.
6. SocialModal footer: Delete danger esquerda + spacer + Cancel ghost + Save primary quando editing.

**Skills:**

1. CSS layout grid 2 cols:
   ```css
   .admin-skills-admin {
     display: grid;
     grid-template-columns: repeat(2, 1fr);
     gap: 16px;
   }
   @media (max-width: 880px) {
     .admin-skills-admin {
       grid-template-columns: 1fr;
       gap: 12px;
     }
   }
   ```
2. SkillChip:
   ```css
   .admin-skill-admin-chip {
     border-radius: 8px;
     border: 1px solid var(--admin-border-soft);
     padding: 6px 10px 6px 6px;
     font-size: 12.5px;
     background: var(--admin-surface-2);
     transition:
       transform 200ms,
       border-color 180ms,
       background 180ms;
   }
   .admin-skill-admin-chip:hover {
     transform: translateY(-2px);
     border-color: var(--admin-border-strong);
   }
   .admin-skill-admin-chip .sw {
     width: 24px;
     height: 24px;
     min-width: 24px;
     padding: 0;
     border-radius: 6px;
     font-size: 10px;
     font-weight: 700;
     color: #fff;
     overflow: hidden;
   }
   ```
3. SkillCategoryCard h3 com Button ghost sm "+ Add" (texto + Plus icon), nao IconButton.
4. Validar ColorField (60x60 preview radius 14, mono 700 11px com key text).

**Verificacao:** /admin/cv com LangTabs e dropzone unico; /admin/social mostra tabela sem drag; /admin/skills em 2 colunas com chips retangulares.

---

### Fase 9 — Settings + FX globais + low-priority polish

**Arquivos:**

- `src/app/[locale]/admin/(protected)/settings/SettingsForm.tsx`
- `src/app/[locale]/admin/(protected)/settings/actions.ts`
- `src/presentation/components/admin/settings/settings.css`
- `src/presentation/app/admin.css`
- `src/presentation/components/admin/shell/AdminSidebar.tsx`
- Diversos componentes para low-priority fixes restantes.

**Tasks:**

1. **Settings minimal:** remover SEO Card, Features Card, Contact Card de SettingsForm. Manter apenas Preferences (default language pt/**en**/es — ordem PT primeiro) + Danger Zone.
2. **Save em PageHead actions** (nao sticky foot).
3. **Danger zone border-color** `rgba(239,68,68,0.2)` (era 0.4).
4. **Reset button** variant `danger` (outline), nao `danger-solid`.
5. **Considerar separar SEO** para `/admin/seo` em PR futuro (fora deste branch).

**FX globais (admin.css):**

6. **Row-in animation** para tables/lists:

   ```css
   @keyframes admin-row-in {
     from {
       opacity: 0;
       transform: translateY(5px);
     }
     to {
       opacity: 1;
       transform: none;
     }
   }
   .admin-tbl tbody tr,
   .admin-list-row,
   .admin-msg-item,
   .admin-project-card {
     animation: admin-row-in 420ms ease both;
   }
   .admin-tbl tbody tr:nth-child(1) {
     animation-delay: 0.02s;
   }
   .admin-tbl tbody tr:nth-child(2) {
     animation-delay: 0.06s;
   }
   .admin-tbl tbody tr:nth-child(3) {
     animation-delay: 0.1s;
   }
   .admin-tbl tbody tr:nth-child(4) {
     animation-delay: 0.14s;
   }
   .admin-tbl tbody tr:nth-child(5) {
     animation-delay: 0.18s;
   }
   .admin-tbl tbody tr:nth-child(n + 6) {
     animation-delay: 0.22s;
   }
   ```

7. **Card-in animation** para projects grid:

   ```css
   @keyframes admin-card-in {
     from {
       opacity: 0;
       transform: translateY(14px) scale(0.99);
     }
     to {
       opacity: 1;
       transform: translateY(0) scale(1);
     }
   }
   .admin-projects-grid > * {
     animation: admin-card-in 480ms var(--ease-out-soft) both;
   }
   .admin-projects-grid > *:nth-child(1) {
     animation-delay: 0.04s;
   }
   .admin-projects-grid > *:nth-child(2) {
     animation-delay: 0.1s;
   }
   .admin-projects-grid > *:nth-child(3) {
     animation-delay: 0.16s;
   }
   .admin-projects-grid > *:nth-child(4) {
     animation-delay: 0.22s;
   }
   .admin-projects-grid > *:nth-child(n + 5) {
     animation-delay: 0.28s;
   }
   ```

8. **Sidebar icon hover micro-interaction:**

   ```css
   .admin-sidebar-link svg {
     transition: transform 280ms var(--ease-out-soft);
   }
   .admin-sidebar-link:hover svg {
     transform: scale(1.12) rotate(-3deg);
   }
   .admin-sidebar-link[data-active="true"] svg {
     transform: scale(1.05);
   }
   ```

9. **Remover** `.admin-content { animation: admin-page-in }` (original nao tem entry animation no content).

10. **Low-priority polish (lista flat):**
    - Stat label letter-spacing 0.02em sem uppercase.
    - Stat card gap 6px (era 10).
    - Active list item bg `var(--admin-surface-2)` sem border-left blue.
    - Token --admin-text/mute/dim canonicos (cobertos em Fase 1).
    - Toast default kind `success` (coberto em Fase 1).
    - Breadcrumb sempre mostra "Dashboard" no root (coberto em Fase 2).
    - Saved toast messages (coberto em Fase 6).
    - Form-foot sem border-top (coberto em Fase 6).
    - Stat card padding-gap (coberto em Fase 4).
    - Mobile breakpoint 980px (coberto em Fase 2).

**Verificacao final:** rodar `pnpm typecheck && pnpm lint && pnpm build`; abrir cada pagina admin e validar contra os screenshots originais (admin-login, 01-admin, 02-admin-dash, admin-ai-draft, logs/logs2/logs3).

---

## 3. Riscos

### Producao / dados

- **Remover feature archived no Inbox:** decidir se dropar coluna `Message.archived` no Prisma (migration destrutiva) ou apenas esconder na UI. **Recomendado:** manter coluna, esconder UI. Reduz risco.
- **Remover slug/visible em Project:** mesma logica — manter colunas, esconder do form, auto-derivar slug no server. Evita migration.
- **Remover SEO/Features/Contact em Settings:** se ja existem dados persistidos, manter no DB e remover apenas da UI (esconder cards). Considerar mover para `/admin/seo` em PR futuro.
- **Rota `/admin/logs` nova:** sem backend de logs real ainda. Seed sintetico client-side aceitavel para esta fase; nao expor API publica.

### Visual / UX

- **Mudanca de tokens `--admin-text` etc.** afeta TODO o admin. Validar contraste e legibilidade pos-mudanca (especialmente dim #5a5a62 vs #6e6e73 atual).
- **Reorder drop em Social:** se usuarios ja personalizaram ordem, decidir se preservar ordem ou voltar para criacao. Recomendado manter campo `order` no schema, usar criacao desc por default.
- **Form-row grid 200px / 1fr:** em viewports estreitos (<880px) precisa collapse para 1fr — garantir media query funciona.

### Outros

- **Mover signin CSS de globals.css para admin.css** precisa garantir que admin.css esta carregado em `/admin/signin` (atualmente o layout protected importa, mas signin nao esta no group protected).
- **AmbientBackground em signin** precisa ser SSR-safe (component ja existe, validar).
- **i18n strings novas** precisam de versao en/pt/es — adicionar simultaneamente nos 3 arquivos para evitar fallback.
- **Bug do className em GalleryEditor** ja esta em producao — items de modifier nunca aplicaram, entao a regressao visual eh positiva, nao negativa.

### Nao-riscos (intencional)

- Manter zod client-side validation no Hero/About/Projects (upgrade aceitavel sobre original).
- Manter Description i18n em Projects (decisao arquitetural).
- Demo button NAO portar no signin (backdoor em NextAuth real).

---

## 4. Estimativa de commits

**16 commits** distribuidos pelas 9 fases:

| Fase                     | Commits | Conventional Commit                                                                                                                                                                             |
| ------------------------ | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Foundation            | 3       | `fix(admin): restore canonical --admin-* tokens` / `fix(admin): rewrite Confirm + Toast with correct CSS` / `fix(admin): correct AIButton gradient + form-row grid + toggle geometry`           |
| 2. Shell                 | 2       | `fix(admin/shell): correct sidebar sections, brand, footer, mobile breakpoint` / `fix(admin/shell): topbar breadcrumb chevron, View portfolio, kbd glyph`                                       |
| 3. Signin + AccessDenied | 2       | `feat(admin/signin): port AmbientBackground + AdminGlow + mark + card-rise animation` / `fix(admin/access-denied): rebuild with reusable signin-card classes`                                   |
| 4. Dashboard + Logs      | 2       | `feat(admin/dashboard): sparklines, CountUp, table-based RecentMessages, View portfolio action` / `feat(admin/logs): new /admin/logs route with severity strip, live tail, filters`             |
| 5. Inbox                 | 2       | `fix(admin/inbox): collapse to 2-pane layout, drop archived, auto-mark-read, header icon actions` / `fix(admin/inbox): inline AI draft reply panel (body-only) replacing modal`                 |
| 6. Hero + About          | 1       | `fix(admin/hero,about): apply 200px/1fr form-row grid, inline LangTabs, help texts`                                                                                                             |
| 7. Projects              | 2       | `fix(admin/projects): single-column form, free-text badge, inline AI buttons, unified url field` / `fix(admin/projects): grid card + table + gallery (cover bottom-left, top-right ic-actions)` |
| 8. CV + Social + Skills  | 1       | `fix(admin/cv,social,skills): port single-language CV manager, tabular social, 2-col skills grid`                                                                                               |
| 9. Settings + FX         | 1       | `fix(admin/settings,fx): minimal Settings + global stagger/row-in animations + sidebar icon hover`                                                                                              |

**Total: 16 commits.** Cada commit fica autocontido (typecheck + lint passam isoladamente), facilitando revisao e revert pontual se necessario.
