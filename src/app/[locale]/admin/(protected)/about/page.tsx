import { getTranslations } from "next-intl/server";

import { container } from "@/infrastructure/container";
import { Card } from "@/presentation/components/admin/ui/Card";
import { PageHead } from "@/presentation/components/admin/shell/PageHead";

import { AboutForm } from "./AboutForm";

export default async function AdminAboutPage() {
  const [content, t] = await Promise.all([
    container.useCases.getSiteContent.execute(),
    getTranslations("admin.about"),
  ]);

  return (
    <div className="admin-dashboard">
      <PageHead title={t("title")} lead={t("lead")} />
      <Card>
        <AboutForm about={content.about} />
      </Card>
    </div>
  );
}
