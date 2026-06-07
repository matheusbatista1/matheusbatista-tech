"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/infrastructure/auth/auth";
import { container } from "@/infrastructure/container";

const settingsSchema = z.object({
  defaultTheme: z.enum(["dark", "light"]),
});

export type SettingsFormValues = z.infer<typeof settingsSchema>;

export interface SettingsActionState {
  ok?: boolean;
  error?: string;
}

// TODO: SEO + feature toggles + contact email moved to /admin/seo (future PR).
// updateSiteSettings use case is still registered in the container for that route.
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
    // defaultLang is no longer user-configurable (PT is the fixed site default),
    // so preserve whatever is stored instead of overwriting it.
    const current = await container.useCases.getSiteContent.execute();
    await container.useCases.updateContentSettings.execute({
      defaultLang: current.settings.defaultLang,
      defaultTheme: data.defaultTheme,
    });

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
