import { getTranslations } from "next-intl/server";

import { container } from "@/infrastructure/container";
import { Card } from "@/presentation/components/admin/ui/Card";
import { PageHead } from "@/presentation/components/admin/shell/PageHead";

import { HeroForm } from "./HeroForm";

export default async function AdminHeroPage() {
  const [content, t] = await Promise.all([
    container.useCases.getSiteContent.execute(),
    getTranslations("admin.hero"),
  ]);

  return (
    <div className="admin-dashboard">
      <PageHead title={t("title")} lead={t("lead")} />
      <Card>
        <HeroForm hero={content.hero} />
      </Card>
    </div>
  );
}
