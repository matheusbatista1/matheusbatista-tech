import { setRequestLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { isLocale } from "@/domain/value-objects/Locale";
import { container } from "@/infrastructure/container";
import { Ambient } from "@/presentation/components/interactions/Ambient";
import { CustomCursor } from "@/presentation/components/interactions/CustomCursor";
import { Header } from "@/presentation/components/layout/Header";
import { Footer } from "@/presentation/components/layout/Footer";
import { FullscreenMenu } from "@/presentation/components/layout/FullscreenMenu";

interface PrivacyPageProps {
  params: Promise<{ locale: string }>;
}

export default async function PrivacyPage({ params }: PrivacyPageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);

  const t = await getTranslations("privacy");
  const [siteContent, socials] = await Promise.all([
    container.useCases.getSiteContent.execute(),
    container.useCases.listSocialLinks.execute(),
  ]);

  const backLabel = locale === "pt" ? "Voltar" : locale === "es" ? "Volver" : "Back";

  return (
    <>
      <Ambient />
      <CustomCursor />
      <Header />
      <main className="privacy-page">
        <div className="shell">
          <Link href={`/${locale}`} className="privacy-back">
            ← {backLabel}
          </Link>
          <h1 className="privacy-title">{t("title")}</h1>
          <p className="privacy-updated">{t("lastUpdated")}</p>
          <p className="privacy-lead">{t("intro")}</p>

          <section className="privacy-section">
            <h2>{t("controllerHeading")}</h2>
            <p>{t("controllerBody")}</p>
          </section>

          <section className="privacy-section">
            <h2>{t("collectedHeading")}</h2>
            <h3>{t("collectedContactHeading")}</h3>
            <p>{t("collectedContact")}</p>
            <h3>{t("collectedAnalyticsHeading")}</h3>
            <p>{t("collectedAnalytics")}</p>
            <h3>{t("collectedCookiesHeading")}</h3>
            <p>{t("collectedCookies")}</p>
          </section>

          <section className="privacy-section">
            <h2>{t("purposeHeading")}</h2>
            <p>{t("purposeBody")}</p>
          </section>

          <section className="privacy-section">
            <h2>{t("retentionHeading")}</h2>
            <p>{t("retentionBody")}</p>
          </section>

          <section className="privacy-section">
            <h2>{t("rightsHeading")}</h2>
            <p>{t("rightsBody")}</p>
          </section>

          <section className="privacy-section">
            <h2>{t("thirdPartyHeading")}</h2>
            <p>{t("thirdPartyBody")}</p>
          </section>

          <section className="privacy-section">
            <h2>{t("contactHeading")}</h2>
            <p>{t("contactBody")}</p>
          </section>
        </div>
      </main>
      <Footer hero={siteContent.hero} socials={socials} locale={locale} />
      <FullscreenMenu socials={socials} />
    </>
  );
}
