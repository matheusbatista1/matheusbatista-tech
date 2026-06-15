import type { LocalizedText } from "../value-objects/LocalizedText";
import type { ProjectImage } from "./ProjectImage";

export const SUGGESTED_PILLS = [
  "FLAGSHIP",
  "PRODUCTION",
  "INTEGRATION",
  "CASE_STUDY",
  "AI",
] as const;

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
  pill: string | null;
  tags: string[];
  images: ProjectImageLegacy[];
  coverImageUrl?: string | null;
  gallery?: ProjectImage[];
  employerName: string | null;
  employerUrl: string | null;
  clientName: string | null;
  clientUrl: string | null;
  order: number;
  deployed: boolean;
  visible: boolean;
  createdAt: Date;
  updatedAt: Date;
}
