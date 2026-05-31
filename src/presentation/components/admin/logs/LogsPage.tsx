"use client";

// TODO: ligar a backend de logs real
// Por enquanto os logs sao gerados sinteticamente no client.
// Quando houver `/api/logs`, trocar o seed + live tail por SWR/streaming.

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import {
  Check,
  Copy,
  Database,
  Globe,
  Mail,
  Pause,
  Play,
  Search,
  Server,
  Shield,
  Sparkles,
  X,
} from "lucide-react";

import "./logs.css";

// ---------- types ------------------------------------------------

type LogLevel = "error" | "warn" | "info" | "debug";
type LogSource = "api" | "database" | "auth" | "system" | "ai" | "email";

type LogDetail = {
  method?: string;
  path?: string;
  status?: number;
  ms?: number;
  q?: string;
  rows?: number;
  user?: string;
  provider?: string;
  to?: string;
  meta?: string;
  model?: string;
  tokens?: number;
};

interface LogEntry {
  id: string;
  ts: string;
  source: LogSource;
  level: LogLevel;
  msg: string;
  detail: LogDetail;
  reqId: string;
  ip?: string;
  stack?: string;
}

// ---------- static metadata -------------------------------------

const LOG_SOURCES: LogSource[] = ["api", "database", "auth", "system", "ai", "email"];

const SOURCE_META: Record<LogSource, { color: string; Icon: typeof Globe }> = {
  api: { color: "#3b82f6", Icon: Globe },
  database: { color: "#a855f7", Icon: Database },
  auth: { color: "#22c55e", Icon: Shield },
  system: { color: "#8e8e95", Icon: Server },
  ai: { color: "#d97757", Icon: Sparkles },
  email: { color: "#f5b800", Icon: Mail },
};

const LEVEL_META: Record<LogLevel, { label: string; short: string; color: string }> = {
  error: { label: "ERROR", short: "ERR", color: "#ef4444" },
  warn: { label: "WARN", short: "WAR", color: "#f5b800" },
  info: { label: "INFO", short: "INF", color: "#3b82f6" },
  debug: { label: "DEBUG", short: "DBG", color: "#8e8e95" },
};

// ---------- deterministic sample pools --------------------------

type SampleRow = { level: LogLevel; msg: string } & LogDetail;

