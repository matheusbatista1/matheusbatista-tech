"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/infrastructure/auth/auth";
import { container } from "@/infrastructure/container";

const settingsSchema = z.object({
  defaultLang: z.enum(["en", "pt", "es"]),
  defaultTheme: z.enum(["dark", "light"]),
});

export interface SettingsActionState {
  ok?: boolean;
  error?: string;
}

export async function updateSettingsAction(
  _prev: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const session = await auth();
  if (!session?.user) return { error: "Not authenticated" };

  const parsed = settingsSchema.safeParse({
    defaultLang: formData.get("defaultLang"),
    defaultTheme: formData.get("defaultTheme"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Validation failed" };
  }

  try {
    await container.useCases.updateSiteSettings.execute(parsed.data);
  } catch (error) {
    console.error("updateSettingsAction error", error);
    return { error: "Could not save settings." };
  }

  revalidatePath("/", "layout");
  revalidatePath("/admin/settings");
  return { ok: true };
}
