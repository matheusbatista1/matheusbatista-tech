"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/infrastructure/auth/auth";
import { container } from "@/infrastructure/container";
import type { SocialLinkInput } from "@/domain/repositories/ISocialLinkRepository";

const SOCIAL_NETWORKS = [
  "GitHub",
  "LinkedIn",
  "X",
  "Instagram",
  "YouTube",
  "Email",
  "Behance",
  "Dribbble",
  "Other",
] as const;

const SOCIAL_ICON_KEYS = [
  "github",
  "linkedin",
  "x",
  "instagram",
  "youtube",
  "mail",
  "behance",
  "dribbble",
  "web",
] as const;

const socialPayloadSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(40, "Name too long"),
  network: z.enum(SOCIAL_NETWORKS),
  url: z
    .string()
    .trim()
    .min(1, "URL is required")
    .max(300, "URL too long")
    .url("Enter a valid URL"),
  handle: z
    .string()
    .max(120, "Handle too long")
    .nullable()
    .transform((value) => (value && value.trim() !== "" ? value.trim() : null)),
  iconKey: z.enum(SOCIAL_ICON_KEYS),
  visible: z.boolean(),
});

export type SocialPayloadInput = z.input<typeof socialPayloadSchema>;

export interface SocialActionResult {
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

function bumpRevalidation() {
  revalidatePath("/", "layout");
  revalidatePath("/admin/social");
}

export async function createSocialAction(raw: SocialPayloadInput): Promise<SocialActionResult> {
  const session = await requireSession();
  if (!session) return { error: "Not authenticated" };

  const parsed = socialPayloadSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Validation failed" };
  }

  const all = await container.repositories.social.list();
  const order = all.length;

  const input: SocialLinkInput = {
    name: parsed.data.name,
    url: parsed.data.url,
    handle: parsed.data.handle,
    iconKey: parsed.data.iconKey,
    visible: parsed.data.visible,
    order,
  };

  try {
    const created = await container.useCases.createSocialLink.execute(input);
    await container.useCases.logActivity.execute({
      action: "create",
      entity: "social",
      entityId: created.id,
      actorEmail: session.email,
      diff: { name: created.name, url: created.url, iconKey: created.iconKey },
    });
    bumpRevalidation();
    return { ok: true, id: created.id };
  } catch (error) {
    console.error("createSocialAction error", error);
    return { error: "Could not create social link." };
  }
}

export async function updateSocialAction(
  id: string,
  raw: SocialPayloadInput,
): Promise<SocialActionResult> {
  const session = await requireSession();
  if (!session) return { error: "Not authenticated" };

  const parsed = socialPayloadSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Validation failed" };
  }

  const existing = await container.repositories.social.findById(id);
  if (!existing) return { error: "Social link not found" };

  const input: SocialLinkInput = {
    name: parsed.data.name,
    url: parsed.data.url,
    handle: parsed.data.handle,
    iconKey: parsed.data.iconKey,
    visible: parsed.data.visible,
    order: existing.order,
  };

  try {
    await container.useCases.updateSocialLink.execute(id, input);
    await container.useCases.logActivity.execute({
      action: "update",
      entity: "social",
      entityId: id,
      actorEmail: session.email,
      diff: { name: input.name, url: input.url, iconKey: input.iconKey },
    });
    bumpRevalidation();
    return { ok: true, id };
  } catch (error) {
    console.error("updateSocialAction error", error);
    return { error: "Could not save changes." };
  }
}

export async function deleteSocialAction(id: string): Promise<SocialActionResult> {
  const session = await requireSession();
  if (!session) return { error: "Not authenticated" };

  try {
    await container.useCases.deleteSocialLink.execute(id);
    await container.useCases.logActivity.execute({
      action: "delete",
      entity: "social",
      entityId: id,
      actorEmail: session.email,
    });
  } catch (error) {
    console.error("deleteSocialAction error", error);
    return { error: "Could not delete social link." };
  }

  bumpRevalidation();
  return { ok: true };
}

export async function reorderSocialsAction(orderedIds: string[]): Promise<SocialActionResult> {
  const session = await requireSession();
  if (!session) return { error: "Not authenticated" };

  try {
    await container.useCases.reorderSocialLinks.execute(orderedIds, session.email);
  } catch (error) {
    console.error("reorderSocialsAction error", error);
    return { error: "Could not reorder." };
  }

  bumpRevalidation();
  return { ok: true };
}

export async function toggleSocialVisibleAction(
  id: string,
  visible: boolean,
): Promise<SocialActionResult> {
  const session = await requireSession();
  if (!session) return { error: "Not authenticated" };

  const existing = await container.repositories.social.findById(id);
  if (!existing) return { error: "Social link not found" };

  try {
    await container.useCases.updateSocialLink.execute(id, {
      name: existing.name,
      url: existing.url,
      handle: existing.handle,
      iconKey: existing.iconKey,
      visible,
      order: existing.order,
    });
    await container.useCases.logActivity.execute({
      action: "update",
      entity: "social",
      entityId: id,
      actorEmail: session.email,
      diff: { visible },
    });
  } catch (error) {
    console.error("toggleSocialVisibleAction error", error);
    return { error: "Could not update visibility." };
  }

  bumpRevalidation();
  return { ok: true };
}
