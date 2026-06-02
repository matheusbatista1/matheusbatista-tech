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
  employerName?: string | null;
  employerUrl?: string | null;
  clientName?: string | null;
  clientUrl?: string | null;
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

function deriveLegacyImages(row: PrismaProjectWithGallery): ProjectImageLegacy[] {
  if (row.gallery && row.gallery.length > 0) {
    const sorted = [...row.gallery].sort((a, b) => a.order - b.order);
    if (row.coverImageUrl) {
      const idx = sorted.findIndex((g) => g.url === row.coverImageUrl);
      if (idx > 0) {
        const [cover] = sorted.splice(idx, 1);
        if (cover) sorted.unshift(cover);
      }
    }
    return sorted.map((g) => ({ src: g.url, alt: g.alt ?? "" }));
  }
  return (row.images as unknown as ProjectImageLegacy[]) ?? [];
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
    images: deriveLegacyImages(row),
    coverImageUrl: row.coverImageUrl ?? null,
    gallery: row.gallery?.map(toGalleryImage),
    employerName: row.employerName ?? null,
    employerUrl: row.employerUrl ?? null,
    clientName: row.clientName ?? null,
    clientUrl: row.clientUrl ?? null,
    order: row.order,
    deployed: row.deployed,
    visible: row.visible,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}