const SAMPLE: Record<LogSource, SampleRow[]> = {
  api: [
    {
      level: "info",
      method: "GET",
      path: "/api/projects",
      status: 200,
      ms: 42,
      msg: "Request completed",
    },
    {
      level: "info",
      method: "GET",
      path: "/api/projects/p-linkedpay",
      status: 200,
      ms: 31,
      msg: "Request completed",
    },
    {
      level: "info",
      method: "POST",
      path: "/api/contact",
      status: 201,
      ms: 88,
      msg: "Message created",
    },
    {
      level: "info",
      method: "GET",
      path: "/api/cv?lang=pt",
      status: 200,
      ms: 17,
      msg: "CV metadata served",
    },
    {
      level: "warn",
      method: "GET",
      path: "/api/projects",
      status: 429,
      ms: 5,
      msg: "Rate limit reached for IP 187.54.x.x",
    },
    {
      level: "error",
      method: "POST",
      path: "/api/contact",
      status: 500,
      ms: 1204,
      msg: "Unhandled exception while sending email",
    },
    {
      level: "warn",
      method: "GET",
      path: "/api/skills",
      status: 304,
      ms: 8,
      msg: "Not modified (ETag hit)",
    },
    {
      level: "error",
      method: "GET",
      path: "/api/projects/x99",
      status: 404,
      ms: 12,
      msg: "Project not found",
    },
    {
      level: "info",
      method: "PATCH",
      path: "/api/about",
      status: 200,
      ms: 64,
      msg: "About section updated",
    },
  ],
  database: [
    {
      level: "debug",
      q: 'SELECT * FROM projects WHERE deployed = true ORDER BY "order" ASC',
      ms: 6,
      rows: 5,
      msg: "Query OK",
    },
    {
      level: "debug",
      q: "SELECT * FROM messages WHERE read = false",
      ms: 4,
      rows: 1,
      msg: "Query OK",
    },
    {
      level: "info",
      q: "INSERT INTO messages (from, email, subject, body) VALUES ($1,$2,$3,$4)",
      ms: 11,
      rows: 1,
      msg: "Insert committed",
    },
    {
      level: "warn",
      q: "SELECT * FROM projects p LEFT JOIN images i ON i.project_id = p.id",
      ms: 842,
      rows: 137,
      msg: "Slow query (>500ms) — missing index on images.project_id",
    },
    {
      level: "error",
      q: "UPDATE cv SET file = $1 WHERE lang = $2",
      ms: 30012,
      rows: 0,
      msg: "Connection pool timeout after 30000ms",
    },
    {
      level: "debug",
      q: "SELECT count(*) FROM visits WHERE day = CURRENT_DATE",
      ms: 9,
      rows: 1,
      msg: "Query OK",
    },
    { level: "info", q: "VACUUM ANALYZE messages", ms: 156, rows: 0, msg: "Maintenance complete" },
  ],
  auth: [
    {
      level: "info",
      msg: "OAuth login success",
      user: "matheus.sbatista@outlook.com",
      provider: "google",
    },
    {
      level: "warn",
      msg: "Access denied — non-owner account",
      user: "visitor@example.com",
      provider: "google",
    },
    { level: "info", msg: "Session refreshed", user: "matheus.sbatista@outlook.com" },
    { level: "warn", msg: "Expired token rejected", user: "matheus.sbatista@outlook.com" },
    {
      level: "error",
      msg: "OAuth callback failed — state mismatch (possible CSRF)",
      provider: "google",
    },
    { level: "info", msg: "Sign-out", user: "matheus.sbatista@outlook.com" },
  ],
  system: [
    { level: "info", msg: "Deployment succeeded", meta: "vercel · build #4821 · 38s" },
    { level: "info", msg: "Edge cache purged", meta: "region gru1" },
    { level: "warn", msg: "Memory usage at 86%", meta: "lambda /api/contact" },
    { level: "debug", msg: "Cron tick: cleanup-drafts", meta: "0 rows affected" },
    { level: "error", msg: "Function cold start exceeded 3s budget", meta: "/api/projects · 3.4s" },
    { level: "info", msg: "Health check passed", meta: "/healthz · 200" },
  ],
  ai: [
    { level: "info", msg: "Persona rewrite", model: "gemini-2.5-flash", tokens: 412, ms: 980 },
    {
      level: "info",
      msg: "Semantic search ranking",
      model: "gemini-2.5-flash",
      tokens: 286,
      ms: 640,
    },
    {
      level: "info",
      msg: "Assistant reply (generative UI)",
      model: "gemini-2.5-flash",
      tokens: 530,
      ms: 1120,
    },
    {
      level: "warn",
      msg: "Response truncated at max_tokens",
      model: "gemini-2.5-flash",
      tokens: 1024,
      ms: 1500,
    },
    {
      level: "error",
      msg: "AI request failed — upstream 529 overloaded",
      model: "gemini-2.5-flash",
      tokens: 0,
      ms: 240,
    },
    { level: "debug", msg: "Cache hit — skipped model call", model: "cache", tokens: 0, ms: 1 },
  ],
  email: [
    { level: "info", msg: "Auto-reply queued", to: "anna@coreflow.io" },
    { level: "info", msg: "Delivery confirmed", to: "pedro.lima@bytemark.com.br" },
    { level: "error", msg: "SMTP 550 — mailbox unavailable", to: "typo@@gmail.com" },
    { level: "warn", msg: "Soft bounce — retrying in 5m", to: "j.reyes@studio-aki.com" },
  ],
};

