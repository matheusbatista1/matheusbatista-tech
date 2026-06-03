import { getTranslations } from "next-intl/server";
import type { AboutContent } from "@/domain/entities/AboutContent";
import type { SocialLink } from "@/domain/entities/SocialLink";
import type { Locale } from "@/domain/value-objects/Locale";
import { pickLocalized } from "@/domain/value-objects/LocalizedText";
import { MailIcon } from "@/presentation/components/icons/Icons";
import { AboutStats } from "./AboutStats";
import { AboutBody } from "./AboutBody";

interface AboutProps {
  about: AboutContent;
  socials: SocialLink[];
  locale: Locale;
  projectsCount: number;
  companiesCount: number;
  technologiesCount: number;
}

export async function About({
  about,
  socials,
  locale,
  projectsCount,
  companiesCount,
  technologiesCount,
}: AboutProps) {
  const t = await getTranslations("about");

  const label = pickLocalized(about.label, locale) || t("label");
  const body = pickLocalized(about.body, locale);
  const currently = pickLocalized(about.currently, locale);

  const github = socials.find((s) => s.name === "GitHub");
  const email = socials.find((s) => s.name === "Email");

  return (
    <section className="section reveal" id="about">
      <div className="shell">
        <div className="section-head">
          <span className="section-num">01 /</span>
          <span className="section-label">{label}</span>
        </div>

        <div className="about-grid">
          <aside className="about-meta">
            <div className="card">
              <div className="row">
                <span>{t("role")}</span>
                <b>{about.role}</b>
              </div>
              <div className="row">
                <span>{t("basedIn")}</span>
                <b>{about.location}</b>
              </div>
              <div className="row">
                <span>{t("experience")}</span>
                <b>{about.years}</b>
              </div>
              <div className="row">
                <span>{t("openTo")}</span>
                <b>{t("rolesProjects")}</b>
              </div>
              <div className="row">
                <span>{t("languages")}</span>
                <b>{about.languages?.trim() || "PT · EN · ES"}</b>
              </div>
            </div>

            {(github || email) && (
              <div className="card">
                {github && (
                  <div className="row">
                    <span>GitHub</span>
                    <b>{github.handle?.replace(/^github\.com\//, "") ?? github.url}</b>
                  </div>
                )}
                {email && (
                  <div className="row">
                    <span>Email</span>
                    <b className="font-mono text-[11.5px]">{email.handle ?? email.url}</b>
                  </div>
                )}
              </div>
            )}
          </aside>

          <div className="about-body">
            <AboutBody body={body} currently={currently} />

            <AboutStats
              projectsCount={projectsCount}
              companiesCount={companiesCount}
              technologiesCount={technologiesCount}
            />

            <div className="about-cta">
              <a className="send-msg" href="#contact">
                <MailIcon />
                {t("send")}
              </a>
              {/* TODO(cv): once a CV asset is uploaded for this locale, add
                  <a href={`/api/cv/${locale}`}> to enable tracked downloads
                  via the /api/cv/[locale] route. */}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
