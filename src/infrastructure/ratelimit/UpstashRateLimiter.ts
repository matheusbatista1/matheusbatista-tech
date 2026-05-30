import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import type { IRateLimiter, RateLimitResult } from "@/application/ports/IRateLimiter";
import { env, isRateLimitEnabled } from "@/infrastructure/config/env";

export interface UpstashRateLimiterOptions {
  limit: number;
  window: `${number} ${"s" | "m" | "h" | "d"}`;
  prefix: string;
}

/**
 * Rate limiter via Upstash Redis.
 *
 * Em dev sem UPSTASH_* configurado, faz fallback NOOP (sempre permite).
 * Documentado em CLAUDE.md.
 */
export class UpstashRateLimiter implements IRateLimiter {
  private readonly ratelimit: Ratelimit | null;
  private readonly opts: UpstashRateLimiterOptions;

  constructor(opts: UpstashRateLimiterOptions) {
    this.opts = opts;
    if (!isRateLimitEnabled) {
      this.ratelimit = null;
      return;
    }
    const redis = new Redis({
      url: env.UPSTASH_REDIS_REST_URL!,
      token: env.UPSTASH_REDIS_REST_TOKEN!,
    });
    this.ratelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(opts.limit, opts.window),
      analytics: true,
      prefix: opts.prefix,
    });
  }

  async limit(identifier: string): Promise<RateLimitResult> {
    if (!this.ratelimit) {
      return {
        success: true,
        remaining: this.opts.limit,
        reset: Date.now() + 60_000,
        limit: this.opts.limit,
      };
    }
    const result = await this.ratelimit.limit(identifier);
    return {
      success: result.success,
      remaining: result.remaining,
      reset: result.reset,
      limit: result.limit,
    };
  }
}
