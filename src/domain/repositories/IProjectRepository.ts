import type { Project, ProjectImage, ProjectPill } from "../entities/Project";
import type { LocalizedText } from "../value-objects/LocalizedText";

export interface ProjectInput {
  slug: string;
  name: string;
  url: string | null;
  liveUrl: string | null;
  description: LocalizedText;
  pill: ProjectPill | null;
  tags: string[];
  images: ProjectImage[];
  order: number;
  deployed: boolean;
  visible: boolean;
}

export interface IProjectRepository {
  list(opts?: { visibleOnly?: boolean }): Promise<Project[]>;
  findById(id: string): Promise<Project | null>;
  findBySlug(slug: string): Promise<Project | null>;
  findManyByIds(ids: string[]): Promise<Project[]>;
  create(input: ProjectInput): Promise<Project>;
  update(id: string, input: ProjectInput): Promise<Project>;
  delete(id: string): Promise<void>;
}
