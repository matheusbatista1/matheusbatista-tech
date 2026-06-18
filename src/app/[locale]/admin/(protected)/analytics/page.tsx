import { AnalyticsView } from "@/presentation/components/admin/analytics/AnalyticsView";
import { CVDownloadsPanel } from "@/presentation/components/admin/analytics/CVDownloadsPanel";

export default function AdminAnalyticsPage() {
  return (
    <>
      <AnalyticsView />
      <CVDownloadsPanel />
    </>
  );
}
