import type { IAIUsageLogRepository } from "@/domain/repositories/IAIUsageLogRepository";
import type { AIUsageStatus } from "@/domain/entities/AIUsageEvent";
import type { Locale } from "@/domain/value-objects/Locale";

export interface LogAIUsageInput {
  kind: string;
  locale: Locale;
  persona?: string | null;
  ip: string;
  tokensIn?: number | null;
  tokensOut?: number | null;
  cached?: boolean;
  durationMs?: number | null;
  status: AIUsageStatus;
  error?: string | null;
}

const ERROR_MAX = 500;

export class LogAIUsage {
  constructor(private readonly repo: IAIUsageLogRepository) {}

  async execute(input: LogAIUsageInput): Promise<void> {
    try {
      await this.repo.create({
        kind: input.kind,
        locale: input.locale,
        persona: input.persona ?? null,
        ip: input.ip,
        tokensIn: input.tokensIn ?? null,
        tokensOut: input.tokensOut ?? null,
        cached: input.cached ?? false,
        durationMs: input.durationMs ?? null,
        status: input.status,
        error: input.error ? input.error.slice(0, ERROR_MAX) : null,
      });
    } catch (err) {
      console.warn("[LogAIUsage] falha ao registrar uso de IA", err);
    }
  }
}
