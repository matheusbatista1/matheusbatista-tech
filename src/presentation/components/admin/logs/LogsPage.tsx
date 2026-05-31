"use client";

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
type LogOrigin = "activity" | "ai";

interface LogEntry {
  id: string;
  ts: string;
  source: LogSource;
  level: LogLevel;
  msg: string;
  durationMs?: number;
  statusCode?: number;
  method?: string;
  path?: string;
  requestId?: string;
  ip?: string;
  meta?: Record<string, unknown>;
  origin: LogOrigin;
}

interface LogsResponse {
  entries: LogEntry[];
  total: number;
  hasMore: boolean;
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

const LIVE_REFRESH_MS = 10_000;
const SEARCH_DEBOUNCE_MS = 300;
const FETCH_LIMIT = 50;

export function LogsPage() {
  const t = useTranslations("admin.logs");

  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [live, setLive] = useState(true);
  const [level, setLevel] = useState<"all" | LogLevel>("all");
  const [source, setSource] = useState<"all" | LogSource>("all");
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [nowMs, setNowMs] = useState<number>(() => Date.now());

  const abortRef = useRef<AbortController | null>(null);

  // Debounce search input
  useEffect(() => {
    const id = setTimeout(() => setDebouncedQuery(query), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [query]);

  // Fetch logs whenever filters change OR on live-tail interval
  useEffect(() => {
    const fetchLogs = async () => {
      // Cancel any in-flight request
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (source !== "all") params.set("source", source);
        if (level !== "all") params.set("level", level);
        if (debouncedQuery.trim()) params.set("search", debouncedQuery.trim());
        params.set("limit", String(FETCH_LIMIT));

        const res = await fetch(`/api/admin/logs?${params.toString()}`, {
          signal: controller.signal,
          cache: "no-store",
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: LogsResponse = await res.json();
        if (controller.signal.aborted) return;
        setEntries(data.entries);
        setTotal(data.total);
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        // Swallow other errors silently — list stays as-is
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    fetchLogs();

    if (!live) {
      return () => {
        abortRef.current?.abort();
      };
    }

    const iv = setInterval(fetchLogs, LIVE_REFRESH_MS);
    return () => {
      clearInterval(iv);
      abortRef.current?.abort();
    };
  }, [source, level, debouncedQuery, live]);

  // Keep relative timestamps fresh.
  useEffect(() => {
    const iv = setInterval(() => setNowMs(Date.now()), 30000);
    return () => clearInterval(iv);
  }, []);

  const counts = useMemo(() => {
    const c: Record<LogLevel, number> = { error: 0, warn: 0, info: 0, debug: 0 };
    for (const l of entries) c[l.level] += 1;
    return c;
  }, [entries]);

  const showEmpty = !loading && entries.length === 0;
  const showInitialLoading = loading && entries.length === 0;

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
        {showInitialLoading ? (
          <div className="log-empty">
            <span>Loading...</span>
          </div>
        ) : showEmpty ? (
          <div className="log-empty">
            <span>{t("noResults")}</span>
          </div>
        ) : (
          entries.map((l) => (
            <LogRow
              key={l.id}
              entry={l}
              nowMs={nowMs}
              total={total}
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
  total: number;
  open: boolean;
  onToggle: () => void;
  copyLabel: string;
  copiedLabel: string;
}) {
  const lm = LEVEL_META[entry.level];
  const sm = SOURCE_META[entry.source];
  const SIcon = sm.Icon;

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

  const meta = entry.meta;
  const metaUser = typeof meta?.actorEmail === "string" ? meta.actorEmail : undefined;
  const metaModel = typeof meta?.kind === "string" ? meta.kind : undefined;
  const metaTokensIn = typeof meta?.tokensIn === "number" ? meta.tokensIn : undefined;
  const metaTokensOut = typeof meta?.tokensOut === "number" ? meta.tokensOut : undefined;
  const metaEntity = typeof meta?.entity === "string" ? meta.entity : undefined;
  const metaEntityId = typeof meta?.entityId === "string" ? meta.entityId : undefined;
  const metaAction = typeof meta?.action === "string" ? meta.action : undefined;
  const metaSql = typeof meta?.sql === "string" ? meta.sql : undefined;
  const metaStack = typeof meta?.stack === "string" ? meta.stack : undefined;

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
          {entry.method && <span className="log-method">{entry.method}</span>}
          {entry.path && <span className="log-path">{entry.path}</span>}
          {typeof entry.statusCode !== "undefined" && (
            <span className="log-status" data-ok={entry.statusCode < 400}>
              {entry.statusCode}
            </span>
          )}
          {entry.msg}
        </span>

        {typeof entry.durationMs !== "undefined" && (
          <span className={`log-dur${entry.durationMs > 500 ? "slow" : ""}`}>
            {entry.durationMs}ms
          </span>
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
              <span>origin</span>
              <code>{entry.origin}</code>
            </div>
            {entry.requestId && (
              <div className="ld-kv">
                <span>request id</span>
                <code>{entry.requestId}</code>
              </div>
            )}
            {entry.ip && (
              <div className="ld-kv">
                <span>ip</span>
                <code>{entry.ip}</code>
              </div>
            )}
            {metaUser && (
              <div className="ld-kv">
                <span>user</span>
                <code>{metaUser}</code>
              </div>
            )}
            {metaModel && (
              <div className="ld-kv">
                <span>kind</span>
                <code>{metaModel}</code>
              </div>
            )}
            {typeof metaTokensIn !== "undefined" && (
              <div className="ld-kv">
                <span>tokens in</span>
                <code>{metaTokensIn}</code>
              </div>
            )}
            {typeof metaTokensOut !== "undefined" && (
              <div className="ld-kv">
                <span>tokens out</span>
                <code>{metaTokensOut}</code>
              </div>
            )}
            {metaEntity && (
              <div className="ld-kv">
                <span>entity</span>
                <code>{metaEntity}</code>
              </div>
            )}
            {metaEntityId && (
              <div className="ld-kv">
                <span>entity id</span>
                <code>{metaEntityId}</code>
              </div>
            )}
            {metaAction && (
              <div className="ld-kv">
                <span>action</span>
                <code>{metaAction}</code>
              </div>
            )}
          </div>

          {metaSql && (
            <div className="ld-block">
              <div className="ld-block-h">
                <Database style={{ width: 12, height: 12 }} /> SQL
              </div>
              <pre className="ld-code sql">{metaSql}</pre>
            </div>
          )}

          {metaStack && (
            <div className="ld-block">
              <div className="ld-block-h err">Stack trace</div>
              <pre className="ld-code stack">{metaStack}</pre>
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
