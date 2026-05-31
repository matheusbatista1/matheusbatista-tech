import type { Project as PrismaProject, ProjectImage as PrismaProjectImage } from "@prisma/client";
import type { Project, ProjectImageLegacy, ProjectPill } from "@/domain/entities/Project";
import type { ProjectImage } from "@/domain/entities/ProjectImage";
import type { LocalizedText } from "@/domain/value-objects/LocalizedText";

const VALID_PILLS: readonly ProjectPill[] = [
  "FLAGSHIP",
  "PRODUCTION",
  "INTEGRATION",
  "CASE_STUDY",
  "AI",
];

type PrismaProjectWithGallery = PrismaProject & {
  coverImageUrl?: string | null;
  gallery?: PrismaProjectImage[];
};

function toGalleryImage(row: PrismaProjectImage): ProjectImage {
  return {
    id: row.id,
    projectId: row.projectId,
    url: row.url,
    alt: row.alt,
    order: row.order,
    isCover: row.isCover,
    createdAt: row.createdAt,
  };
}

export function toProject(row: PrismaProjectWithGallery): Project {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    url: row.url,
    liveUrl: row.liveUrl,
    description: row.description as unknown as LocalizedText,
    pill: VALID_PILLS.includes(row.pill as ProjectPill) ? (row.pill as ProjectPill) : null,
    tags: row.tags,
    images: row.images as unknown as ProjectImageLegacy[],
    coverImageUrl: row.coverImageUrl ?? null,
    gallery: row.gallery?.map(toGalleryImage),
    order: row.order,
    deployed: row.deployed,
    visible: row.visible,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}
