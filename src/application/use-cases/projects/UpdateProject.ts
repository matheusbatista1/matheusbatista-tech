import type { Project } from "@/domain/entities/Project";
import type { IProjectRepository, ProjectInput } from "@/domain/repositories/IProjectRepository";

export class UpdateProject {
  constructor(private readonly projectRepo: IProjectRepository) {}

  async execute(id: string, input: ProjectInput): Promise<Project> {
    return this.projectRepo.update(id, input);
  }
}
