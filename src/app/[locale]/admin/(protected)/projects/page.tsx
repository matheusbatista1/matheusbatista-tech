import Link from "next/link";
import { container } from "@/infrastructure/container";

export default async function AdminProjectsListPage() {
  const projects = await container.useCases.listProjects.execute();
  const allProjects = [...projects].sort((a, b) => a.order - b.order);

  return (
    <div className="admin-dashboard">
      <div className="admin-section-head">
        <h1>Projects</h1>
        <span className="admin-counter">
          <b>{allProjects.length}</b> total
        </span>
      </div>

      <div className="admin-toolbar">
        <Link href="/admin/projects/new" className="admin-primary">
          + New project
        </Link>
      </div>

      {allProjects.length === 0 ? (
        <p className="admin-empty">No projects yet. Click &quot;New project&quot; to add one.</p>
      ) : (
        <ul className="admin-proj-list">
          {allProjects.map((p) => (
            <li key={p.id} className="admin-proj-row">
              <span className="admin-proj-order">{String(p.order).padStart(2, "0")}</span>
              <div className="admin-proj-main">
                <Link href={`/admin/projects/${p.id}`} className="admin-proj-name">
                  {p.name}
                </Link>
                <span className="admin-proj-slug">/{p.slug}</span>
              </div>
              <div className="admin-proj-flags">
                {p.pill && <span className="admin-proj-pill">{p.pill}</span>}
                {!p.visible && <span className="admin-proj-flag draft">hidden</span>}
                {p.deployed ? (
                  <span className="admin-proj-flag deployed">deployed</span>
                ) : (
                  <span className="admin-proj-flag">draft</span>
                )}
              </div>
              <Link href={`/admin/projects/${p.id}`} className="admin-link">
                Edit →
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
