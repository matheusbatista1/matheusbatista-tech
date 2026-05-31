"use client";

import { Mail, Reply, Sparkles, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { AIButton } from "@/presentation/components/admin/ai/AIButton";
import { Button } from "@/presentation/components/admin/ui/Button";
import { Textarea } from "@/presentation/components/admin/ui/Textarea";
import { useToast } from "@/presentation/components/admin/providers/ToastProvider";

export interface InboxServerActions {
  markRead: (formData: FormData) => Promise<void>;
  markUnread: (formData: FormData) => Promise<void>;
  delete: (formData: FormData) => Promise<void>;
}

interface MessageActionsProps {
  id: string;
  locale: string;
  email: string;
  subject: string | null;
}

export function MessageActions({ id, locale, email, subject }: MessageActionsProps) {
  const t = useTranslations("admin.inbox");
  const { toast } = useToast();

  const [draftOpen, setDraftOpen] = useState(false);
  const [draftBody, setDraftBody] = useState("");

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

    const data = (await response.json()) as { body: string };
    setDraftBody(data.body);
    setDraftOpen(true);
    toast({ title: "Draft ready", kind: "success" });
  }

  const replySubject = `Re: ${subject ?? ""}`.trim();
  const replyMailtoHref = `mailto:${email}?subject=${encodeURIComponent(replySubject)}`;
  const draftMailtoHref = `mailto:${email}?subject=${encodeURIComponent(
    replySubject,
  )}&body=${encodeURIComponent(draftBody)}`;

  return (
    <>
      <div className="admin-msg-actions" role="toolbar" aria-label={t("title")}>
        <a
          href={replyMailtoHref}
          className="admin-btn admin-btn-primary admin-btn-sm"
          aria-label={t("mailto")}
        >
          <span className="admin-btn-icon-slot">
            <Reply size={14} />
          </span>
          <span className="admin-btn-label">{t("replyViaEmail")}</span>
        </a>

        <AIButton
          onRun={runDraftReply}
          label={t("draftReply")}
          icon={<Sparkles size={14} />}
          title={t("draftReply")}
        />

        <Button variant="ghost" size="sm" onClick={() => copy(email, t("copyEmail"))}>
          {t("copyEmail")}
        </Button>
      </div>

      {draftOpen && (
        <div className="admin-ai-draft">
          <div className="admin-ai-draft-head">
            <span className="admin-ai-draft-tag">
              <Sparkles size={12} />
              {t("aiDraft")}
            </span>
            <button
              type="button"
              className="admin-ai-draft-x"
              aria-label="Close draft"
              onClick={() => setDraftOpen(false)}
            >
              <X size={14} />
            </button>
          </div>
          <Textarea
            rows={6}
            value={draftBody}
            onChange={(e) => setDraftBody(e.target.value)}
            placeholder="Draft body…"
          />
          <div className="admin-ai-draft-actions">
            <a
              href={draftMailtoHref}
              className="admin-btn admin-btn-primary admin-btn-sm"
              aria-label={t("mailto")}
            >
              <span className="admin-btn-icon-slot">
                <Mail size={14} />
              </span>
              <span className="admin-btn-label">{t("openInEmail")}</span>
            </a>
            <Button variant="ghost" size="sm" onClick={() => copy(draftBody, t("copyDraft"))}>
              {t("copyDraft")}
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
