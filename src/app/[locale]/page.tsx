import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { isLocale } from "@/domain/value-objects/Locale";
import { container } from "@/infrastructure/container";
import { Ambient } from "@/presentation/components/interactions/Ambient";
import { CustomCursor } from "@/presentation/components/interactions/CustomCursor";
import { ScrollProgress } from "@/presentation/components/interactions/ScrollProgress";
import { Header } from "@/presentation/components/layout/Header";
import { Footer } from "@/presentation/components/layout/Footer";
import { FullscreenMenu } from "@/presentation/components/layout/FullscreenMenu";
import { Hero } from "@/presentation/components/sections/Hero";
import { About } from "@/presentation/components/sections/About";
import { Projects } from "@/presentation/components/sections/Projects";
import { Skills } from "@/presentation/components/sections/Skills";
import { Contact } from "@/presentation/components/sections/Contact";
import { AIAssistant } from "@/presentation/components/ai/AIAssistant";
import { PersonaBar } from "@/presentation/components/ai/PersonaBar";
import { PersonaGate } from "@/presentation/components/ai/PersonaGate";
import { PersonaLoader } from "@/presentation/components/ai/PersonaLoader";
import { PageReveal } from "@/presentation/components/layout/PageReveal";
import { RevealOnScroll } from "@/presentation/components/interactions/RevealOnScroll";
import { isAIEnabled } from "@/infrastructure/config/env";

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
      <PageReveal>
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
          <Projects projects={projects} locale={locale} aiEnabled={isAIEnabled} />
          <Skills skills={skills} />
          <Contact socials={socials} />
        </main>
        <Footer hero={siteContent.hero} socials={socials} locale={locale} />
        <RevealOnScroll />
      </PageReveal>
      <FullscreenMenu socials={socials} />
      {isAIEnabled && (
        <>
          <PersonaBar />
          <PersonaGate />
          <PersonaLoader />
          <AIAssistant projects={projects} skills={skills} socials={socials} />
        </>
      )}
    </>
  );
}
