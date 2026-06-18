"use client";

import { useEffect } from "react";
import { useLocale } from "next-intl";
import { usePathname } from "next/navigation";

const BOT_UA_REGEX =
  /bot|crawl|spider|crawler|slurp|mediapartners|facebookexternalhit|headless|puppeteer|playwright|selenium|whatsapp|telegrambot|discordbot|slackbot|twitterbot|linkedinbot/i;

export function PageViewTracker() {
  const locale = useLocale();
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const nav = window.navigator;
    if (!nav || nav.webdriver) return;
    if (BOT_UA_REGEX.test(nav.userAgent ?? "")) return;

    const path = window.location.pathname;
    if (path.startsWith("/admin") || path.startsWith("/api") || path.startsWith("/_next")) {
      return;
    }

    const dedupeKey = `pv:${path}`;
    try {
      if (window.sessionStorage.getItem(dedupeKey)) return;
      window.sessionStorage.setItem(dedupeKey, "1");
    } catch {
      // sessionStorage unavailable (private mode etc.) — proceed without dedupe
    }

    const referrer = document.referrer || null;

    // Best-effort client signals — APIs vary across browsers/private modes
    let clientTz: string | undefined;
    let screenW: number | undefined;
    let screenH: number | undefined;
    let viewportW: number | undefined;
    let viewportH: number | undefined;
    let language: string | undefined;

    try {
      clientTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch {}
    try {
      screenW = window.screen?.width;
      screenH = window.screen?.height;
    } catch {}
    try {
      viewportW = window.innerWidth;
      viewportH = window.innerHeight;
    } catch {}
    try {
      language = nav.language;
    } catch {}

    void fetch("/api/analytics/pageview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path,
        locale,
        referrer,
        clientTz,
        screenW,
        screenH,
        viewportW,
        viewportH,
        language,
      }),
      keepalive: true,
    }).catch(() => {
      // swallow — analytics must never break the page
    });
  }, [locale, pathname]);

  return null;
}
