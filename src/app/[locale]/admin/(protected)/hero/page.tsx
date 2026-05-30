import { container } from "@/infrastructure/container";
import { HeroForm } from "./HeroForm";

export default async function AdminHeroPage() {
  const content = await container.useCases.getSiteContent.execute();

  return (
    <div className="admin-dashboard">
      <div className="admin-section-head">
        <h1>Hero</h1>
        <span className="admin-counter">Edits the landing headline + tagline</span>
      </div>

      <HeroForm hero={content.hero} />
    </div>
  );
}
