"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/infrastructure/auth/auth";
import { container } from "@/infrastructure/container";
import type { AboutContent } from "@/domain/entities/AboutContent";

const localizedSchema = z.object({
  en: z.string().min(1, "EN required"),
  pt: z.string().min(1, "PT required"),
  es: z.string().min(1, "ES required"),
});

const aboutSchema = z.object({
  label: localizedSchema,
  body: localizedSchema,
  currently: localizedSchema,
  role: z.string().min(1, "Role required"),
  location: z.string().min(1, "Location required"),
  years: z.string().min(1, "Years required"),
  languages: z.string().max(120).optional().default(""),
});

export interface AboutActionState {
  ok?: boolean;
  error?: string;
}

export async function updateAboutAction(
  _prev: AboutActionState,
  formData: FormData,
): Promise<AboutActionState> {
  const session = await auth();
  if (!session?.user) return { error: "Not authenticated" };

  const parsed = aboutSchema.safeParse({
    label: {
      en: formData.get("label.en"),
      pt: formData.get("label.pt"),
      es: formData.get("label.es"),
    },
    body: {
      en: formData.get("body.en"),
      pt: formData.get("body.pt"),
      es: formData.get("body.es"),
    },
    currently: {
      en: formData.get("currently.en"),
      pt: formData.get("currently.pt"),
      es: formData.get("currently.es"),
    },
    role: formData.get("role"),
    location: formData.get("location"),
    years: formData.get("years"),
    languages: formData.get("languages") ?? "",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Validation failed" };
  }

  const about: AboutContent = {
    ...parsed.data,
    languages: parsed.data.languages?.trim() || undefined,
  };
  try {
    await container.useCases.updateAboutContent.execute(about);
    await container.useCases.logActivity.execute({
      action: "update",
      entity: "about",
      actorEmail: session.user.email ?? null,
    });
  } catch (error) {
    console.error("updateAboutAction error", error);
    return { error: "Could not save. Try again." };
  }

  revalidatePath("/", "layout");
  revalidatePath("/admin/about");
  return { ok: true };
}
