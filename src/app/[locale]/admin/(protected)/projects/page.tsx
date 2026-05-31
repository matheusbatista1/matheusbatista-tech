import { container } from "@/infrastructure/container";
import { ProjectsView } from "@/presentation/components/admin/projects/ProjectsView";
import {
  attachProjectImageAction,
  createProjectAction,
  deleteProjectAction,
  removeProjectImageAction,
  reorderProjectImagesAction,
  reorderProjectsAction,
  setProjectCoverAction,
  updateProjectAction,
} from "./actions";

export default async function AdminProjectsListPage() {
  const projects = await container.repositories.project.list();
  const sorted = [...projects].sort((a, b) => a.order - b.order);

  return (
    <div className="admin-dashboard">
      <ProjectsView
        projects={sorted}
        actions={{
          create: createProjectAction,
          update: updateProjectAction,
          delete: deleteProjectAction,
          reorder: reorderProjectsAction,
          attachImage: attachProjectImageAction,
          removeImage: removeProjectImageAction,
          setCover: setProjectCoverAction,
          reorderImages: reorderProjectImagesAction,
        }}
      />
    </div>
  );
}
