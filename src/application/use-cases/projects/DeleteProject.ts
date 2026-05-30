import type { IProjectRepository } from "@/domain/repositories/IProjectRepository";

export class DeleteProject {
  constructor(private readonly projectRepo: IProjectRepository) {}

  async execute(id: string): Promise<void> {
    await this.projectRepo.delete(id);
  }
}
