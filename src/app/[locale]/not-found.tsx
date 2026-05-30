import { getTranslations } from "next-intl/server";
import Link from "next/link";

export default async function NotFound() {
  const t = await getTranslations("notfound");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-6">
      <h1 className="text-7xl font-bold tracking-tight md:text-9xl">404</h1>
      <p className="text-text-mute font-mono text-xs tracking-widest uppercase">{t("sub")}</p>
      <Link
        href="/"
        className="mt-4 rounded-full border border-[color:var(--line-strong)] px-6 py-3 font-mono text-xs tracking-widest uppercase transition-colors hover:bg-[color:var(--surface)]"
      >
        {t("btn")}
      </Link>
    </main>
  );
}
