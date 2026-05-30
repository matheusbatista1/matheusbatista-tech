"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";
import type { Route } from "next";
import { useScrolled } from "@/presentation/hooks/useScrolled";
import { useTheme } from "@/presentation/providers/ThemeProvider";
import { BrandMark } from "@/presentation/components/icons/Icons";
import { LOCALES } from "@/domain/value-objects/Locale";
import type { Locale } from "@/domain/value-objects/Locale";

interface HeaderProps {
  onMenuClick?: () => void;
}

const LANG_ORDER: readonly Locale[] = ["pt", "en", "es"];
const DEFAULT_LOCALE: Locale = "en";

export function Header({ onMenuClick }: HeaderProps) {
  const scrolled = useScrolled(40);
  const { theme, toggle } = useTheme();
  const currentLocale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const switchLocale = (next: Locale) => {
    if (next === currentLocale) return;
    const segments = pathname.split("/").filter(Boolean);
    const first = segments[0];
    if (first && (LOCALES as readonly string[]).includes(first)) {
      segments.shift();
    }
    const tail = segments.join("/");
    const path = next === DEFAULT_LOCALE ? `/${tail}` : `/${next}${tail ? `/${tail}` : ""}`;
    const normalized = (path === "" ? "/" : path) as Route;
    startTransition(() => router.replace(normalized));
  };

  return (
    <header
      className={["header", scrolled ? "scrolled" : ""].filter(Boolean).join(" ")}
      data-pending={isPending || undefined}
    >
      <div className="lang">
        {LANG_ORDER.map((code, i) => (
          <span key={code} className="inline-flex items-center">
            <button
              type="button"
              className={code === currentLocale ? "on" : ""}
              onClick={() => switchLocale(code)}
              aria-label={`Switch language to ${code.toUpperCase()}`}
            >
              {code}
            </button>
            {i < LANG_ORDER.length - 1 && <span className="sep">·</span>}
          </span>
        ))}
      </div>

      <a className="brand" href="#top" aria-label="Home">
        <BrandMark />
      </a>

      <div className="header-right">
        <button
          type="button"
          className="theme-tgl"
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          onClick={toggle}
        >
          <span className="k" aria-hidden="true" />
        </button>
        <button type="button" className="menu-btn" onClick={onMenuClick} aria-label="Open menu">
          <span>Menu</span>
          <span className="ml" aria-hidden="true">
            <span />
            <span />
          </span>
        </button>
      </div>
    </header>
  );
}
