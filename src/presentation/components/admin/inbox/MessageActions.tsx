"use client";

import { Archive, ArchiveRestore, Copy, Mail, Mailbox, MailOpen, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTransition } from "react";

import { Button } from "@/presentation/components/admin/ui/Button";
import { useConfirm } from "@/presentation/components/admin/providers/ConfirmProvider";
import { useToast } from "@/presentation/components/admin/providers/ToastProvider";

export interface InboxServerActions {
  markRead: (formData: FormData) => Promise<void>;
  markUnread: (formData: FormData) => Promise<void>;
  setArchived: (formData: FormData) => Promise<void>;
  delete: (formData: FormData) => Promise<void>;
}

interface MessageActionsProps {
  id: string;
  locale: string;
  read: boolean;
  archived: boolean;
  from: string;
  email: string;
  subject: string | null;
  body: string;
  actions: InboxServerActions;
}

function buildDraft(from: string, subject: string | null, body: string): string {
  const subj = subject?.trim() || body.split("\n")[0]?.slice(0, 80) || "your message";
  return `Hi ${from.split(" ")[0] ?? from},\n\nThanks for reaching out about "${subj}".\n\n— Matheus`;
}

export function MessageActions({
  id,
  locale,
  read,
  archived,
  from,
  email,
  subject,
  body,
  actions,
}: MessageActionsProps) {
  const t = useTranslations("admin.inbox");
  const { confirm } = useConfirm();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();

  function fd(extra: Record<string, string> = {}): FormData {
    const data = new FormData();
    data.set("id", id);
    data.set("locale", locale);
    for (const [k, v] of Object.entries(extra)) data.set(k, v);
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

  async function copy(value: string, label: string) {
    try {
      await navigator.clipboard.writeText(value);
      toast({ title: label, kind: "success" });
    } catch {
      toast({ title: "Copy failed", kind: "error" });
    }
  }

  const mailtoHref = `mailto:${email}?subject=${encodeURIComponent(
    `Re: ${subject ?? ""}`.trim(),
  )}&body=${encodeURIComponent(buildDraft(from, subject, body))}`;

  return (
    <div className="admin-msg-actions" role="toolbar" aria-label={t("title")}>
      {read ? (
        <Button
          variant="default"
          size="sm"
          icon={<Mailbox size={14} />}
          loading={pending}
          onClick={() => startTransition(async () => void (await actions.markUnread(fd())))}
        >
          {t("markUnread")}
        </Button>
      ) : (
        <Button
          variant="default"
          size="sm"
          icon={<MailOpen size={14} />}
          loading={pending}
          onClick={() => startTransition(async () => void (await actions.markRead(fd())))}
        >
          {t("markRead")}
        </Button>
      )}

      {archived ? (
        <Button
          variant="default"
          size="sm"
          icon={<ArchiveRestore size={14} />}
          loading={pending}
          onClick={() =>
            startTransition(async () => void (await actions.setArchived(fd({ archived: "false" }))))
          }
        >
          {t("unarchive")}
        </Button>
      ) : (
        <Button
          variant="default"
          size="sm"
          icon={<Archive size={14} />}
          loading={pending}
          onClick={() =>
            startTransition(async () => void (await actions.setArchived(fd({ archived: "true" }))))
          }
        >
          {t("archive")}
        </Button>
      )}

      <Button
        variant="danger"
        size="sm"
        icon={<Trash2 size={14} />}
        loading={pending}
        onClick={onDelete}
      >
        {t("delete")}
      </Button>

      <Button
        variant="ghost"
        size="sm"
        icon={<Copy size={14} />}
        onClick={() => copy(email, t("copyEmail"))}
      >
        {t("copyEmail")}
      </Button>

      <Button
        variant="ghost"
        size="sm"
        icon={<Copy size={14} />}
        onClick={() => copy(buildDraft(from, subject, body), t("copyDraft"))}
      >
        {t("copyDraft")}
      </Button>

      <a
        href={mailtoHref}
        className="admin-btn admin-btn-ghost admin-btn-sm"
        aria-label={t("mailto")}
      >
        <span className="admin-btn-icon-slot">
          <Mail size={14} />
        </span>
        <span className="admin-btn-label">{t("mailto")}</span>
      </a>
    </div>
  );
}
