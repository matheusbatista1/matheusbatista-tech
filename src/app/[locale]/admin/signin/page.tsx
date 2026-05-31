import "@/presentation/app/admin.css";

import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { auth, signIn } from "@/infrastructure/auth/auth";
import { AdminGlow } from "@/presentation/components/admin/AdminGlow";
import { AmbientBackground } from "@/presentation/components/admin/shell/AmbientBackground";
import { GoogleIcon } from "@/presentation/components/admin/GoogleIcon";

interface SignInPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string; callbackUrl?: string }>;
}

export default async function SignInPage({ params, searchParams }: SignInPageProps) {
  const { locale } = await params;
  const session = await auth();
  if (session?.user) redirect(`/${locale}/admin`);

  const { error, callbackUrl } = await searchParams;
  const t = await getTranslations({ locale, namespace: "admin.signin" });

  const authConfigured = Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);

  const errorMessage = error
    ? error === "AccessDenied"
      ? t("errorAccessDenied")
      : t("errorGeneric")
    : null;

  const subtitleHtml = t("subtitle").replace(/\n/g, "<br />");

  async function signInAction() {
    "use server";
    const redirectTo = callbackUrl && callbackUrl.startsWith("/") ? callbackUrl : "/admin";
    await signIn("google", { redirectTo });
  }

  return (
    <div className="admin-shell" data-theme="dark">
      <AmbientBackground />
      <AdminGlow />
      <main className="admin-signin">
        <div className="admin-signin-card">
          <div className="admin-signin-mark">mb</div>
          <h1>{t("title")}</h1>
          <p dangerouslySetInnerHTML={{ __html: subtitleHtml }} />

          {errorMessage && <div className="admin-signin-error">{errorMessage}</div>}

          {!authConfigured && <div className="admin-signin-warn">{t("authNotConfigured")}</div>}

          <form action={signInAction}>
            <button type="submit" className="admin-signin-google" disabled={!authConfigured}>
              <GoogleIcon size={18} />
              <span>{t("continueWithGoogle")}</span>
            </button>
          </form>

          <div className="admin-signin-foot">
            <Link href={`/${locale}`}>{t("backToPortfolio")}</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