const STACKS: Record<string, string> = {
  contact: `TypeError: Cannot read properties of undefined (reading 'send')
    at sendMail (/var/task/lib/mailer.js:42:18)
    at async POST (/var/task/app/api/contact/route.js:28:5)
    at async /var/task/node_modules/next/server.js:1190:21`,
  db: `SequelizeConnectionAcquireTimeoutError: Operation timeout
    at ConnectionManager._acquire (/var/task/node_modules/sequelize/lib/pool.js:118:23)
    at async CvRepository.update (/var/task/lib/repos/cv.js:51:7)`,
  ai: `APIError: 529 {"type":"overloaded_error","message":"Overloaded"}
    at GoogleGenAI.request (/var/task/node_modules/@ai-sdk/google/core.js:301:13)
    at async aiComplete (/var/task/lib/ai.js:64:18)`,
  oauth: `AuthError: state_mismatch
    at verifyState (/var/task/lib/auth/oauth.js:88:11)
    at async callback (/var/task/app/api/auth/callback/route.js:19:5)`,
};

const IPS = ["187.54.32.10", "201.17.8.4", "66.249.66.1", "127.0.0.1"];

// ---------- deterministic helpers (no Math.random) --------------

// Build a 32-char base36 id seeded from a number. Deterministic.
function detSlug(seed: number): string {
  let s = (seed * 2654435761) >>> 0;
  let out = "";
  for (let i = 0; i < 8; i += 1) {
    out += (s % 36).toString(36);
    s = Math.floor(s / 36) + ((seed + i) % 31);
  }
  return out;
}

function buildEntry(i: number, ts: Date, idCounter: number): LogEntry {
  const source = LOG_SOURCES[i % LOG_SOURCES.length] as LogSource;
  const pool = SAMPLE[source];
  const sampleIdx = (i * 3) % pool.length;
  const sample = pool[sampleIdx] as SampleRow;
  const ip = IPS[(i * 5) % IPS.length] as string;

  const detail: LogDetail = { ...sample };
  delete (detail as { msg?: string }).msg;
  delete (detail as { level?: LogLevel }).level;

  const entry: LogEntry = {
    id: `log_${idCounter}`,
    ts: ts.toISOString(),
    source,
    level: sample.level,
    msg: sample.msg,
    detail,
    reqId: `req_${detSlug(idCounter)}`,
    ip,
  };

  if (sample.level === "error") {
    if (source === "api" && sample.path === "/api/contact") entry.stack = STACKS.contact;
    else if (source === "database") entry.stack = STACKS.db;
    else if (source === "ai") entry.stack = STACKS.ai;
    else if (source === "auth") entry.stack = STACKS.oauth;
  }

  return entry;
}

const SEED_COUNT = 30;

// Seed 30 entries with timestamps stepping backwards in deterministic offsets.
function seedEntries(now: number): LogEntry[] {
  const out: LogEntry[] = [];
  for (let i = 0; i < SEED_COUNT; i += 1) {
    // step: 18s + variable (deterministic) spread up to ~3min between entries
    const offsetSec = 18 * (i + 1) + ((i * 13) % 47);
    const ts = new Date(now - offsetSec * 1000);
    out.push(buildEntry(i, ts, i + 1));
  }
  return out;
}

// ---------- formatters ------------------------------------------

