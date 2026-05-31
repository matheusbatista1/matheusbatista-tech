import type { IPageViewRepository } from "@/domain/repositories/IPageViewRepository";
import type { Locale } from "@/domain/value-objects/Locale";

export interface LogPageViewInput {
  path: string;
  locale?: Locale | null;
  referrer?: string | null;
  userAgent?: string | null;
  ipHash: string;
  country?: string | null;
}

export class LogPageView {
  constructor(private readonly repo: IPageViewRepository) {}

  async execute(input: LogPageViewInput): Promise<void> {
    try {
      await this.repo.create({
        path: input.path,
        locale: input.locale ?? null,
        referrer: input.referrer ?? null,
        userAgent: input.userAgent ?? null,
        ipHash: input.ipHash,
        country: input.country ?? null,
      });
    } catch (err) {
      console.warn("[LogPageView] falha ao registrar pageview", err);
    }
  }
}
