import { getTranslations } from "next-intl/server";

import { Card } from "@/presentation/components/admin/ui/Card";

interface CVTipsProps {
  locale: string;
}

export async function CVTips({ locale }: CVTipsProps) {
  const t = await getTranslations({ locale, namespace: "admin.cv" });

  const tips = t("tipsDesc")
    .split(/(?<=[.!?])\s+/)
    .map((part) => part.trim())
    .filter(Boolean);

  return (
    <div className="admin-cv-tips">
      <Card header={{ title: t("tips") }} padding="md">
        <ul>
          {tips.map((tip, idx) => (
            <li key={idx}>{tip}</li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
