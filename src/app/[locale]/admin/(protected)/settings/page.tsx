import { container } from "@/infrastructure/container";
import { SettingsForm } from "./SettingsForm";

export default async function AdminSettingsPage() {
  const content = await container.useCases.getSiteContent.execute();

  return (
    <div className="admin-dashboard">
      <div className="admin-section-head">
        <h1>Settings</h1>
        <span className="admin-counter">Site-wide defaults</span>
      </div>

      <SettingsForm settings={content.settings} />
    </div>
  );
}
