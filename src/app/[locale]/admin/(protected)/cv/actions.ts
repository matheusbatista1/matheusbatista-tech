"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/infrastructure/auth/auth";
import { container } from "@/infrastructure/container";
import { isLocale, type Locale } from "@/domain/value-objects/Locale";

const MAX_BYTES = 10 * 1024 * 1024;

export interface CVActionState {
  ok?: boolean;
  error?: string;
}

function revalidateCV(): void {
  revalidatePath("/", "layout");
  revalidatePath("/admin/cv");
}

export async function uploadCV(locale: string, formData: FormData): Promise<CVActionState> {
  const session = await auth();
  if (!session?.user) return { error: "Not authenticated" };

  if (!isLocale(locale)) return { error: "Invalid locale" };

  const raw = formData.get("file");
  if (!(raw instanceof File)) return { error: "No file provided" };

  if (raw.type !== "application/pdf") {
    return { error: "Only PDF files are accepted" };
  }
  if (raw.size <= 0) return { error: "Empty file" };
  if (raw.size > MAX_BYTES) {
    return { error: "File too large (max 10 MB)" };
  }

  const buffer = Buffer.from(await raw.arrayBuffer());

  try {
    await container.useCases.uploadCV.execute({
      locale: locale as Locale,
      file: buffer,
      filename: raw.name,
      sizeBytes: raw.size,
      actorEmail: session.user.email ?? null,
    });
  } catch (error) {
    console.error("uploadCV action error", error);
    return { error: "Could not upload. Try again." };
  }

  revalidateCV();
  return { ok: true };
}

export async function deleteCV(locale: string): Promise<CVActionState> {
  const session = await auth();
  if (!session?.user) return { error: "Not authenticated" };

  if (!isLocale(locale)) return { error: "Invalid locale" };

  try {
    await container.useCases.deleteCV.execute(
      { locale: locale as Locale },
      session.user.email ?? null,
    );
  } catch (error) {
    console.error("deleteCV action error", error);
    return { error: "Could not delete. Try again." };
  }

  revalidateCV();
  return { ok: true };
}
