import type { Locale } from "@/domain/value-objects/Locale";

export interface CVAsset {
  id: string;
  locale: Locale;
  url: string;
  filename: string;
  sizeBytes: number;
  createdAt: Date;
}

export type NewCVAsset = Omit<CVAsset, "id" | "createdAt">;
