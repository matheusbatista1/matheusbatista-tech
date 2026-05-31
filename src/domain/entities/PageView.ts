import type { Locale } from "@/domain/value-objects/Locale";

export interface PageView {
  id: string;
  path: string;
  locale: Locale | null;
  referrer: string | null;
  userAgent: string | null;
  ipHash: string;
  country: string | null;
  countryCode: string | null;
  countryName: string | null;
  city: string | null;
  region: string | null;
  lat: number | null;
  lon: number | null;
  serverTz: string | null;
  clientTz: string | null;
  screenW: number | null;
  screenH: number | null;
  viewportW: number | null;
  viewportH: number | null;
  language: string | null;
  browser: string | null;
  browserVer: string | null;
  os: string | null;
  osVer: string | null;
  device: string | null;
  deviceModel: string | null;
  isBot: boolean | null;
  botName: string | null;
  botVer: string | null;
  refHost: string | null;
  refPath: string | null;
  createdAt: Date;
}

export type NewPageView = Omit<PageView, "id" | "createdAt">;
