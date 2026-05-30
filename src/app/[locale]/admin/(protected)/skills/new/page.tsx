import Link from "next/link";
import { SkillForm } from "../SkillForm";

export default function AdminSkillNewPage() {
  return (
    <div className="admin-dashboard">
      <div className="admin-section-head">
        <h1>New skill</h1>
        <Link href="/admin/skills" className="admin-link">
          ← Back to list
        </Link>
      </div>

      <SkillForm />
    </div>
  );
}
