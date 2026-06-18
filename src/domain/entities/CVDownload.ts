import type { Locale } from "@/domain/value-objects/Locale";

export interface CVDownload {
  id: string;
  locale: Locale;
  cvAssetId: string | null;
  ipHash: string;
  userAgent: string | null;
  referrer: string | null;
  country: string | null;
  city: string | null;
  createdAt: Date;
}

export type NewCVDownload = Omit<CVDownload, "id" | "createdAt">;
