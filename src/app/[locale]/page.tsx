import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { isLocale } from "@/domain/value-objects/Locale";
import { container } from "@/infrastructure/container";
import { Ambient } from "@/presentation/components/interactions/Ambient";
import { CustomCursor } from "@/presentation/components/interactions/CustomCursor";
import { ScrollProgress } from "@/presentation/components/interactions/ScrollProgress";
import { Header } from "@/presentation/components/layout/Header";
import { Hero } from "@/presentation/components/sections/Hero";
import { About } from "@/presentation/components/sections/About";
import { Skills } from "@/presentation/components/sections/Skills";

const COMPANIES_COUNT = 4;

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);

  const [siteContent, socials, projects, skills] = await Promise.all([
    container.useCases.getSiteContent.execute(),
    container.useCases.listSocialLinks.execute(),
    container.useCases.listProjects.execute(),
    container.useCases.listSkills.execute(),
  ]);

  return (
    <>
      <Ambient />
      <CustomCursor />
      <ScrollProgress />
      <Header />
      <main>
        <Hero hero={siteContent.hero} socials={socials} locale={locale} />
        <About
          about={siteContent.about}
          socials={socials}
          locale={locale}
          projectsCount={projects.length}
          companiesCount={COMPANIES_COUNT}
          technologiesCount={skills.length}
        />
        <Skills skills={skills} />
        {/* TODO(fase 2): portar Projects, Contact, Footer */}
      </main>
    </>
  );
}
