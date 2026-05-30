import Link from "next/link";
import { container } from "@/infrastructure/container";

export default async function AdminSocialListPage() {
  const links = await container.useCases.listAllSocialLinks.execute();
  const sorted = [...links].sort((a, b) => a.order - b.order);

  return (
    <div className="admin-dashboard">
      <div className="admin-section-head">
        <h1>Social links</h1>
        <span className="admin-counter">
          <b>{sorted.length}</b> total
        </span>
      </div>

      <div className="admin-toolbar">
        <Link href="/admin/social/new" className="admin-primary">
          + New link
        </Link>
      </div>

      {sorted.length === 0 ? (
        <p className="admin-empty">No social links yet. Click &quot;New link&quot; to add one.</p>
      ) : (
        <ul className="admin-social-list">
          {sorted.map((s) => (
            <li key={s.id} className="admin-social-row">
              <span className="admin-proj-order">{String(s.order).padStart(2, "0")}</span>
              <div className="admin-social-main">
                <Link href={`/admin/social/${s.id}`} className="admin-skill-name">
                  {s.name}
                </Link>
                <a
                  className="admin-social-url"
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {s.handle ?? s.url}
                </a>
              </div>
              <div className="admin-proj-flags">
                {s.visible ? (
                  <span className="admin-proj-flag deployed">visible</span>
                ) : (
                  <span className="admin-proj-flag">hidden</span>
                )}
              </div>
              <Link href={`/admin/social/${s.id}`} className="admin-link">
                Edit →
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
