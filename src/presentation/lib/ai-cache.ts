/**
 * Client-side cache de respostas de IA (sessao do visitante).
 *
 * Reproduz o comportamento de mb_ai_cache_v2 do design original.
 * Server cache (Postgres AICache) e compartilhado entre visitantes;
 * este cache evita rede em sessoes ja familiares.
 *
 * Hashes devem ser identicos aos usados no server.
 */

const STORAGE_KEY = "mb_ai_cache_v2";
const MAX_ENTRIES = 80;
const TRIM_TO = 60;

interface CacheEntry<T = unknown> {
  hash: string;
  response: T;
  createdAt: number;
}

interface CacheState {
  entries: CacheEntry[];
}

function read(): CacheState {
  if (typeof window === "undefined") return { entries: [] };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { entries: [] };
    const parsed = JSON.parse(raw) as CacheState;
    return parsed.entries ? parsed : { entries: [] };
  } catch {
    return { entries: [] };
  }
}

function write(state: CacheState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // QuotaExceeded — ignora silenciosamente
  }
}

export function getCached<T>(hash: string): T | null {
  const { entries } = read();
  const found = entries.find((e) => e.hash === hash);
  return (found?.response as T) ?? null;
}

export function setCached<T>(hash: string, response: T): void {
  const state = read();
  const filtered = state.entries.filter((e) => e.hash !== hash);
  filtered.push({ hash, response, createdAt: Date.now() });
  const trimmed = filtered.length > MAX_ENTRIES ? filtered.slice(-TRIM_TO) : filtered;
  write({ entries: trimmed });
}

export function clearCache(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}

/**
 * Hash determinista de chave de cache. Server e client devem usar o MESMO
 * formato de entrada para chegar ao mesmo hash.
 *
 * Usa Web Crypto API (disponivel no browser e no Node 20+).
 */
export async function hashKey(kind: string, parts: Record<string, string>): Promise<string> {
  const normalized = Object.entries(parts)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v.trim().toLowerCase()}`)
    .join("|");
  const input = `${kind}::${normalized}`;
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const buffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
