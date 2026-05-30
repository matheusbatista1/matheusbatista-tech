"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { auth } from "@/infrastructure/auth/auth";
import { container } from "@/infrastructure/container";
import type { ProjectInput } from "@/domain/repositories/IProjectRepository";

const PILL_VALUES = ["FLAGSHIP", "PRODUCTION", "INTEGRATION", "CASE_STUDY", "AI"] as const;

const localizedSchema = z.object({
  en: z.string().min(1, "EN description required"),
  pt: z.string().min(1, "PT description required"),
  es: z.string().min(1, "ES description required"),
});

const projectSchema = z.object({
  slug: z
    .string()
    .min(1)
    .max(80)
    .regex(/^[a-z0-9-]+$/, "slug must be lowercase letters, numbers and hyphens"),
  name: z.string().min(1).max(120),
  url: z.string().max(300).optional().nullable(),
  liveUrl: z.string().max(300).optional().nullable(),
  description: localizedSchema,
  pill: z.enum(PILL_VALUES).nullable(),
  tags: z.array(z.string().min(1).max(40)).max(10),
  order: z.number().int().min(0),
  deployed: z.boolean(),
  visible: z.boolean(),
});

export interface ProjectActionState {
  ok?: boolean;
  error?: string;
}

function parseFormData(formData: FormData) {
  const tagsRaw = (formData.get("tags") as string) ?? "";
  const tags = tagsRaw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  const pillRaw = formData.get("pill") as string;
  const pill = pillRaw === "" || pillRaw === "NONE" ? null : pillRaw;

  return projectSchema.safeParse({
    slug: formData.get("slug"),
    name: formData.get("name"),
    url: ((formData.get("url") as string) ?? "").trim() || null,
    liveUrl: ((formData.get("liveUrl") as string) ?? "").trim() || null,
    description: {
      en: formData.get("description.en"),
      pt: formData.get("description.pt"),
      es: formData.get("description.es"),
    },
    pill,
    tags,
    order: Number(formData.get("order") ?? 0),
    deployed: formData.get("deployed") === "on",
    visible: formData.get("visible") === "on",
  });
}

function toInput(parsed: z.infer<typeof projectSchema>): ProjectInput {
  return {
    slug: parsed.slug,
    name: parsed.name,
    url: parsed.url ?? null,
    liveUrl: parsed.liveUrl ?? null,
    description: parsed.description,
    pill: parsed.pill,
    tags: parsed.tags,
    images: [],
    order: parsed.order,
    deployed: parsed.deployed,
    visible: parsed.visible,
  };
}

export async function createProjectAction(
  _prev: ProjectActionState,
  formData: FormData,
): Promise<ProjectActionState> {
  const session = await auth();
  if (!session?.user) return { error: "Not authenticated" };

  const parsed = parseFormData(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Validation failed" };
  }

  try {
    await container.useCases.createProject.execute(toInput(parsed.data));
  } catch (error) {
    console.error("createProjectAction error", error);
    return { error: "Could not create project. Slug may already exist." };
  }

  revalidatePath("/", "layout");
  revalidatePath("/admin/projects");
  redirect("/admin/projects");
}

export async function updateProjectAction(
  id: string,
  _prev: ProjectActionState,
  formData: FormData,
): Promise<ProjectActionState> {
  const session = await auth();
  if (!session?.user) return { error: "Not authenticated" };

  const parsed = parseFormData(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Validation failed" };
  }

  try {
    await container.useCases.updateProject.execute(id, toInput(parsed.data));
  } catch (error) {
    console.error("updateProjectAction error", error);
    return { error: "Could not save changes." };
  }

  revalidatePath("/", "layout");
  revalidatePath("/admin/projects");
  revalidatePath(`/admin/projects/${id}`);
  return { ok: true };
}

export async function deleteProjectAction(id: string): Promise<void> {
  const session = await auth();
  if (!session?.user) return;

  try {
    await container.useCases.deleteProject.execute(id);
  } catch (error) {
    console.error("deleteProjectAction error", error);
    return;
  }

  revalidatePath("/", "layout");
  revalidatePath("/admin/projects");
  redirect("/admin/projects");
}
