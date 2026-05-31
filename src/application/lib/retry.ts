type RetryOpts = { retries?: number; delays?: number[]; isRetryable?: (err: unknown) => boolean };

export async function withRetry<T>(fn: () => Promise<T>, opts: RetryOpts = {}): Promise<T> {
  const delays = opts.delays ?? [250, 750, 1500];
  const isRetryable = opts.isRetryable ?? (() => false);
  const maxAttempts = (opts.retries ?? delays.length) + 1;
  let lastErr: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (attempt === maxAttempts || !isRetryable(err)) throw err;
      const delay = delays[attempt - 1] ?? delays[delays.length - 1] ?? 1000;
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw lastErr;
}

// Prisma transient codes: P1001 (cant reach DB), P1002 (timeout), P1008 (operation timeout), P1017 (server closed connection)
const PRISMA_TRANSIENT_CODES = new Set(["P1001", "P1002", "P1008", "P1017"]);

export function isPrismaTransientError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const code = (err as { code?: string }).code;
  if (typeof code === "string" && PRISMA_TRANSIENT_CODES.has(code)) return true;
  // Also catch PrismaClientInitializationError + PrismaClientRustPanicError by name
  const name = (err as { name?: string }).name;
  return name === "PrismaClientInitializationError" || name === "PrismaClientRustPanicError";
}
