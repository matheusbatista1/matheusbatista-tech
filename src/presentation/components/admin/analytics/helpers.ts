import { Monitor, Smartphone, Tablet, Bot, type LucideIcon } from "lucide-react";

export function anRelTime(
  iso: string,
  t: (key: string, vars?: Record<string, number | string>) => string,
): string {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 5) return t("time.justNow");
  if (s < 60) return t("time.sAgo", { n: s });
  if (s < 3600) return t("time.minAgo", { n: Math.floor(s / 60) });
  if (s < 86400) return t("time.hAgo", { n: Math.floor(s / 3600) });
  return t("time.dAgo", { n: Math.floor(s / 86400) });
}

export function deviceIcon(device: string | null): LucideIcon {
  if (device === "mobile") return Smartphone;
  if (device === "tablet") return Tablet;
  if (device === "bot") return Bot;
  return Monitor;
}

export function computeDelta(series: number[] | undefined | null): number {
  if (!series || series.length < 6) return 0;
  const recent = series.slice(4).reduce((a, b) => a + b, 0);
  const prev = series.slice(2, 4).reduce((a, b) => a + b, 0) || 1;
  return Math.round(((recent - prev) / prev) * 100);
}
