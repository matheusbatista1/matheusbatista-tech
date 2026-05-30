import type { Project } from "../entities/Project";

export interface IProjectRepository {
  list(opts?: { visibleOnly?: boolean }): Promise<Project[]>;
  findById(id: string): Promise<Project | null>;
  findBySlug(slug: string): Promise<Project | null>;
  findManyByIds(ids: string[]): Promise<Project[]>;
}
