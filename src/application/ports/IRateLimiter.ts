export interface RateLimitResult {
  success: boolean;
  remaining: number;
  reset: number;
  limit: number;
}

export interface IRateLimiter {
  /**
   * Checa o rate limit para o identificador (geralmente IP hasheado).
   * Em dev sem Upstash configurado, retorna { success: true } sempre (noop).
   */
  limit(identifier: string): Promise<RateLimitResult>;
}
