import Link from "next/link";
import { ProjectForm } from "../ProjectForm";

export default function AdminProjectNewPage() {
  return (
    <div className="admin-dashboard">
      <div className="admin-section-head">
        <h1>New project</h1>
        <Link href="/admin/projects" className="admin-link">
          ← Back to list
        </Link>
      </div>

      <ProjectForm />
    </div>
  );
}
