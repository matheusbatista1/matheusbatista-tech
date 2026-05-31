import type { DashboardStats } from "@/application/use-cases/dashboard/GetDashboardStats";
import { Card } from "@/presentation/components/admin/ui/Card";

export interface StatsGridLabels {
  messagesToday: string;
  unread: string;
  visibleProjects: string;
  aiCalls: string;
}

interface StatsGridProps {
  stats: DashboardStats;
  labels: StatsGridLabels;
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}

function InboxIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M22 12h-6l-2 3h-4l-2-3H2" />
      <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
    </svg>
  );
}

function ProjectsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M3 7h18M3 12h18M3 17h12" />
    </svg>
  );
}

function SparkIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" />
    </svg>
  );
}

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
}

function StatCard({ label, value, icon }: StatCardProps) {
  return (
    <Card padding="md" className="admin-stat-card">
      <div className="admin-stat-label">
        <span className="admin-stat-icon" aria-hidden="true">
          {icon}
        </span>
        <span>{label}</span>
      </div>
      <div className="admin-stat-value">{value}</div>
    </Card>
  );
}

export function StatsGrid({ stats, labels }: StatsGridProps) {
  return (
    <div className="admin-stats-grid">
      <StatCard label={labels.messagesToday} value={stats.messagesToday} icon={<MailIcon />} />
      <StatCard label={labels.unread} value={stats.unreadMessages} icon={<InboxIcon />} />
      <StatCard
        label={labels.visibleProjects}
        value={stats.visibleProjects}
        icon={<ProjectsIcon />}
      />
      <StatCard label={labels.aiCalls} value={stats.aiCalls7d} icon={<SparkIcon />} />
    </div>
  );
}
