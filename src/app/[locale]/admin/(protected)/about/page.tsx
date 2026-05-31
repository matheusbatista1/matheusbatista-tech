import { container } from "@/infrastructure/container";
import { AboutForm } from "./AboutForm";

export default async function AdminAboutPage() {
  const content = await container.useCases.getSiteContent.execute();

  return (
    <div className="admin-dashboard">
      <AboutForm about={content.about} />
    </div>
  );
}
