"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/infrastructure/auth/auth";
import { container } from "@/infrastructure/container";
import type { ProjectInput } from "@/domain/repositories/IProjectRepository";

const localizedSchema = z.object({
  en: z.string().min(1, "EN description required"),
  pt: z.string().min(1, "PT description required"),
  es: z.string().min(1, "ES description required"),
});

const projectSchema = z.object({
  name: z.string().min(1).max(120),
  url: z.string().max(300).nullable(),
  liveUrl: z.string().max(300).nullable(),
  description: localizedSchema,
  pill: z.string().max(40).nullable(),
  tags: z.array(z.string().min(1).max(40)).max(20),
  deployed: z.boolean(),
  visible: z.boolean(),
});

function slugifyName(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

async function uniqueSlug(base: string, ignoreId?: string): Promise<string> {
  let slug = base || "project";
  let suffix = 2;
  while (true) {
    const existing = await container.repositories.project.findBySlug(slug);
    if (!existing || existing.id === ignoreId) return slug;
    slug = `${base}-${suffix++}`;
  }
}

export interface ProjectActionResult {
  ok?: boolean;
  id?: string;
  error?: string;
}

interface ActiveSession {
  email: string;
}

async function requireSession(): Promise<ActiveSession | null> {
  const session = await auth();
  if (!session?.user?.email) return null;
  return { email: session.user.email };
}

function bumpRevalidation(id?: string) {
  revalidatePath("/", "layout");
  revalidatePath("/admin/projects");
  if (id) revalidatePath(`/admin/projects/${id}`);
}

export async function createProjectAction(
  raw: z.input<typeof projectSchema>,
): Promise<ProjectActionResult> {
  const session = await requireSession();
  if (!session) return { error: "Not authenticated" };

  const parsed = projectSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Validation failed" };
  }

  const all = await container.repositories.project.list();
  const order = all.length;

  const slug = await uniqueSlug(slugifyName(parsed.data.name));

  const input: ProjectInput = {
    ...parsed.data,
    pill: parsed.data.pill as ProjectInput["pill"],
    slug,
    images: [],
    order,
  };

  try {
    const created = await container.useCases.createProject.execute(input);
    await container.useCases.logActivity.execute({
      action: "create",
      entity: "project",
      entityId: created.id,
      actorEmail: session.email,
      diff: { slug: created.slug, name: created.name },
    });
    bumpRevalidation();
    return { ok: true, id: created.id };
  } catch (error) {
    console.error("createProjectAction error", error);
    return { error: "Could not create project." };
  }
}

export async function updateProjectAction(
  id: string,
  raw: z.input<typeof projectSchema>,
): Promise<ProjectActionResult> {
  const session = await requireSession();
  if (!session) return { error: "Not authenticated" };

  const parsed = projectSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Validation failed" };
  }

  const existing = await container.repositories.project.findById(id);
  if (!existing) return { error: "Project not found" };

  const desiredBase = slugifyName(parsed.data.name);
  const slug =
    desiredBase && desiredBase !== existing.slug
      ? await uniqueSlug(desiredBase, id)
      : existing.slug;

  const input: ProjectInput = {
    ...parsed.data,
    pill: parsed.data.pill as ProjectInput["pill"],
    slug,
    images: existing.images,
    order: existing.order,
  };

  try {
    await container.useCases.updateProject.execute(id, input);
    await container.useCases.logActivity.execute({
      action: "update",
      entity: "project",
      entityId: id,
      actorEmail: session.email,
      diff: { slug: input.slug, name: input.name },
    });
    bumpRevalidation(id);
    return { ok: true, id };
  } catch (error) {
    console.error("updateProjectAction error", error);
    return { error: "Could not save changes." };
  }
}

export async function deleteProjectAction(id: string): Promise<ProjectActionResult> {
  const session = await requireSession();
  if (!session) return { error: "Not authenticated" };

  try {
    await container.useCases.deleteProject.execute(id);
    await container.useCases.logActivity.execute({
      action: "delete",
      entity: "project",
      entityId: id,
      actorEmail: session.email,
    });
  } catch (error) {
    console.error("deleteProjectAction error", error);
    return { error: "Could not delete." };
  }

  bumpRevalidation();
  return { ok: true };
}

export async function reorderProjectsAction(orderedIds: string[]): Promise<ProjectActionResult> {
  const session = await requireSession();
  if (!session) return { error: "Not authenticated" };

  try {
    await container.useCases.reorderProjects.execute(orderedIds, session.email);
  } catch (error) {
    console.error("reorderProjectsAction error", error);
    return { error: "Could not reorder." };
  }

  bumpRevalidation();
  return { ok: true };
}

export async function attachProjectImageAction(
  projectId: string,
  url: string,
  alt?: string | null,
): Promise<ProjectActionResult> {
  const session = await requireSession();
  if (!session) return { error: "Not authenticated" };

  if (!url || !/^https?:\/\//.test(url)) return { error: "Invalid image URL" };

  try {
    const existing = await container.repositories.projectImage.listByProject(projectId);
    await container.useCases.attachProjectImage.execute(
      { projectId, url, alt: alt ?? null, order: existing.length },
      session.email,
    );
  } catch (error) {
    console.error("attachProjectImageAction error", error);
    return { error: "Could not attach image." };
  }

  bumpRevalidation(projectId);
  return { ok: true };
}

export async function removeProjectImageAction(
  projectId: string,
  imageId: string,
  url: string,
): Promise<ProjectActionResult> {
  const session = await requireSession();
  if (!session) return { error: "Not authenticated" };

  try {
    await container.useCases.removeProjectImage.execute({ imageId, url }, session.email);
  } catch (error) {
    console.error("removeProjectImageAction error", error);
    return { error: "Could not remove image." };
  }

  bumpRevalidation(projectId);
  return { ok: true };
}

export async function setProjectCoverAction(
  projectId: string,
  imageId: string,
): Promise<ProjectActionResult> {
  const session = await requireSession();
  if (!session) return { error: "Not authenticated" };

  try {
    await container.useCases.setProjectCover.execute({ projectId, imageId }, session.email);
  } catch (error) {
    console.error("setProjectCoverAction error", error);
    return { error: "Could not set cover." };
  }

  bumpRevalidation(projectId);
  return { ok: true };
}

export async function reorderProjectImagesAction(
  projectId: string,
  orderedIds: string[],
): Promise<ProjectActionResult> {
  const session = await requireSession();
  if (!session) return { error: "Not authenticated" };

  try {
    await container.useCases.reorderProjectImages.execute({ projectId, orderedIds }, session.email);
  } catch (error) {
    console.error("reorderProjectImagesAction error", error);
    return { error: "Could not reorder images." };
  }

  bumpRevalidation(projectId);
  return { ok: true };
}
