import { getTranslations } from "next-intl/server";

import { auth } from "@/infrastructure/auth/auth";
import { container } from "@/infrastructure/container";
import { PageHead } from "@/presentation/components/admin/shell/PageHead";
import { RecentActivity } from "@/presentation/components/admin/dashboard/RecentActivity";
import { RecentMessages } from "@/presentation/components/admin/dashboard/RecentMessages";
import { StatsGrid } from "@/presentation/components/admin/dashboard/StatsGrid";

interface AdminDashboardPageProps {
  params: Promise<{ locale: string }>;
}

export default async function AdminDashboardPage({ params }: AdminDashboardPageProps) {
  const { locale } = await params;
  await auth();
  const t = await getTranslations({ locale, namespace: "admin.dashboard" });

  const [stats, recentActivity, allMessages] = await Promise.all([
    container.useCases.getDashboardStats.execute(),
    container.useCases.listRecentActivity.execute({ limit: 15 }),
    container.useCases.listMessages.execute({ unreadOnly: false }),
  ]);

  const recentMessages = allMessages.slice(0, 5);

  return (
    <div className="admin-dashboard">
      <PageHead title={t("title")} lead={t("lead")} />

      <StatsGrid
        stats={stats}
        labels={{
          messagesToday: t("stats.messagesToday"),
          unread: t("stats.unread"),
          visibleProjects: t("stats.visibleProjects"),
          aiCalls: t("stats.aiCalls"),
        }}
      />

      <div className="admin-dashboard-grid">
        <RecentMessages messages={recentMessages} locale={locale} />
        <RecentActivity events={recentActivity} locale={locale} />
      </div>
    </div>
  );
}
