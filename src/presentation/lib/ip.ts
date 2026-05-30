import { createHash } from "node:crypto";

/**
 * Extrai e hasheia o IP do cliente para uso em rate limiting + logs.
 * Nunca logamos IP raw — só hash.
 */
export function getHashedIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const raw = forwarded?.split(",")[0]?.trim() ?? realIp ?? "unknown";
  return createHash("sha256").update(raw).digest("hex").slice(0, 32);
}
