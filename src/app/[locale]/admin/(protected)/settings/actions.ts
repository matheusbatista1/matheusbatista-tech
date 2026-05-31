"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/infrastructure/auth/auth";
import { container } from "@/infrastructure/container";

const localizedSchema = z.object({
  en: z.string(),
  pt: z.string(),
  es: z.string(),
});

const settingsSchema = z.object({
  // Legacy SiteContent.settings
  defaultLang: z.enum(["en", "pt", "es"]),
  defaultTheme: z.enum(["dark", "light"]),
  // New SiteSettings
  seoTitle: localizedSchema,
  seoDescription: localizedSchema,
  ogImageUrl: z.string().url().or(z.literal("")).nullable().optional(),
  analyticsEnabled: z.boolean(),
  aiFeaturesEnabled: z.boolean(),
  maintenanceMode: z.boolean(),
  contactEmail: z.string().email().or(z.literal("")).nullable().optional(),
});

export type SettingsFormValues = z.infer<typeof settingsSchema>;

export interface SettingsActionState {
  ok?: boolean;
  error?: string;
}

export async function updateSettingsAction(
  input: SettingsFormValues,
): Promise<SettingsActionState> {
  const session = await auth();
  if (!session?.user) return { error: "Not authenticated" };

  const parsed = settingsSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Validation failed" };
  }

  const data = parsed.data;
  const actorEmail = session.user.email ?? null;

  try {
    // 1) Legacy SiteContent.settings (defaults)
    await container.useCases.updateContentSettings.execute({
      defaultLang: data.defaultLang,
      defaultTheme: data.defaultTheme,
    });

    // 2) New SiteSettings (SEO + toggles + contact)
    await container.useCases.updateSiteSettings.execute(
      {
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
        ogImageUrl: data.ogImageUrl ? data.ogImageUrl : null,
        analyticsEnabled: data.analyticsEnabled,
        aiFeaturesEnabled: data.aiFeaturesEnabled,
        maintenanceMode: data.maintenanceMode,
        contactEmail: data.contactEmail ? data.contactEmail : null,
      },
      actorEmail,
    );

    await container.useCases.logActivity.execute({
      actorId: session.user.id ?? null,
      actorEmail,
      action: "update",
      entity: "settings",
      entityId: "singleton",
    });
  } catch (error) {
    console.error("updateSettingsAction error", error);
    return { error: "Could not save settings." };
  }

  revalidatePath("/", "layout");
  revalidatePath("/admin/settings");
  return { ok: true };
}

export async function resetAllAction(): Promise<SettingsActionState> {
  const session = await auth();
  if (!session?.user) return { error: "Not authenticated" };

  try {
    await container.useCases.resetSeed.execute(session.user.email ?? null);
  } catch (error) {
    console.error("resetAllAction error", error);
    return { error: "Could not reset data." };
  }

  revalidatePath("/", "layout");
  return { ok: true };
}
