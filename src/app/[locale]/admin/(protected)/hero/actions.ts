"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/infrastructure/auth/auth";
import { container } from "@/infrastructure/container";
import type { HeroContent } from "@/domain/entities/HeroContent";

const localizedSchema = z.object({
  en: z.string().min(1, "EN required"),
  pt: z.string().min(1, "PT required"),
  es: z.string().min(1, "ES required"),
});

const heroSchema = z.object({
  greetHello: z.string().min(1),
  greetIm: z.string().min(1),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  subtitle: localizedSchema,
  availabilityPre: z.string().min(1),
  availabilityA: z.string().min(1),
  availabilityB: z.string().min(1),
  available: z.boolean(),
  tagline: localizedSchema,
});

export interface HeroActionState {
  ok?: boolean;
  error?: string;
}

export async function updateHeroAction(
  _prev: HeroActionState,
  formData: FormData,
): Promise<HeroActionState> {
  const session = await auth();
  if (!session?.user) return { error: "Not authenticated" };

  const parsed = heroSchema.safeParse({
    greetHello: formData.get("greetHello"),
    greetIm: formData.get("greetIm"),
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    subtitle: {
      en: formData.get("subtitle.en"),
      pt: formData.get("subtitle.pt"),
      es: formData.get("subtitle.es"),
    },
    availabilityPre: formData.get("availabilityPre"),
    availabilityA: formData.get("availabilityA"),
    availabilityB: formData.get("availabilityB"),
    available: formData.get("available") === "on",
    tagline: {
      en: formData.get("tagline.en"),
      pt: formData.get("tagline.pt"),
      es: formData.get("tagline.es"),
    },
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Validation failed" };
  }

  const hero: HeroContent = parsed.data;
  try {
    await container.useCases.updateHeroContent.execute(hero);
  } catch (error) {
    console.error("updateHeroAction error", error);
    return { error: "Could not save. Try again." };
  }

  revalidatePath("/", "layout");
  revalidatePath("/admin/hero");
  return { ok: true };
}
