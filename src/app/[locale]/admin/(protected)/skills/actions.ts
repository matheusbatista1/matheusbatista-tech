"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/infrastructure/auth/auth";
import { container } from "@/infrastructure/container";
import type { SkillCategory } from "@/domain/entities/Skill";
import type { SkillInput } from "@/domain/repositories/ISkillRepository";

const CATEGORIES = ["frontend", "backend", "database", "devops", "tools"] as const;

const payloadSchema = z.object({
  name: z.string().min(1).max(80),
  key: z.string().max(4),
  color: z.string().nullable(),
  iconUrl: z.string().url().max(2048).nullable(),
  iconScale: z.number().min(0.3).max(2.5).nullable(),
  iconX: z.number().min(-100).max(100).nullable(),
  iconY: z.number().min(-100).max(100).nullable(),
});

export interface SkillActionResult {
  ok?: boolean;
  id?: string;
  error?: string;
}

export interface SkillPayload {
  name: string;
  key: string;
  color: string | null;
  iconUrl: string | null;
  iconScale: number | null;
  iconX: number | null;
  iconY: number | null;
}

interface ActiveSession {
  email: string;
}

async function requireSession(): Promise<ActiveSession | null> {
  const session = await auth();
  if (!session?.user?.email) return null;
  return { email: session.user.email };
}

function bumpRevalidation() {
  revalidatePath("/", "layout");
  revalidatePath("/admin/skills");
}

function normalizePayload(raw: SkillPayload): SkillPayload {
  const hasIcon = raw.iconUrl != null && raw.iconUrl.trim().length > 0;
  return {
    name: raw.name.trim(),
    key: raw.key.trim(),
    color: raw.color && raw.color.trim() ? raw.color.trim() : null,
    iconUrl: hasIcon ? (raw.iconUrl as string).trim() : null,
    iconScale: hasIcon ? (raw.iconScale ?? 1) : null,
    iconX: hasIcon ? (raw.iconX ?? 0) : null,
    iconY: hasIcon ? (raw.iconY ?? 0) : null,
  };
}

export async function createSkillAction(
  category: SkillCategory,
  raw: SkillPayload,
): Promise<SkillActionResult> {
  const session = await requireSession();
  if (!session) return { error: "Not authenticated" };

  if (!CATEGORIES.includes(category)) return { error: "Invalid category" };

  const parsed = payloadSchema.safeParse(normalizePayload(raw));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Validation failed" };
  }

  const existing = await container.repositories.skill.listByCategory(category);
  const order = existing.length;

  const input: SkillInput = {
    name: parsed.data.name,
    key: parsed.data.key,
    category,
    color: parsed.data.color,
    iconUrl: parsed.data.iconUrl,
    iconScale: parsed.data.iconScale,
    iconX: parsed.data.iconX,
    iconY: parsed.data.iconY,
    order,
  };

  try {
    const created = await container.useCases.createSkill.execute(input);
    await container.useCases.logActivity.execute({
      action: "create",
      entity: "skill",
      entityId: created.id,
      actorEmail: session.email,
      diff: { name: created.name, category },
    });
    bumpRevalidation();
    return { ok: true, id: created.id };
  } catch (error) {
    console.error("createSkillAction error", error);
    return { error: "Could not create skill. Key may already exist." };
  }
}

export async function updateSkillAction(id: string, raw: SkillPayload): Promise<SkillActionResult> {
  const session = await requireSession();
  if (!session) return { error: "Not authenticated" };

  const parsed = payloadSchema.safeParse(normalizePayload(raw));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Validation failed" };
  }

  const existing = await container.repositories.skill.findById(id);
  if (!existing) return { error: "Skill not found" };

  const input: SkillInput = {
    name: parsed.data.name,
    key: parsed.data.key,
    category: existing.category,
    color: parsed.data.color,
    iconUrl: parsed.data.iconUrl,
    iconScale: parsed.data.iconScale,
    iconX: parsed.data.iconX,
    iconY: parsed.data.iconY,
    order: existing.order,
  };

  try {
    await container.useCases.updateSkill.execute(id, input);
    await container.useCases.logActivity.execute({
      action: "update",
      entity: "skill",
      entityId: id,
      actorEmail: session.email,
      diff: { name: input.name, category: existing.category },
    });
    bumpRevalidation();
    return { ok: true, id };
  } catch (error) {
    console.error("updateSkillAction error", error);
    return { error: "Could not save changes." };
  }
}

export async function deleteSkillAction(
  id: string,
  name: string,
  category: SkillCategory,
): Promise<SkillActionResult> {
  const session = await requireSession();
  if (!session) return { error: "Not authenticated" };

  try {
    await container.useCases.deleteSkill.execute(id);
    await container.useCases.logActivity.execute({
      action: "delete",
      entity: "skill",
      entityId: id,
      actorEmail: session.email,
      diff: { name, category },
    });
  } catch (error) {
    console.error("deleteSkillAction error", error);
    return { error: "Could not delete." };
  }

  bumpRevalidation();
  return { ok: true };
}
