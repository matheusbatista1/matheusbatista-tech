"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import type { HeroContent } from "@/domain/entities/HeroContent";
import type { SocialLink } from "@/domain/entities/SocialLink";
import type { Locale } from "@/domain/value-objects/Locale";
import { pickLocalized } from "@/domain/value-objects/LocalizedText";
import { SocialIcon } from "@/presentation/components/icons/Icons";
import { usePersona } from "@/presentation/providers/PersonaProvider";

interface HeroProps {
  hero: HeroContent;
  socials: SocialLink[];
  locale: Locale;
}

const TILT_EASING = 0.1;
const TILT_RANGE_X = 4;
const TILT_RANGE_Y = 3;

export function Hero({ hero, socials, locale }: HeroProps) {
  const t = useTranslations("hero");
  const tiltRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const el = tiltRef.current;
    if (!el) return;
    if (window.matchMedia("(hover: none)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let tx = 0;
    let ty = 0;
    let x = 0;
    let y = 0;

    const tick = () => {
      x += (tx - x) * TILT_EASING;
      y += (ty - y) * TILT_EASING;
      el.style.transform = `rotateX(${y}deg) rotateY(${x}deg)`;
      raf = requestAnimationFrame(tick);
    };

    const onMove = (e: PointerEvent) => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      tx = (e.clientX / w - 0.5) * (TILT_RANGE_X * 2);
      ty = -(e.clientY / h - 0.5) * (TILT_RANGE_Y * 2);
    };

    window.addEventListener("pointermove", onMove);
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  const subtitle = pickLocalized(hero.subtitle, locale);
  const baseTagline = pickLocalized(hero.tagline, locale);
  const { copy, busy } = usePersona();
  const tagline = copy?.tagline ?? baseTagline;
  const leadClassName = ["lead", busy ? "persona-loading" : ""].filter(Boolean).join(" ");

  return (
    <section className="hero" id="top">
      <div className="hero-content">
        {hero.available && (
          <div className="hero-eyebrow">
            <span className="dot" aria-hidden="true" />
            <span>
              {t("availPre")} {t("roles")} {t("and")} {t("projects")}
            </span>
          </div>
        )}

        <div className="hero-name-wrap">
          <h1 className="hero-name" ref={tiltRef}>
            <span className="ln">{hero.firstName}</span>
            <span className="ln dim">{hero.lastName}</span>
          </h1>
        </div>

        <div className="hero-meta">
          <p className={leadClassName}>
            <em>{subtitle}.</em> {tagline}
          </p>
        </div>
      </div>

      <div className="hero-foot">
        <div className="hero-scroll">
          <span>{t("scroll")}</span>
          <span className="line" aria-hidden="true" />
          <span>{t("explore")}</span>
        </div>

        <div className="hero-coord">JANDIRA · SÃO PAULO · BR</div>

        <ul className="hero-socials">
          {socials.map((s) => (
            <li key={s.id}>
              <a
                href={s.url}
                target={s.url.startsWith("http") ? "_blank" : undefined}
                rel={s.url.startsWith("http") ? "noopener noreferrer" : undefined}
                aria-label={s.name}
              >
                <SocialIcon name={s.name} />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
