import type { Metadata } from "next";
import { env } from "@/infrastructure/config/env";
import "./globals.css";

const siteUrl = env.NEXT_PUBLIC_SITE_URL;
const siteName = "Matheus Batista";
const description =
  "Backend-focused software engineer specializing in .NET, Node.js, APIs, integrations, and scalable systems.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} — Software Engineer`,
    template: `%s · ${siteName}`,
  },
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
  openGraph: {
    type: "website",
    locale: "en_US",
    alternateLocale: ["pt_BR", "es_ES"],
    url: siteUrl,
    siteName,
    title: `${siteName} — Software Engineer`,
    description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteName} — Software Engineer`,
    description,
    creator: "@matheusbatista",
  },
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
    canonical: siteUrl,
    languages: {
      en: `${siteUrl}/`,
      pt: `${siteUrl}/pt`,
      es: `${siteUrl}/es`,
    },
  },
  category: "technology",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
