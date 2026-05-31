"use client";

import { AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { signOut } from "next-auth/react";

import { Button } from "@/presentation/components/admin/ui/Button";

export interface AccessDeniedProps {
  email: string;
}

export function AccessDenied({ email }: AccessDeniedProps) {
  const t = useTranslations("admin.accessDenied");

  return (
    <div className="admin-shell admin-ambient" data-theme="dark">
      <div className="admin-access-denied">
        <div className="admin-access-denied-card">
          <span className="admin-access-denied-mark" aria-hidden="true">
            <AlertCircle size={28} />
          </span>
          <h1 className="admin-access-denied-title">{t("title")}</h1>
          <p className="admin-access-denied-message">{t("message", { email })}</p>
          <Button
            variant="primary"
            onClick={() => {
              void signOut({ callbackUrl: "/admin/signin" });
            }}
          >
            {t("tryAnother")}
          </Button>
        </div>
      </div>
    </div>
  );
}
