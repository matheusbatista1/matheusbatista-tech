import type { Locale } from "@/domain/value-objects/Locale";

export interface PageView {
  id: string;
  path: string;
  locale: Locale | null;
  referrer: string | null;
  userAgent: string | null;
  ipHash: string;
  country: string | null;
  createdAt: Date;
}

export type NewPageView = Omit<PageView, "id" | "createdAt">;
