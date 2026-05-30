import { container } from "@/infrastructure/container";
import { AboutForm } from "./AboutForm";

export default async function AdminAboutPage() {
  const content = await container.useCases.getSiteContent.execute();

  return (
    <div className="admin-dashboard">
      <div className="admin-section-head">
        <h1>About</h1>
        <span className="admin-counter">Edits the About section copy</span>
      </div>

      <AboutForm about={content.about} />
    </div>
  );
}
