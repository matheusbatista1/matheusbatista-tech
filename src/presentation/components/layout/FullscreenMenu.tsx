"use client";

import { useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { SocialLink } from "@/domain/entities/SocialLink";
import type { Locale } from "@/domain/value-objects/Locale";
import { useMenu } from "@/presentation/providers/MenuProvider";
import { useSmoothScrollTo } from "@/presentation/hooks/useSmoothScrollTo";
import { ArrowUpRightIcon, CloseIcon, DownloadIcon } from "@/presentation/components/icons/Icons";
import { usePathname, useRouter } from "@/presentation/lib/i18n/routing";

interface FullscreenMenuProps {
  socials: SocialLink[];
}

const NAV_ITEMS = [
  { id: "top", number: "01", labelKey: "home" },
  { id: "about", number: "02", labelKey: "about" },
  { id: "projects", number: "03", labelKey: "projects" },
  { id: "skills", number: "04", labelKey: "skills" },
  { id: "contact", number: "05", labelKey: "contact" },
] as const;

const LANG_ORDER: readonly Locale[] = ["pt", "en", "es"];

export function FullscreenMenu({ socials }: FullscreenMenuProps) {
  const { isOpen, close } = useMenu();
  const tMenu = useTranslations("menu");
  const tNav = useTranslations("nav");
  const currentLocale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();

  const email = socials.find((s) => s.name === "Email");
  const gh = socials.find((s) => s.name === "GitHub");
  const li = socials.find((s) => s.name === "LinkedIn");

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, close]);

  const scrollTo = useSmoothScrollTo();

  const navigate = (sectionId: string) => {
    close();
    scrollTo(sectionId);
  };

  const switchLocale = (next: Locale) => {
    if (next === currentLocale) return;
    router.replace(pathname, { locale: next });
  };

  return (
    <div
      className={["menu-root", isOpen ? "open" : ""].filter(Boolean).join(" ")}
      aria-hidden={!isOpen}
    >
      <aside className="menu-side">
        <div className="ms-title">{tMenu("touch")}</div>
        <div className="ms-list">
          {email && (
            <a href={email.url}>
              <span>{tMenu("email")}</span>
              <ArrowUpRightIcon />
            </a>
          )}
          {gh && (
            <a href={gh.url} target="_blank" rel="noopener noreferrer">
              <span>GitHub</span>
              <ArrowUpRightIcon />
            </a>
          )}
          {li && (
            <a href={li.url} target="_blank" rel="noopener noreferrer">
              <span>LinkedIn</span>
              <ArrowUpRightIcon />
            </a>
          )}
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            style={{ opacity: 0.4, pointerEvents: "none" }}
          >
            <span>{tMenu("notUploaded")}</span>
            <DownloadIcon />
          </a>
        </div>
        <div className="ms-foot">
          <span>{tMenu("location")}</span>
          <span>{tMenu("open")}</span>
        </div>
      </aside>

      <div className="menu-main">
        <button type="button" className="menu-close" onClick={close} aria-label="Close menu">
          <CloseIcon />
        </button>

        <ul className="menu-list">
          {NAV_ITEMS.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  navigate(item.id);
                }}
              >
                <span className="n">{item.number}</span>
                <span>{tNav(item.labelKey)}</span>
                <span className="arr">→</span>
              </a>
            </li>
          ))}
        </ul>

        <div className="mobile-menu-foot">
          {email && (
            <a href={email.url}>
              <span>Email</span>
              <span className="inline-flex items-center gap-2 text-[color:var(--color-text-dim)]">
                {email.handle}
                <ArrowUpRightIcon />
              </span>
            </a>
          )}
          {gh && (
            <a href={gh.url} target="_blank" rel="noopener noreferrer">
              <span>GitHub</span>
              <ArrowUpRightIcon />
            </a>
          )}
          {li && (
            <a href={li.url} target="_blank" rel="noopener noreferrer">
              <span>LinkedIn</span>
              <ArrowUpRightIcon />
            </a>
          )}
          <div className="lang-mob">
            <span className="mr-1 text-[color:var(--color-text-dim)]">{tMenu("language")}</span>
            {LANG_ORDER.map((lang) => (
              <button
                key={lang}
                type="button"
                className={lang === currentLocale ? "on" : ""}
                onClick={() => switchLocale(lang)}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
