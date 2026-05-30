"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { auth } from "@/infrastructure/auth/auth";
import { container } from "@/infrastructure/container";
import type { SocialLinkInput } from "@/domain/repositories/ISocialLinkRepository";

const socialSchema = z.object({
  name: z.string().min(1).max(40),
  url: z.string().min(1).max(300),
  handle: z.string().max(120).nullable(),
  visible: z.boolean(),
  order: z.number().int().min(0),
});

export interface SocialActionState {
  ok?: boolean;
  error?: string;
}

function parseFormData(formData: FormData) {
  const handleRaw = ((formData.get("handle") as string) ?? "").trim();
  return socialSchema.safeParse({
    name: formData.get("name"),
    url: ((formData.get("url") as string) ?? "").trim(),
    handle: handleRaw === "" ? null : handleRaw,
    visible: formData.get("visible") === "on",
    order: Number(formData.get("order") ?? 0),
  });
}

function toInput(parsed: z.infer<typeof socialSchema>): SocialLinkInput {
  return parsed;
}

export async function createSocialAction(
  _prev: SocialActionState,
  formData: FormData,
): Promise<SocialActionState> {
  const session = await auth();
  if (!session?.user) return { error: "Not authenticated" };

  const parsed = parseFormData(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Validation failed" };
  }

  try {
    await container.useCases.createSocialLink.execute(toInput(parsed.data));
  } catch (error) {
    console.error("createSocialAction error", error);
    return { error: "Could not create social link." };
  }

  revalidatePath("/", "layout");
  revalidatePath("/admin/social");
  redirect("/admin/social");
}

export async function updateSocialAction(
  id: string,
  _prev: SocialActionState,
  formData: FormData,
): Promise<SocialActionState> {
  const session = await auth();
  if (!session?.user) return { error: "Not authenticated" };

  const parsed = parseFormData(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Validation failed" };
  }

  try {
    await container.useCases.updateSocialLink.execute(id, toInput(parsed.data));
  } catch (error) {
    console.error("updateSocialAction error", error);
    return { error: "Could not save changes." };
  }

  revalidatePath("/", "layout");
  revalidatePath("/admin/social");
  revalidatePath(`/admin/social/${id}`);
  return { ok: true };
}

export async function deleteSocialAction(id: string): Promise<void> {
  const session = await auth();
  if (!session?.user) return;

  try {
    await container.useCases.deleteSocialLink.execute(id);
  } catch (error) {
    console.error("deleteSocialAction error", error);
    return;
  }

  revalidatePath("/", "layout");
  revalidatePath("/admin/social");
  redirect("/admin/social");
}
