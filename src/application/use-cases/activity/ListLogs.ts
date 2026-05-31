import type { ActivityEvent, ActivityEntity } from "@/domain/entities/ActivityEvent";
import type { AIUsageEvent } from "@/domain/entities/AIUsageEvent";
import type { IActivityEventRepository } from "@/domain/repositories/IActivityEventRepository";
import type { IAIUsageLogRepository } from "@/domain/repositories/IAIUsageLogRepository";

export type LogSource =
  | "all"
  | "api"
  | "database"
  | "auth"
  | "system"
  | "ai"
  | "email"
  | "activity";

export type LogLevel = "all" | "error" | "warn" | "info" | "debug";

export type LogOrigin = "activity" | "ai";

export interface LogEntry {
  id: string;
  ts: string;
  source: Exclude<LogSource, "all">;
  level: Exclude<LogLevel, "all">;
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

export interface ListLogsInput {
  source?: LogSource;
  level?: LogLevel;
  search?: string;
  since?: Date;
  limit?: number;
  offset?: number;
}

export interface ListLogsOutput {
  entries: LogEntry[];
  total: number;
  hasMore: boolean;
}

const ENTITY_TO_SOURCE: Record<ActivityEntity, Exclude<LogSource, "all">> = {
  project: "database",
  skill: "database",
  social: "database",
  hero: "database",
  about: "database",
  cv: "database",
  settings: "system",
  message: "email",
  asset: "system",
};

function deriveActivitySource(ev: ActivityEvent): Exclude<LogSource, "all"> {
  if (ev.action === "ai_apply") return "ai";
  return ENTITY_TO_SOURCE[ev.entity] ?? "system";
}

function deriveActivityLevel(ev: ActivityEvent): Exclude<LogLevel, "all"> {
  switch (ev.action) {
    case "delete":
    case "reset":
      return "warn";
    case "ai_apply":
    case "create":
    case "update":
    case "upload":
    case "publish":
    default:
      return "info";
  }
}

function buildActivityMessage(ev: ActivityEvent): string {
  const entity = ev.entity;
  const id = ev.entityId ? ` ${ev.entityId}` : "";
  switch (ev.action) {
    case "create":
      return `Created ${entity}${id}`;
    case "update":
      return `Updated ${entity}${id}`;
    case "delete":
      return `Deleted ${entity}${id}`;
    case "upload":
      return `Uploaded ${entity}${id}`;
    case "publish":
      return `Published ${entity}${id}`;
    case "reset":
      return `Reset ${entity}${id}`;
    case "ai_apply":
      return `AI applied to ${entity}${id}`;
    default:
      return `${ev.action} ${entity}${id}`;
  }
}

function mapActivityToLogEntry(ev: ActivityEvent): LogEntry {
  return {
    id: ev.id,
    ts: ev.createdAt.toISOString(),
    origin: "activity",
    source: deriveActivitySource(ev),
    level: deriveActivityLevel(ev),
    msg: buildActivityMessage(ev),
    ip: ev.ip ?? undefined,
    meta: {
      actorEmail: ev.actorEmail,
      entityId: ev.entityId,
      entity: ev.entity,
      action: ev.action,
      diff: ev.diff,
    },
  };
}

function mapAIUsageToLogEntry(ev: AIUsageEvent): LogEntry {
  const level: Exclude<LogLevel, "all"> =
    ev.status === "error" ? "error" : ev.status === "rate_limited" ? "warn" : "info";
  return {
    id: ev.id,
    ts: ev.createdAt.toISOString(),
    origin: "ai",
    source: "ai",
    level,
    msg: `${ev.kind} (${ev.persona ?? "default"})`,
    durationMs: ev.durationMs ?? undefined,
    ip: ev.ip,
    meta: {
      kind: ev.kind,
      persona: ev.persona,
      locale: ev.locale,
      tokensIn: ev.tokensIn,
      tokensOut: ev.tokensOut,
      cached: ev.cached,
      status: ev.status,
    },
  };
}

function matchesLevel(entry: LogEntry, level: LogLevel | undefined): boolean {
  if (!level || level === "all") return true;
  return entry.level === level;
}

function matchesSearch(entry: LogEntry, search: string | undefined): boolean {
  if (!search || search.trim().length === 0) return true;
  const needle = search.toLowerCase();
  if (entry.msg.toLowerCase().includes(needle)) return true;
  if (entry.ip && entry.ip.toLowerCase().includes(needle)) return true;
  if (entry.meta) {
    try {
      if (JSON.stringify(entry.meta).toLowerCase().includes(needle)) return true;
    } catch {
      // ignore JSON.stringify failures (circular refs etc)
    }
  }
  return false;
}

/**
 * Aggregates logs from ActivityEvent + AIUsageLog into a single unified stream.
 * Filtering by level/search happens post-mapping because both are derived.
 */
export class ListLogs {
  constructor(
    private readonly activityRepo: IActivityEventRepository,
    private readonly aiUsageLogRepo: IAIUsageLogRepository,
  ) {}

