import type { Project } from "@/domain/entities/Project";
import type { IProjectRepository } from "@/domain/repositories/IProjectRepository";

export class GetProjectById {
  constructor(private readonly projectRepo: IProjectRepository) {}

  async execute(id: string): Promise<Project | null> {
    return this.projectRepo.findById(id);
  }
}
