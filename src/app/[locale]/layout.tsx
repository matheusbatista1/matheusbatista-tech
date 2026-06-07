import type { ReactNode } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { Inter, JetBrains_Mono, Caveat, Instrument_Serif } from "next/font/google";
import { locales } from "@/presentation/lib/i18n/config";
import { DEFAULT_LOCALE, isLocale } from "@/domain/value-objects/Locale";
import { ThemeProvider } from "@/presentation/providers/ThemeProvider";
import { PersonaProvider } from "@/presentation/providers/PersonaProvider";
import { MenuProvider } from "@/presentation/providers/MenuProvider";
import { LoadingScreen } from "@/presentation/components/interactions/LoadingScreen";
import { PageViewTracker } from "@/presentation/components/analytics/PageViewTracker";
import { env, isAIEnabled } from "@/infrastructure/config/env";
import { container } from "@/infrastructure/container";
import { DEFAULT_THEME, type Theme } from "@/domain/value-objects/Theme";

const siteName = "Matheus Batista";

const OG_LOCALE_MAP: Record<string, string> = {
  en: "en_US",
  pt: "pt_BR",
  es: "es_ES",
};

function localeToOgFormat(locale: string): string {
  return OG_LOCALE_MAP[locale] ?? "en_US";
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const safeLocale = isLocale(locale) ? locale : DEFAULT_LOCALE;

  const t = await getTranslations({ locale: safeLocale, namespace: "seo" });
  const title = t("title");
  const description = t("description");

  const siteUrl = env.NEXT_PUBLIC_SITE_URL;
  const localeUrl = (l: string) => (l === DEFAULT_LOCALE ? siteUrl : `${siteUrl}/${l}`);
  const canonical = localeUrl(safeLocale);
  const ogLocale = localeToOgFormat(safeLocale);
  const alternateOgLocales = Object.entries(OG_LOCALE_MAP)
    .filter(([key]) => key !== safeLocale)
    .map(([, value]) => value);

  return {
    metadataBase: new URL(siteUrl),
    title,
    description,
    keywords: [
      "Matheus Batista",
      "Software Engineer",
      "Backend Developer",
      ".NET",
      "Node.js",
      "TypeScript",
      "Next.js",
      "Portfolio",
    ],
    authors: [{ name: siteName }],
    creator: siteName,
    category: "technology",
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    alternates: {
      canonical,
      languages: {
        en: localeUrl("en"),
        pt: localeUrl("pt"),
        es: localeUrl("es"),
      },
    },
    openGraph: {
      type: "website",
      locale: ogLocale,
      alternateLocale: alternateOgLocales,
      url: canonical,
      siteName,
      title,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-caveat",
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-instrument-serif",
  display: "swap",
});

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  let defaultTheme: Theme = DEFAULT_THEME;
  try {
    const content = await container.useCases.getSiteContent.execute();
    const stored = content.settings.defaultTheme;
    if (stored === "light" || stored === "dark") defaultTheme = stored;
  } catch {
    /* fall back to DEFAULT_THEME when site content is unavailable */
  }

  return (
    <html
      lang={locale}
      data-theme={defaultTheme}
      suppressHydrationWarning
      className={`${inter.variable} ${jetbrainsMono.variable} ${caveat.variable} ${instrumentSerif.variable}`}
    >
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ThemeProvider initialTheme={defaultTheme}>
            <PersonaProvider aiEnabled={isAIEnabled}>
              <LoadingScreen />
              <PageViewTracker />
              <MenuProvider>{children}</MenuProvider>
            </PersonaProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
