import Link from "next/link";
import { notFound } from "next/navigation";
import { container } from "@/infrastructure/container";
import { SkillForm } from "../SkillForm";
import { deleteSkillAction } from "../actions";

interface AdminSkillEditPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminSkillEditPage({ params }: AdminSkillEditPageProps) {
  const { id } = await params;
  const skill = await container.useCases.getSkillById.execute(id);
  if (!skill) notFound();

  return (
    <div className="admin-dashboard">
      <div className="admin-section-head">
        <h1>{skill.name}</h1>
        <Link href="/admin/skills" className="admin-link">
          ← Back to list
        </Link>
      </div>

      <SkillForm skill={skill} />

      <form
        action={async () => {
          "use server";
          await deleteSkillAction(id);
        }}
        className="admin-danger-zone"
      >
        <h3>Danger zone</h3>
        <p>This deletes the skill permanently.</p>
        <button type="submit" className="admin-danger-btn">
          Delete skill
        </button>
      </form>
    </div>
  );
}
