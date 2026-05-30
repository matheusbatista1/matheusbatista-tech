import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { isLocale } from "@/domain/value-objects/Locale";
import { container } from "@/infrastructure/container";
import { Ambient } from "@/presentation/components/interactions/Ambient";
import { CustomCursor } from "@/presentation/components/interactions/CustomCursor";
import { ScrollProgress } from "@/presentation/components/interactions/ScrollProgress";
import { Header } from "@/presentation/components/layout/Header";
import { Hero } from "@/presentation/components/sections/Hero";

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);

  const [siteContent, socials] = await Promise.all([
    container.useCases.getSiteContent.execute(),
    container.useCases.listSocialLinks.execute(),
  ]);

  return (
    <>
      <Ambient />
      <CustomCursor />
      <ScrollProgress />
      <Header />
      <main>
        <Hero hero={siteContent.hero} socials={socials} locale={locale} />
        {/* TODO(fase 2): portar About, Projects, Skills, Contact, Footer */}
      </main>
    </>
  );
}
