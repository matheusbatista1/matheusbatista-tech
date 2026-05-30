"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { auth } from "@/infrastructure/auth/auth";
import { container } from "@/infrastructure/container";
import type { SkillInput } from "@/domain/repositories/ISkillRepository";

const CATEGORIES = ["frontend", "backend", "database", "devops", "tools"] as const;

const skillSchema = z.object({
  name: z.string().min(1).max(80),
  key: z
    .string()
    .min(1)
    .max(10)
    .regex(/^[A-Za-z0-9.#+/-]+$/, "key uses letters/numbers/.#+/-"),
  category: z.enum(CATEGORIES),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "color must be a hex like #3178c6")
    .nullable(),
  order: z.number().int().min(0),
});

export interface SkillActionState {
  ok?: boolean;
  error?: string;
}

function parseFormData(formData: FormData) {
  const colorRaw = (formData.get("color") as string)?.trim() ?? "";
  return skillSchema.safeParse({
    name: formData.get("name"),
    key: formData.get("key"),
    category: formData.get("category"),
    color: colorRaw === "" ? null : colorRaw,
    order: Number(formData.get("order") ?? 0),
  });
}

function toInput(parsed: z.infer<typeof skillSchema>): SkillInput {
  return parsed;
}

export async function createSkillAction(
  _prev: SkillActionState,
  formData: FormData,
): Promise<SkillActionState> {
  const session = await auth();
  if (!session?.user) return { error: "Not authenticated" };

  const parsed = parseFormData(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Validation failed" };
  }

  try {
    await container.useCases.createSkill.execute(toInput(parsed.data));
  } catch (error) {
    console.error("createSkillAction error", error);
    return { error: "Could not create skill. Key may already exist." };
  }

  revalidatePath("/", "layout");
  revalidatePath("/admin/skills");
  redirect("/admin/skills");
}

export async function updateSkillAction(
  id: string,
  _prev: SkillActionState,
  formData: FormData,
): Promise<SkillActionState> {
  const session = await auth();
  if (!session?.user) return { error: "Not authenticated" };

  const parsed = parseFormData(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Validation failed" };
  }

  try {
    await container.useCases.updateSkill.execute(id, toInput(parsed.data));
  } catch (error) {
    console.error("updateSkillAction error", error);
    return { error: "Could not save changes." };
  }

  revalidatePath("/", "layout");
  revalidatePath("/admin/skills");
  revalidatePath(`/admin/skills/${id}`);
  return { ok: true };
}

export async function deleteSkillAction(id: string): Promise<void> {
  const session = await auth();
  if (!session?.user) return;

  try {
    await container.useCases.deleteSkill.execute(id);
  } catch (error) {
    console.error("deleteSkillAction error", error);
    return;
  }

  revalidatePath("/", "layout");
  revalidatePath("/admin/skills");
  redirect("/admin/skills");
}
