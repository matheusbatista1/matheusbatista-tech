import Link from "next/link";
import { getTranslations } from "next-intl/server";
import type { HeroContent } from "@/domain/entities/HeroContent";
import type { SocialLink } from "@/domain/entities/SocialLink";
import type { CVAsset } from "@/domain/entities/CVAsset";
import type { Locale } from "@/domain/value-objects/Locale";
import { pickLocalized } from "@/domain/value-objects/LocalizedText";
import { getCvForLocale } from "@/presentation/lib/cv";
import { FooterNav } from "./FooterNav";

interface FooterProps {
  hero: HeroContent;
  socials: SocialLink[];
  locale: Locale;
  cvs: CVAsset[];
}

export async function Footer({ hero, socials, locale, cvs }: FooterProps) {
  const t = await getTranslations("footer");
  const tNav = await getTranslations("nav");
  const tPrivacy = await getTranslations("privacy");

  const subtitle = pickLocalized(hero.subtitle, locale);
  const cv = getCvForLocale(cvs, locale);

  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <h2 className="signature">
            {hero.firstName.toLowerCase()} {hero.lastName.toLowerCase()}.
          </h2>
          <p className="tag">
            {subtitle}. {t("tag")}
          </p>
        </div>
        <FooterNav
          heading={t("navigate")}
          items={[
            { href: "#top", section: "top", label: tNav("home") },
            { href: "#about", section: "about", label: tNav("about") },
            { href: "#projects", section: "projects", label: tNav("projects") },
            { href: "#skills", section: "skills", label: tNav("skills") },
            { href: "#contact", section: "contact", label: tNav("contact") },
          ]}
        />
        <div className="footer-col">
          <h5>{t("elsewhere")}</h5>
          {socials.map((s) => (
            <a
              key={s.id}
              href={s.url}
              target={s.url.startsWith("http") ? "_blank" : undefined}
              rel={s.url.startsWith("http") ? "noopener noreferrer" : undefined}
            >
              {s.name}
            </a>
          ))}
          {cv && (
            <a href={`/api/cv/${locale}`} download>
              {t("cv")}
            </a>
          )}
          <Link href="/admin">Admin</Link>
        </div>
      </div>
      <div className="footer-meta">
        <span>© 2026 MATHEUS BATISTA · {t("rights")}</span>
        <Link href={`/${locale}/privacy`} className="footer-privacy">
          {tPrivacy("footerLink")}
        </Link>
        <span>v2 · {t("updated")}</span>
      </div>
    </footer>
  );
}
