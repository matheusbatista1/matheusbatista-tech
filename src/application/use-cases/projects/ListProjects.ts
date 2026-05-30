import type { Project } from "@/domain/entities/Project";
import type { IProjectRepository } from "@/domain/repositories/IProjectRepository";

export class ListProjects {
  constructor(private readonly projectRepo: IProjectRepository) {}

  async execute(): Promise<Project[]> {
    return this.projectRepo.list({ visibleOnly: true });
  }
}
