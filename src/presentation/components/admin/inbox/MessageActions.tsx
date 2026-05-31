"use client";

import {
  Archive,
  ArchiveRestore,
  Copy,
  Mail,
  Mailbox,
  MailOpen,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";

import { AIButton } from "@/presentation/components/admin/ai/AIButton";
import { Button } from "@/presentation/components/admin/ui/Button";
import { Input } from "@/presentation/components/admin/ui/Input";
import { Modal } from "@/presentation/components/admin/ui/Modal";
import { Textarea } from "@/presentation/components/admin/ui/Textarea";
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
  actions: InboxServerActions;
}

export function MessageActions({
  id,
  locale,
  read,
  archived,
  from,
  email,
  subject,
  actions,
}: MessageActionsProps) {
  const t = useTranslations("admin.inbox");
  const { confirm } = useConfirm();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();
  const [draftOpen, setDraftOpen] = useState(false);
  const [draftSubject, setDraftSubject] = useState("");
  const [draftBody, setDraftBody] = useState("");

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

  async function runDraftReply() {
    const response = await fetch("/api/ai/draft-reply", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ messageId: id, locale }),
    });

    if (!response.ok) {
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      throw new Error(data.error ?? `Request failed (${response.status})`);
    }

    const data = (await response.json()) as { subject: string; body: string };
    setDraftSubject(data.subject);
    setDraftBody(data.body);
    setDraftOpen(true);
    toast({ title: "Draft ready", kind: "success" });
  }

  async function copyDraft() {
    const composed = `Subject: ${draftSubject}\n\n${draftBody}`;
    await copy(composed, t("copyDraft"));
  }

  const draftMailtoHref = `mailto:${email}?subject=${encodeURIComponent(
    draftSubject,
  )}&body=${encodeURIComponent(draftBody)}`;

  const fallbackMailtoHref = `mailto:${email}?subject=${encodeURIComponent(
    `Re: ${subject ?? ""}`.trim(),
  )}`;

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

      <AIButton
        onRun={runDraftReply}
        label={t("draftReply")}
        icon={<Sparkles size={14} />}
        title={t("draftReply")}
      />

      <a
        href={fallbackMailtoHref}
        className="admin-btn admin-btn-ghost admin-btn-sm"
        aria-label={t("mailto")}
      >
        <span className="admin-btn-icon-slot">
          <Mail size={14} />
        </span>
        <span className="admin-btn-label">{t("mailto")}</span>
      </a>

      <Modal
        open={draftOpen}
        onClose={() => setDraftOpen(false)}
        title={t("draftReply")}
        size="lg"
        footer={
          <>
            <Button
              variant="ghost"
              size="sm"
              icon={<Copy size={14} />}
              onClick={() => void copyDraft()}
            >
              {t("copyDraft")}
            </Button>
            <a
              href={draftMailtoHref}
              className="admin-btn admin-btn-primary admin-btn-sm"
              aria-label={t("mailto")}
            >
              <span className="admin-btn-icon-slot">
                <Mail size={14} />
              </span>
              <span className="admin-btn-label">{t("mailto")}</span>
            </a>
            <Button variant="default" size="sm" onClick={() => setDraftOpen(false)}>
              Close
            </Button>
          </>
        }
      >
        <div className="admin-form-row">
          <span className="admin-form-row-label">Subject</span>
          <Input
            value={draftSubject}
            onChange={(e) => setDraftSubject(e.target.value)}
            placeholder="Re: ..."
          />
        </div>
        <div className="admin-form-row">
          <span className="admin-form-row-label">Body</span>
          <Textarea
            rows={10}
            value={draftBody}
            onChange={(e) => setDraftBody(e.target.value)}
            placeholder="Draft body…"
          />
        </div>
        <p className="admin-field-hint">
          Drafted for {from} &lt;{email}&gt;
        </p>
      </Modal>
    </div>
  );
}
