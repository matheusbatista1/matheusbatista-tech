import Link from "next/link";
import { notFound } from "next/navigation";
import { container } from "@/infrastructure/container";
import { ProjectForm } from "../ProjectForm";
import { deleteProjectAction } from "../actions";

interface AdminProjectEditPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminProjectEditPage({ params }: AdminProjectEditPageProps) {
  const { id } = await params;
  const project = await container.useCases.getProjectById.execute(id);
  if (!project) notFound();

  return (
    <div className="admin-dashboard">
      <div className="admin-section-head">
        <h1>{project.name}</h1>
        <Link href="/admin/projects" className="admin-link">
          ← Back to list
        </Link>
      </div>

      <ProjectForm project={project} />

      <form
        action={async () => {
          "use server";
          await deleteProjectAction(id);
        }}
        className="admin-danger-zone"
      >
        <h3>Danger zone</h3>
        <p>This deletes the project permanently.</p>
        <button type="submit" className="admin-danger-btn">
          Delete project
        </button>
      </form>
    </div>
  );
}
