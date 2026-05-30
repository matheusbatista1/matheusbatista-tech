/**
 * Hash determinista para chaves de AICache.
 *
 * Mesmo formato precisa ser usado entre client (presentation/lib/ai-cache.ts)
 * e server. Web Crypto API funciona em ambos os runtimes (Node 20+ e browser).
 */
export async function hashCacheKey(kind: string, parts: Record<string, string>): Promise<string> {
  const normalized = Object.entries(parts)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v.trim().toLowerCase()}`)
    .join("|");
  const input = `${kind}::${normalized}`;
  const data = new TextEncoder().encode(input);
  const buffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
