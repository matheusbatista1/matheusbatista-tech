"use client";

import { Eye, EyeOff, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTransition } from "react";

import { IconButton } from "@/presentation/components/admin/ui/IconButton";
import { useConfirm } from "@/presentation/components/admin/providers/ConfirmProvider";
import type { InboxServerActions } from "./MessageActions";

interface MessageHeadActionsProps {
  id: string;
  locale: string;
  read: boolean;
  actions: InboxServerActions;
}

export function MessageHeadActions({ id, locale, read, actions }: MessageHeadActionsProps) {
  const t = useTranslations("admin.inbox");
  const { confirm } = useConfirm();
  const [pending, startTransition] = useTransition();

  function fd(): FormData {
    const data = new FormData();
    data.set("id", id);
    data.set("locale", locale);
    return data;
  }

  async function onDelete() {
    const ok = await confirm({
      title: t("confirmDelete"),
      message: t("confirmDeleteDesc"),
      danger: true,
      confirmLabel: t("delete"),
    });
    if (!ok) return;
    startTransition(async () => {
      await actions.delete(fd());
    });
  }

  return (
    <>
      <IconButton
        size="sm"
        aria-label={read ? t("markUnread") : t("markRead")}
        tooltip={read ? t("markUnread") : t("markRead")}
        icon={read ? <EyeOff size={14} /> : <Eye size={14} />}
        loading={pending}
        onClick={() =>
          startTransition(async () => {
            await (read ? actions.markUnread(fd()) : actions.markRead(fd()));
          })
        }
      />
      <IconButton
        size="sm"
        aria-label={t("delete")}
        tooltip={t("delete")}
        icon={<Trash2 size={14} />}
        loading={pending}
        onClick={onDelete}
      />
    </>
  );
}
