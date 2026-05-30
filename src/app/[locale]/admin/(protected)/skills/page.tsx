import Link from "next/link";
import { container } from "@/infrastructure/container";
import type { SkillCategory } from "@/domain/entities/Skill";

const CATEGORY_LABELS: Record<SkillCategory, string> = {
  frontend: "Frontend",
  backend: "Backend",
  database: "Database",
  devops: "DevOps",
  tools: "Tools",
};

const CATEGORY_ORDER: SkillCategory[] = ["frontend", "backend", "database", "devops", "tools"];

export default async function AdminSkillsListPage() {
  const grouped = await container.useCases.groupSkillsByCategory.execute();
  const total = CATEGORY_ORDER.reduce((sum, cat) => sum + (grouped[cat]?.length ?? 0), 0);

  return (
    <div className="admin-dashboard">
      <div className="admin-section-head">
        <h1>Skills</h1>
        <span className="admin-counter">
          <b>{total}</b> total · grouped by category
        </span>
      </div>

      <div className="admin-toolbar">
        <Link href="/admin/skills/new" className="admin-primary">
          + New skill
        </Link>
      </div>

      {CATEGORY_ORDER.map((category) => {
        const items = [...(grouped[category] ?? [])].sort((a, b) => a.order - b.order);
        return (
          <section key={category} className="admin-skill-group">
            <h2>
              {CATEGORY_LABELS[category]}
              <span className="admin-skill-count">{items.length}</span>
            </h2>
            {items.length === 0 ? (
              <p className="admin-empty admin-empty-sm">No skills in this category yet.</p>
            ) : (
              <ul className="admin-skill-list">
                {items.map((s) => (
                  <li key={s.id} className="admin-skill-row">
                    <span
                      className="admin-skill-sw"
                      style={{ background: s.color ?? "#3178c6" }}
                      aria-hidden="true"
                    >
                      {s.key}
                    </span>
                    <div className="admin-skill-main">
                      <Link href={`/admin/skills/${s.id}`} className="admin-skill-name">
                        {s.name}
                      </Link>
                      <span className="admin-skill-key">order {s.order}</span>
                    </div>
                    <Link href={`/admin/skills/${s.id}`} className="admin-link">
                      Edit →
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        );
      })}
    </div>
  );
}
