import type { IPageViewRepository } from "@/domain/repositories/IPageViewRepository";
import type { Locale } from "@/domain/value-objects/Locale";

export interface LogPageViewInput {
  path: string;
  locale?: Locale | null;
  referrer?: string | null;
  userAgent?: string | null;
  ipHash: string;
  country?: string | null;

  // Geo (Vercel headers)
  countryCode?: string | null;
  countryName?: string | null;
  city?: string | null;
  region?: string | null;
  lat?: number | null;
  lon?: number | null;
  serverTz?: string | null;

  // Client signals
  clientTz?: string | null;
  screenW?: number | null;
  screenH?: number | null;
  viewportW?: number | null;
  viewportH?: number | null;
  language?: string | null;

  // UA parsed
  browser?: string | null;
  browserVer?: string | null;
  os?: string | null;
  osVer?: string | null;
  device?: string | null;
  deviceModel?: string | null;

  // Bot detection
  isBot?: boolean | null;
  botName?: string | null;
  botVer?: string | null;

  // Referrer parsed
  refHost?: string | null;
  refPath?: string | null;
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
        countryCode: input.countryCode ?? null,
        countryName: input.countryName ?? null,
        city: input.city ?? null,
        region: input.region ?? null,
        lat: input.lat ?? null,
        lon: input.lon ?? null,
        serverTz: input.serverTz ?? null,
        clientTz: input.clientTz ?? null,
        screenW: input.screenW ?? null,
        screenH: input.screenH ?? null,
        viewportW: input.viewportW ?? null,
        viewportH: input.viewportH ?? null,
        language: input.language ?? null,
        browser: input.browser ?? null,
        browserVer: input.browserVer ?? null,
        os: input.os ?? null,
        osVer: input.osVer ?? null,
        device: input.device ?? null,
        deviceModel: input.deviceModel ?? null,
        isBot: input.isBot ?? null,
        botName: input.botName ?? null,
        botVer: input.botVer ?? null,
        refHost: input.refHost ?? null,
        refPath: input.refPath ?? null,
      });
    } catch (err) {
      console.warn("[LogPageView] falha ao registrar pageview", err);
    }
  }
}
