import type {
  DashboardStats,
  TrendKind,
} from "@/application/use-cases/dashboard/GetDashboardStats";
import { Card } from "@/presentation/components/admin/ui/Card";
import { CountUp } from "@/presentation/components/admin/dashboard/CountUp";
import { Sparkline } from "@/presentation/components/admin/dashboard/Sparkline";

export interface StatsGridLabels {
  visits: string;
  messages: string;
  projects: string;
  cvDownloads: string;
}

interface StatsGridProps {
  stats: DashboardStats;
  labels: StatsGridLabels;
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
      aria-hidden="true"
    >
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}

function FolderIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  spark: number[];
  trend: string;
  trendKind: TrendKind;
}

function StatCard({ label, value, icon, spark, trend, trendKind }: StatCardProps) {
  return (
    <Card padding="md" className="admin-stat-card">
      <div className="admin-stat-label">
        <span className="admin-stat-icon" aria-hidden="true">
          {icon}
        </span>
        <span>{label}</span>
      </div>
      <div className="admin-stat-value">
        <CountUp value={value} />
      </div>
      <div className="admin-stat-spark">
        <Sparkline data={spark} height={32} />
      </div>
      <div className={trendKind === "down" ? "admin-stat-trend down" : "admin-stat-trend"}>
        {trend}
      </div>
    </Card>
  );
}

export function StatsGrid({ stats, labels }: StatsGridProps) {
  return (
    <div className="admin-stats-grid">
      <StatCard
        label={labels.visits}
        value={stats.totalVisits}
        icon={<EyeIcon />}
        spark={stats.visitsSpark}
        trend={stats.visitsTrend}
        trendKind={stats.visitsTrendKind}
      />
      <StatCard
        label={labels.messages}
        value={stats.totalMessages}
        icon={<MailIcon />}
        spark={stats.messagesSpark}
        trend={stats.messagesTrend}
        trendKind={stats.messagesTrendKind}
      />
      <StatCard
        label={labels.projects}
        value={stats.visibleProjects}
        icon={<FolderIcon />}
        spark={stats.projectsSpark}
        trend={stats.projectsTrend}
        trendKind={stats.projectsTrendKind}
      />
      <StatCard
        label={labels.cvDownloads}
        value={stats.cvDownloads}
        icon={<DownloadIcon />}
        spark={stats.cvSpark}
        trend={stats.cvTrend}
        trendKind={stats.cvTrendKind}
      />
    </div>
  );
}
