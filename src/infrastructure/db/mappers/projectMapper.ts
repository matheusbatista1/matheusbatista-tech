import type { Project as PrismaProject } from "@prisma/client";
import type { Project, ProjectImage, ProjectPill } from "@/domain/entities/Project";
import type { LocalizedText } from "@/domain/value-objects/LocalizedText";

const VALID_PILLS: readonly ProjectPill[] = [
  "FLAGSHIP",
  "PRODUCTION",
  "INTEGRATION",
  "CASE_STUDY",
  "AI",
];

export function toProject(row: PrismaProject): Project {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    url: row.url,
    liveUrl: row.liveUrl,
    description: row.description as unknown as LocalizedText,
    pill: VALID_PILLS.includes(row.pill as ProjectPill) ? (row.pill as ProjectPill) : null,
    tags: row.tags,
    images: row.images as unknown as ProjectImage[],
    order: row.order,
    deployed: row.deployed,
    visible: row.visible,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}
