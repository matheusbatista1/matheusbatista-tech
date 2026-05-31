export interface ProjectActionResult {
  ok?: boolean;
  id?: string;
  error?: string;
}

export interface ProjectPayload {
  name: string;
  url: string | null;
  liveUrl: string | null;
  description: { en: string; pt: string; es: string };
  pill: string | null;
  tags: string[];
  deployed: boolean;
  visible: boolean;
}

export interface ProjectActions {
  create: (payload: ProjectPayload) => Promise<ProjectActionResult>;
  update: (id: string, payload: ProjectPayload) => Promise<ProjectActionResult>;
  delete: (id: string) => Promise<ProjectActionResult>;
  reorder: (orderedIds: string[]) => Promise<ProjectActionResult>;
  attachImage: (
    projectId: string,
    url: string,
    alt?: string | null,
  ) => Promise<ProjectActionResult>;
  removeImage: (projectId: string, imageId: string, url: string) => Promise<ProjectActionResult>;
  setCover: (projectId: string, imageId: string) => Promise<ProjectActionResult>;
  reorderImages: (projectId: string, orderedIds: string[]) => Promise<ProjectActionResult>;
}
