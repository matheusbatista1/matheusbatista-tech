import Link from "next/link";
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

function EyeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      width="14"
      height="14"
      aria-hidden="true"
    >
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
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
      <PageHead
        title={t("title")}
        lead={t("lead")}
        actions={
          <Link
            href={`/${locale}`}
            target="_blank"
            rel="noreferrer"
            className="admin-btn admin-btn-ghost"
          >
            <EyeIcon />
            {t("viewPortfolio")}
          </Link>
        }
      />

      <StatsGrid
        stats={stats}
        labels={{
          visits: t("stats.visits"),
          messages: t("stats.messages"),
          projects: t("stats.projects"),
          cvDownloads: t("stats.cvDownloads"),
        }}
      />

      <div className="admin-dashboard-grid">
        <RecentMessages messages={recentMessages} locale={locale} />
        <RecentActivity events={recentActivity} locale={locale} />
      </div>
    </div>
  );
}
