import type { ProjectImage, NewProjectImage } from "@/domain/entities/ProjectImage";

export interface IProjectImageRepository {
  listByProject(projectId: string): Promise<ProjectImage[]>;
  create(image: NewProjectImage): Promise<ProjectImage>;
  delete(id: string): Promise<void>;
  setCover(projectId: string, imageId: string): Promise<void>;
  reorder(projectId: string, orderedIds: string[]): Promise<void>;
}
