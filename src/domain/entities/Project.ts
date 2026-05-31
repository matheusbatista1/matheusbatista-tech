import type { LocalizedText } from "../value-objects/LocalizedText";
import type { ProjectImage } from "./ProjectImage";

export type ProjectPill = "FLAGSHIP" | "PRODUCTION" | "INTEGRATION" | "CASE_STUDY" | "AI";

export interface ProjectImageLegacy {
  src: string;
  alt: string;
}

export interface Project {
  id: string;
  slug: string;
  name: string;
  url: string | null;
  liveUrl: string | null;
  description: LocalizedText;
  pill: ProjectPill | null;
  tags: string[];
  images: ProjectImageLegacy[];
  coverImageUrl?: string | null;
  gallery?: ProjectImage[];
  order: number;
  deployed: boolean;
  visible: boolean;
  createdAt: Date;
  updatedAt: Date;
}
