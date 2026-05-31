"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/infrastructure/auth/auth";
import { container } from "@/infrastructure/container";

async function revalidateInbox(locale: string) {
  revalidatePath(`/${locale}/admin/inbox`);
  revalidatePath(`/${locale}/admin`);
}

async function actorEmail(): Promise<string | null> {
  const session = await auth();
  return session?.user?.email ?? null;
}

export async function markReadAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  const locale = String(formData.get("locale") ?? "en");
  if (!id) return;
  await container.useCases.markMessageRead.execute(id, await actorEmail());
  await revalidateInbox(locale);
}

export async function markUnreadAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  const locale = String(formData.get("locale") ?? "en");
  if (!id) return;
  await container.useCases.markMessageUnread.execute(id, await actorEmail());
  await revalidateInbox(locale);
}

export async function markAllReadAction(formData: FormData): Promise<void> {
  const locale = String(formData.get("locale") ?? "en");
  await container.useCases.markAllMessagesRead.execute(await actorEmail());
  await revalidateInbox(locale);
}

export async function deleteMessageAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  const locale = String(formData.get("locale") ?? "en");
  if (!id) return;
  await container.useCases.deleteMessage.execute(id, await actorEmail());
  await revalidateInbox(locale);
}
