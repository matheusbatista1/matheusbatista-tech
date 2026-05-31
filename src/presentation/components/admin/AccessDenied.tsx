"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { signOut } from "next-auth/react";

import { AdminGlow } from "@/presentation/components/admin/AdminGlow";
import { AmbientBackground } from "@/presentation/components/admin/shell/AmbientBackground";

export interface AccessDeniedProps {
  email: string;
}

export function AccessDenied({ email }: AccessDeniedProps) {
  const t = useTranslations("admin.accessDenied");

  return (
    <div className="admin-shell" data-theme="dark">
      <AmbientBackground />
      <AdminGlow />
      <main className="admin-signin">
        <div className="admin-signin-card">
          <div className="admin-signin-mark is-danger" aria-hidden="true">
            !
          </div>
          <h1>{t("title")}</h1>
          <p>
            {t.rich("message", {
              email: () => <strong>{email}</strong>,
            })}
          </p>
          <button
            type="button"
            className="admin-signin-google"
            onClick={() => {
              void signOut({ callbackUrl: "/admin/signin" });
            }}
          >
            <span>{t("tryAnother")}</span>
          </button>
          <div className="admin-signin-foot">
            <Link href="/">{t("backToPortfolio")}</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
