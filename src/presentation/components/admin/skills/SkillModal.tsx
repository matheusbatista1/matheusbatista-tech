"use client";

import { useRef, useState } from "react";
import { Save } from "lucide-react";
import { useTranslations } from "next-intl";

import type { Skill, SkillCategory } from "@/domain/entities/Skill";
import { Modal } from "@/presentation/components/admin/ui/Modal";
import { Button } from "@/presentation/components/admin/ui/Button";
import { useToast } from "@/presentation/components/admin/providers/ToastProvider";

import { SkillForm, type SkillFormHandle } from "./SkillForm";
import type { SkillActionResult, SkillActions } from "./types";

interface SkillModalProps {
  mode: "create" | "edit";
  category: SkillCategory;
  skill?: Skill;
  actions: SkillActions;
  onClose: () => void;
}

export function SkillModal({ mode, category, skill, actions, onClose }: SkillModalProps) {
  const t = useTranslations("admin.skills");
  const tCommon = useTranslations("admin.common");
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const formRef = useRef<SkillFormHandle>(null);

  const isEdit = mode === "edit" && Boolean(skill);
  const title = isEdit ? t("editSkill") : t("newSkill", { cat: t(`categories.${category}`) });

  function handleSubmit() {
    formRef.current?.submit();
  }

  function handleResult(result: SkillActionResult) {
    if (result.error) {
      toast({ title: result.error, kind: "error" });
      return;
    }
    toast({ title: isEdit ? t("updated") : t("added"), kind: "success" });
    onClose();
  }

  const footer = (
    <div className="admin-skill-form-foot">
      <Button variant="ghost" onClick={onClose} disabled={submitting}>
        {tCommon("cancel")}
      </Button>
      <Button
        variant="primary"
        icon={<Save size={14} />}
        loading={submitting}
        onClick={handleSubmit}
      >
        {tCommon("save")}
      </Button>
    </div>
  );

  return (
    <Modal
      open
      onClose={() => {
        if (submitting) return;
        onClose();
      }}
      title={title}
      size="sm"
      footer={footer}
    >
      <SkillForm
        ref={formRef}
        mode={mode}
        category={category}
        skill={skill}
        actions={actions}
        onSubmittingChange={setSubmitting}
        onResult={handleResult}
      />
    </Modal>
  );
}