  async execute(input: ListLogsInput = {}): Promise<ListLogsOutput> {
    const source = input.source ?? "all";
    const level = input.level ?? "all";
    const limit = Math.max(1, Math.min(input.limit ?? 50, 200));
    const offset = Math.max(0, input.offset ?? 0);
    const search = input.search?.trim() ?? "";
    const since = input.since;

    // Source "ai" -> only AI usage logs
    if (source === "ai") {
      // Fetch a generous batch to allow client-side level/search filtering, then paginate
      const all = await this.aiUsageLogRepo.listRecent({ since, limit: 500, offset: 0 });
      const mapped = all
        .map(mapAIUsageToLogEntry)
        .filter((e) => matchesLevel(e, level) && matchesSearch(e, search));
      const total = mapped.length;
      const entries = mapped.slice(offset, offset + limit);
      return { entries, total, hasMore: offset + entries.length < total };
    }

    // Source "activity" -> only activity events
    if (source === "activity") {
      const { entries: rows } = await this.activityRepo.listFiltered({
        since,
        search: search.length > 0 ? search : undefined,
        limit: 500,
        offset: 0,
      });
      const mapped = rows
        .map(mapActivityToLogEntry)
        .filter((e) => matchesLevel(e, level) && matchesSearch(e, search));
      const total = mapped.length;
      const entries = mapped.slice(offset, offset + limit);
      return { entries, total, hasMore: offset + entries.length < total };
    }

    // Source-specific filtering using ActivityEvent: api/database/auth/system/email
    if (source !== "all") {
      const { entries: rows } = await this.activityRepo.listFiltered({
        since,
        search: search.length > 0 ? search : undefined,
        limit: 500,
        offset: 0,
      });
      const mapped = rows
        .map(mapActivityToLogEntry)
        .filter((e) => e.source === source)
        .filter((e) => matchesLevel(e, level) && matchesSearch(e, search));
      const total = mapped.length;
      const entries = mapped.slice(offset, offset + limit);
      return { entries, total, hasMore: offset + entries.length < total };
    }

    // source === "all": merge activity + ai usage
    const [activityResult, aiUsage] = await Promise.all([
      this.activityRepo.listFiltered({
        since,
        search: search.length > 0 ? search : undefined,
        limit: 500,
        offset: 0,
      }),
      this.aiUsageLogRepo.listRecent({ since, limit: 500, offset: 0 }),
    ]);

    const merged: LogEntry[] = [
      ...activityResult.entries.map(mapActivityToLogEntry),
      ...aiUsage.map(mapAIUsageToLogEntry),
    ]
      .filter((e) => matchesLevel(e, level) && matchesSearch(e, search))
      .sort((a, b) => (a.ts < b.ts ? 1 : a.ts > b.ts ? -1 : 0));

    const total = merged.length;
    const entries = merged.slice(offset, offset + limit);
    return { entries, total, hasMore: offset + entries.length < total };
  }
}
