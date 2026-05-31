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

const heroInputSchema = z.object({
  greeting: localizedSchema,
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  subtitle: localizedSchema,
  tagline: localizedSchema,
  available: z.boolean(),
  availabilityPre: z.string().min(1),
  availabilityA: z.string().min(1),
  availabilityB: z.string().min(1),
});

export type HeroFormValues = z.infer<typeof heroInputSchema>;

export interface HeroActionState {
  ok?: boolean;
  error?: string;
}

export async function updateHeroAction(input: HeroFormValues): Promise<HeroActionState> {
  const session = await auth();
  if (!session?.user) return { error: "Not authenticated" };

  const parsed = heroInputSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Validation failed" };
  }

  const data = parsed.data;

  // Preserve legacy entity fields (greetHello / greetIm) consumed by Footer,
  // BuildPromptContext and the seed. We mirror greeting.en into greetHello so
  // back-compat readers stay fresh.
  const current = await container.useCases.getSiteContent.execute();
  const hero: HeroContent = {
    ...current.hero,
    greetHello: data.greeting.en,
    greetIm: current.hero.greetIm,
    greeting: data.greeting,
    firstName: data.firstName,
    lastName: data.lastName,
    subtitle: data.subtitle,
    tagline: data.tagline,
    available: data.available,
    availabilityPre: data.availabilityPre,
    availabilityA: data.availabilityA,
    availabilityB: data.availabilityB,
  };

  try {
    await container.useCases.updateHeroContent.execute(hero);
    await container.useCases.logActivity.execute({
      actorId: session.user.id ?? null,
      actorEmail: session.user.email ?? null,
      action: "update",
      entity: "hero",
      entityId: "singleton",
    });
  } catch (error) {
    console.error("updateHeroAction error", error);
    return { error: "Could not save. Try again." };
  }

  revalidatePath("/", "layout");
  revalidatePath("/admin/hero");
  return { ok: true };
}
