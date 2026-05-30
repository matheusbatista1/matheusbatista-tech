import { setRequestLocale, getTranslations } from "next-intl/server";

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const tHero = await getTranslations("hero");

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="space-y-4 px-6 text-center">
        <p className="text-text-mute font-mono text-xs tracking-wider uppercase">
          {tHero("currentFocus")}
        </p>
        <h1 className="text-5xl font-bold tracking-tight md:text-7xl">
          MATHEUS <span className="text-text-mute">BATISTA</span>
        </h1>
        <p className="text-text-mute mx-auto max-w-xl">
          {/* TODO(fase 2): portar Hero completo de sections.jsx com 3D tilt */}
          Bootstrap concluido. Proxima fase: portar Header + Hero + sections do design original.
        </p>
        <div className="text-text-dim pt-8 font-mono text-xs">
          locale: <span className="text-text">{locale}</span>
        </div>
      </div>
    </main>
  );
}
