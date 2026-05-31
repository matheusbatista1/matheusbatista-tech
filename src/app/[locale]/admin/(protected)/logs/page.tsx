import { getTranslations } from "next-intl/server";

import { PageHead } from "@/presentation/components/admin/shell/PageHead";
import { LogsPage } from "@/presentation/components/admin/logs/LogsPage";

export default async function AdminLogsPage() {
  const t = await getTranslations("admin.logs");

  return (
    <div className="admin-dashboard">
      <PageHead title={t("title")} lead={t("lead")} />
      <LogsPage />
    </div>
  );
}
