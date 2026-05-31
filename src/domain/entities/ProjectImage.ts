export interface ProjectImage {
  id: string;
  projectId: string;
  url: string;
  alt: string | null;
  order: number;
  isCover: boolean;
  createdAt: Date;
}

export type NewProjectImage = Omit<ProjectImage, "id" | "createdAt">;
