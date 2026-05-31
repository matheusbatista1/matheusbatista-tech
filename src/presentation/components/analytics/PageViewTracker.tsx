"use client";

import { useEffect } from "react";
import { useLocale } from "next-intl";
import { usePathname } from "next/navigation";

const BOT_UA_REGEX = /bot|crawl|spider|crawler|slurp|mediapartners|facebookexternalhit/i;

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

    void fetch("/api/analytics/pageview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path, locale, referrer }),
      keepalive: true,
    }).catch(() => {
      // swallow — analytics must never break the page
    });
  }, [locale, pathname]);

  return null;
}
