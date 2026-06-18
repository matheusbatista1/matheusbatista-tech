import type { Locale } from "@/domain/value-objects/Locale";

export type AIUsageStatus = "ok" | "rate_limited" | "error";

export interface AIUsageEvent {
  id: string;
  kind: string;
  locale: Locale;
  persona: string | null;
  ip: string;
  tokensIn: number | null;
  tokensOut: number | null;
  cached: boolean;
  durationMs: number | null;
  status: AIUsageStatus;
  error: string | null;
  createdAt: Date;
}

export type NewAIUsageEvent = Omit<AIUsageEvent, "id" | "createdAt">;