function relTime(iso: string, nowMs: number): string {
  const d = new Date(iso).getTime();
  const s = Math.floor((nowMs - d) / 1000);
  if (s < 5) return "just now";
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

function clockTime(iso: string): string {
  const d = new Date(iso);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

// ---------- component ------------------------------------------

export function LogsPage() {
  const t = useTranslations("admin.logs");

  // Stable seed: capture the initial mount time once so SSR/CSR match (we are
  // already client-only, but the seed must not regenerate on re-render).
  const [logs, setLogs] = useState<LogEntry[]>(() => seedEntries(Date.now()));
  const [live, setLive] = useState(true);
  const [level, setLevel] = useState<"all" | LogLevel>("all");
  const [source, setSource] = useState<"all" | LogSource>("all");
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [nowMs, setNowMs] = useState<number>(() => Date.now());

  const idCounterRef = useRef(SEED_COUNT);
  const liveIdxRef = useRef(SEED_COUNT);

  // Live tail — prepend a new deterministic entry every 2.2s.
  useEffect(() => {
    if (!live) return;
    const iv = setInterval(() => {
      idCounterRef.current += 1;
      liveIdxRef.current += 1;
      const next = buildEntry(liveIdxRef.current, new Date(), idCounterRef.current);
      setLogs((prev) => [next, ...prev].slice(0, 500));
    }, 2200);
    return () => clearInterval(iv);
  }, [live]);

  // Keep relative timestamps fresh.
  useEffect(() => {
    const iv = setInterval(() => setNowMs(Date.now()), 30000);
    return () => clearInterval(iv);
  }, []);

  const counts = useMemo(() => {
    const c: Record<LogLevel, number> = { error: 0, warn: 0, info: 0, debug: 0 };
    for (const l of logs) c[l.level] += 1;
    return c;
  }, [logs]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return logs.filter((l) => {
      if (level !== "all" && l.level !== level) return false;
      if (source !== "all" && l.source !== source) return false;
      if (q) {
        const hay = `${l.msg} ${l.source} ${JSON.stringify(l.detail)} ${l.reqId}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [logs, level, source, query]);

  return (
    <div className="admin-logs">
      {/* severity strip */}
      <div className="log-stats">
        {(["error", "warn", "info", "debug"] as LogLevel[]).map((lv) => (
          <button
            key={lv}
            type="button"
            className={`log-stat ${lv}${level === lv ? "on" : ""}`}
            onClick={() => setLevel(level === lv ? "all" : lv)}
          >
            <span className="ls-dot" />
            <span className="ls-n">{counts[lv]}</span>
            <span className="ls-l">{LEVEL_META[lv].label}</span>
          </button>
        ))}

        <div className="log-live-ind" data-on={live}>
          <span className="lli-dot" />
          {live ? t("playing") : t("paused")}
        </div>

        <div className="log-toolbar">
          <button
            type="button"
            className={`log-toggle${live ? "on" : ""}`}
            onClick={() => setLive((v) => !v)}
            aria-pressed={live}
          >
            {live ? <Pause /> : <Play />}
            {t("liveTail")}
          </button>
        </div>
      </div>

      {/* controls */}
      <div className="log-controls">
        <div className="log-search">
          <Search />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("search")}
          />
          {query && (
            <button type="button" onClick={() => setQuery("")} aria-label={t("clear")}>
              <X />
            </button>
          )}
        </div>

        <div className="log-selects">
          <select
            className="log-select"
            value={source}
            onChange={(e) => setSource(e.target.value as "all" | LogSource)}
            aria-label={t("sources.all")}
          >
            <option value="all">{t("sources.all")}</option>
            {LOG_SOURCES.map((s) => (
              <option key={s} value={s}>
                {t(`sources.${s}`)}
              </option>
            ))}
          </select>

          <select
            className="log-select"
            value={level}
            onChange={(e) => setLevel(e.target.value as "all" | LogLevel)}
            aria-label={t("levels.all")}
          >
            <option value="all">{t("levels.all")}</option>
            <option value="error">{t("levels.error")}</option>
            <option value="warn">{t("levels.warn")}</option>
            <option value="info">{t("levels.info")}</option>
            <option value="debug">{t("levels.debug")}</option>
          </select>
        </div>
      </div>

      {/* console */}
      <div className="log-console">
        {filtered.length === 0 ? (
          <div className="log-empty">
            <span>{t("noResults")}</span>
          </div>
        ) : (
          filtered.map((l) => (
            <LogRow
              key={l.id}
              entry={l}
              nowMs={nowMs}
              open={openId === l.id}
              onToggle={() => setOpenId(openId === l.id ? null : l.id)}
              copyLabel={t("copyJson")}
              copiedLabel={t("copied")}
            />
          ))
        )}
      </div>
    </div>
  );
}

// ---------- row -------------------------------------------------

function LogRow({
  entry,
  nowMs,
  open,
  onToggle,
  copyLabel,
  copiedLabel,
}: {
  entry: LogEntry;
  nowMs: number;
  open: boolean;
  onToggle: () => void;
  copyLabel: string;
  copiedLabel: string;
}) {
  const lm = LEVEL_META[entry.level];
  const sm = SOURCE_META[entry.source];
  const SIcon = sm.Icon;
  const d = entry.detail;

  const [copied, setCopied] = useState(false);

  const copy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(JSON.stringify(entry, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard may be blocked */
    }
  };

  return (
    <div className={`log-row ${entry.level}${open ? "open" : ""}`}>
      <div
        className="log-line"
        onClick={onToggle}
        role="button"
        tabIndex={0}
        aria-expanded={open}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onToggle();
          }
        }}
      >
        <span className="log-time">{clockTime(entry.ts)}</span>

        <span className={`log-level ${entry.level}`}>{lm.short}</span>

        <span className="log-src">
          <SIcon style={{ color: sm.color }} />
          {entry.source}
        </span>

        <span className="log-msg">
          {d.method && <span className="log-method">{d.method}</span>}
          {d.path && <span className="log-path">{d.path}</span>}
          {typeof d.status !== "undefined" && (
            <span className="log-status" data-ok={d.status < 400}>
              {d.status}
            </span>
          )}
          {entry.msg}
        </span>

        {typeof d.ms !== "undefined" && (
          <span className={`log-dur${d.ms > 500 ? "slow" : ""}`}>{d.ms}ms</span>
        )}

        <span className="log-rel">{relTime(entry.ts, nowMs)}</span>
      </div>

      {open && (
        <div className="log-detail" onClick={(e) => e.stopPropagation()}>
          <div className="ld-grid">
            <div className="ld-kv">
              <span>timestamp</span>
              <code>{entry.ts}</code>
            </div>
            <div className="ld-kv">
              <span>level</span>
              <code>{lm.label}</code>
            </div>
            <div className="ld-kv">
              <span>source</span>
              <code>{entry.source}</code>
            </div>
            <div className="ld-kv">
              <span>request id</span>
              <code>{entry.reqId}</code>
            </div>
            {entry.ip && (
              <div className="ld-kv">
                <span>ip</span>
                <code>{entry.ip}</code>
              </div>
            )}
            {d.user && (
              <div className="ld-kv">
                <span>user</span>
                <code>{d.user}</code>
              </div>
            )}
            {d.model && (
              <div className="ld-kv">
                <span>model</span>
                <code>{d.model}</code>
              </div>
            )}
            {typeof d.tokens !== "undefined" && (
              <div className="ld-kv">
                <span>tokens</span>
                <code>{d.tokens}</code>
              </div>
            )}
            {typeof d.rows !== "undefined" && (
              <div className="ld-kv">
                <span>rows</span>
                <code>{d.rows}</code>
              </div>
            )}
            {d.to && (
              <div className="ld-kv">
                <span>to</span>
                <code>{d.to}</code>
              </div>
            )}
            {d.meta && (
              <div className="ld-kv">
                <span>meta</span>
                <code>{d.meta}</code>
              </div>
            )}
          </div>

          {d.q && (
            <div className="ld-block">
              <div className="ld-block-h">
                <Database style={{ width: 12, height: 12 }} /> SQL
              </div>
              <pre className="ld-code sql">{d.q}</pre>
            </div>
          )}

          {entry.stack && (
            <div className="ld-block">
              <div className="ld-block-h err">Stack trace</div>
              <pre className="ld-code stack">{entry.stack}</pre>
            </div>
          )}

          <div className="ld-actions">
            <button type="button" className="ld-copy" onClick={copy}>
              {copied ? <Check /> : <Copy />}
              {copied ? copiedLabel : copyLabel}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
