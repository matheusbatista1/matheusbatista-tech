"use client";

import { useTranslations } from "next-intl";

import { Card } from "@/presentation/components/admin/ui/Card";

export function CVTips() {
  const t = useTranslations("admin.cv.tips");

  return (
    <div className="admin-cv-tips">
      <Card padding="lg">
        <h3 className="admin-cv-tips-title">{t("title")}</h3>
        <ul className="admin-cv-tips-list">
          <li>{t("one")}</li>
          <li>{t("two")}</li>
          <li>
            {t.rich("three", {
              code: (chunks) => <code className="admin-cv-tips-code">{chunks}</code>,
            })}
          </li>
        </ul>
      </Card>
    </div>
  );
}
