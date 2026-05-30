/**
 * Cache-key helpers para AICache.
 *
 * Mesmo formato precisa funcionar em Node (server) e no browser (client),
 * por isso usa Web Crypto (disponivel em ambos a partir do Node 20+).
 */

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const buffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Hash determinista sobre o conteudo editavel do portfolio.
 *
 * Toda chave de cache de IA inclui esse fingerprint para invalidar
 * automaticamente caches stale quando o admin editar o conteudo.
 */
export async function computeContentFingerprint(input: {
  tagline: string;
  about: string;
  currently: string;
  projects: Array<{ id: string; name: string; description: string; tags: string[] }>;
  skills: Record<string, string[]>;
}): Promise<string> {
  const normalized = {
    tagline: input.tagline.trim(),
    about: input.about.trim(),
    currently: input.currently.trim(),
    projects: input.projects
      .map((p) => ({
        id: p.id,
        name: p.name.trim(),
        description: p.description.trim(),
        tags: [...p.tags].sort(),
      }))
      .sort((a, b) => a.id.localeCompare(b.id)),
    skills: Object.fromEntries(
      Object.entries(input.skills)
        .map(([cat, names]): [string, string[]] => [cat, [...names].sort()])
        .sort(([a], [b]) => a.localeCompare(b)),
    ),
  };
  return sha256Hex(JSON.stringify(normalized));
}

/**
 * Hash determinista da chave de cache de IA.
 *
 * Inclui o `contentFingerprint` (se fornecido) para invalidar
 * automaticamente quando o conteudo do portfolio mudar.
 */
export async function hashCacheKey(kind: string, parts: Record<string, string>): Promise<string> {
  const normalized = Object.entries(parts)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v.trim().toLowerCase()}`)
    .join("|");
  return sha256Hex(`${kind}::${normalized}`);
}
