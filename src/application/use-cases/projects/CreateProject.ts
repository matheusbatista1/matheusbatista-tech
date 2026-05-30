import type { Project } from "@/domain/entities/Project";
import type { IProjectRepository, ProjectInput } from "@/domain/repositories/IProjectRepository";

export class CreateProject {
  constructor(private readonly projectRepo: IProjectRepository) {}

  async execute(input: ProjectInput): Promise<Project> {
    return this.projectRepo.create(input);
  }
}
