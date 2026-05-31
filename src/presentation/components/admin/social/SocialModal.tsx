"use client";

import { useRef, useState, useTransition } from "react";
import { Trash2 } from "lucide-react";

import type { SocialLink } from "@/domain/entities/SocialLink";
import { Modal } from "@/presentation/components/admin/ui/Modal";
import { Button } from "@/presentation/components/admin/ui/Button";
import { useConfirm } from "@/presentation/components/admin/providers/ConfirmProvider";
import { useToast } from "@/presentation/components/admin/providers/ToastProvider";

import { SocialForm, type SocialFormHandle } from "./SocialForm";
import type { SocialActionResult, SocialActions } from "./types";

interface SocialModalProps {
  mode: "create" | "edit";
  social?: SocialLink;
  actions: SocialActions;
  onClose: () => void;
}

export function SocialModal({ mode, social, actions, onClose }: SocialModalProps) {
  const { toast } = useToast();
  const { confirm } = useConfirm();
  const [deleting, startDelete] = useTransition();
  const [submitting, setSubmitting] = useState(false);
  const formRef = useRef<SocialFormHandle>(null);

  const isEdit = mode === "edit" && Boolean(social);
  const title = isEdit ? `Edit ${social!.name}` : "New social link";

  async function onDelete() {
    if (!social) return;
    const ok = await confirm({
      title: "Delete link?",
      message: `“${social.name}” will be removed permanently.`,
      danger: true,
      confirmLabel: "Delete",
    });
    if (!ok) return;

    startDelete(async () => {
      const result = await actions.delete(social.id);
      if (result.error) {
        toast({ title: result.error, kind: "error" });
        return;
      }
      toast({ title: "Link deleted", kind: "success" });
      onClose();
    });
  }

  function handleSubmit() {
    formRef.current?.submit();
  }

  function handleResult(result: SocialActionResult) {
    if (result.error) {
      toast({ title: result.error, kind: "error" });
      return;
    }
    toast({ title: isEdit ? "Changes saved" : "Link created", kind: "success" });
    onClose();
  }

  const footer = (
    <div className="admin-social-modal-foot">
      {isEdit && social && (
        <Button variant="danger" icon={<Trash2 size={14} />} loading={deleting} onClick={onDelete}>
          Delete
        </Button>
      )}
      <div className="spacer" />
      <Button variant="ghost" onClick={onClose} disabled={submitting || deleting}>
        Cancel
      </Button>
      <Button variant="primary" loading={submitting} onClick={handleSubmit}>
        {isEdit ? "Save changes" : "Create link"}
      </Button>
    </div>
  );

  return (
    <Modal
      open
      onClose={() => {
        if (submitting || deleting) return;
        onClose();
      }}
      title={title}
      size="md"
      footer={footer}
    >
      <SocialForm
        ref={formRef}
        mode={mode}
        social={social}
        actions={actions}
        onSubmittingChange={setSubmitting}
        onResult={handleResult}
      />
    </Modal>
  );
}
