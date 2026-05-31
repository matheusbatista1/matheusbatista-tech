import { getTranslations } from "next-intl/server";

import { auth } from "@/infrastructure/auth/auth";
import { container } from "@/infrastructure/container";
import { PageHead } from "@/presentation/components/admin/shell/PageHead";

import { SettingsForm } from "./SettingsForm";

export default async function AdminSettingsPage() {
  await auth();
  const [content, settings, t] = await Promise.all([
    container.useCases.getSiteContent.execute(),
    container.useCases.getSiteSettings.execute(),
    getTranslations("admin.settings"),
  ]);

  return (
    <div className="admin-dashboard">
      <PageHead title={t("title")} lead={t("lead")} />
      <SettingsForm
        initial={{
          content: content.settings,
          settings,
        }}
      />
    </div>
  );
}
