import Link from "next/link";
import { getTranslations } from "next-intl/server";
import type { HeroContent } from "@/domain/entities/HeroContent";
import type { SocialLink } from "@/domain/entities/SocialLink";
import type { Locale } from "@/domain/value-objects/Locale";
import { pickLocalized } from "@/domain/value-objects/LocalizedText";

interface FooterProps {
  hero: HeroContent;
  socials: SocialLink[];
  locale: Locale;
}

export async function Footer({ hero, socials, locale }: FooterProps) {
  const t = await getTranslations("footer");
  const tNav = await getTranslations("nav");

  const subtitle = pickLocalized(hero.subtitle, locale);

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
        <div className="footer-col">
          <h5>{t("navigate")}</h5>
          <a href="#top">{tNav("home")}</a>
          <a href="#about">{tNav("about")}</a>
          <a href="#projects">{tNav("projects")}</a>
          <a href="#skills">{tNav("skills")}</a>
          <a href="#contact">{tNav("contact")}</a>
        </div>
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
          <Link href="/admin">Admin</Link>
        </div>
      </div>
      <div className="footer-meta">
        <span>© 2026 MATHEUS BATISTA · {t("rights")}</span>
        <span>v2 · {t("updated")}</span>
      </div>
    </footer>
  );
}
