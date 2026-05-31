"use client";

import { useLocale } from "next-intl";
import { useTransition } from "react";
import { useScrolled } from "@/presentation/hooks/useScrolled";
import { useTheme } from "@/presentation/providers/ThemeProvider";
import { useMenu } from "@/presentation/providers/MenuProvider";
import { BrandMark } from "@/presentation/components/icons/Icons";
import { usePathname, useRouter } from "@/presentation/lib/i18n/routing";
import type { Locale } from "@/domain/value-objects/Locale";

const LANG_ORDER: readonly Locale[] = ["pt", "en", "es"];

export function Header() {
  const scrolled = useScrolled(40);
  const { theme, toggle } = useTheme();
  const { open: openMenu } = useMenu();
  const currentLocale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const switchLocale = (next: Locale) => {
    if (next === currentLocale) return;
    startTransition(() => router.replace(pathname, { locale: next }));
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
        <button type="button" className="menu-btn" onClick={openMenu} aria-label="Open menu">
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
