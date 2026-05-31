import { auth } from "@/infrastructure/auth/auth";
import { container } from "@/infrastructure/container";

import { SettingsForm } from "./SettingsForm";

export default async function AdminSettingsPage() {
  await auth();
  const content = await container.useCases.getSiteContent.execute();

  return (
    <div className="admin-dashboard">
      <SettingsForm
        initial={{
          content: content.settings,
        }}
      />
    </div>
  );
}
