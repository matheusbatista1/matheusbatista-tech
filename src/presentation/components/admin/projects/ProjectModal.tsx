"use client";

import { useRef, useState, useTransition } from "react";
import { Trash2 } from "lucide-react";

import type { Project } from "@/domain/entities/Project";
import { Modal } from "@/presentation/components/admin/ui/Modal";
import { Button } from "@/presentation/components/admin/ui/Button";
import { useConfirm } from "@/presentation/components/admin/providers/ConfirmProvider";
import { useToast } from "@/presentation/components/admin/providers/ToastProvider";
import { ProjectForm, type ProjectFormHandle } from "./ProjectForm";
import type { ProjectActions } from "./types";

interface ProjectModalProps {
  mode: "create" | "edit";
  project?: Project;
  actions: ProjectActions;
  onClose: () => void;
}

export function ProjectModal({ mode, project, actions, onClose }: ProjectModalProps) {
  const { toast } = useToast();
  const { confirm } = useConfirm();
  const [deleting, startDelete] = useTransition();
  const [submitting, setSubmitting] = useState(false);
  const formRef = useRef<ProjectFormHandle>(null);

  const isEdit = mode === "edit" && Boolean(project);
  const title = isEdit ? `Edit ${project!.name}` : "New project";

  async function onDelete() {
    if (!project) return;
    const ok = await confirm({
      title: "Delete project?",
      message: `“${project.name}” will be removed permanently.`,
      danger: true,
      confirmLabel: "Delete",
    });
    if (!ok) return;

    startDelete(async () => {
      const result = await actions.delete(project.id);
      if (result.error) {
        toast({ title: result.error, kind: "error" });
        return;
      }
      toast({ title: "Project deleted", kind: "success" });
      onClose();
    });
  }

  function handleSubmit() {
    formRef.current?.submit();
  }

  function handleResult(result: { ok?: boolean; error?: string }) {
    if (result.error) {
      toast({ title: result.error, kind: "error" });
      return;
    }
    toast({ title: isEdit ? "Changes saved" : "Project created", kind: "success" });
    onClose();
  }

  const footer = (
    <div className="admin-project-form-foot">
      {isEdit && project && (
        <Button variant="danger" icon={<Trash2 size={14} />} loading={deleting} onClick={onDelete}>
          Delete
        </Button>
      )}
      <div className="spacer" />
      <Button variant="ghost" onClick={onClose} disabled={submitting || deleting}>
        Cancel
      </Button>
      <Button variant="primary" loading={submitting} onClick={handleSubmit}>
        {isEdit ? "Save changes" : "Create project"}
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
      size="lg"
      className="admin-modal-wide"
      footer={footer}
    >
      <ProjectForm
        ref={formRef}
        project={project}
        mode={mode}
        actions={actions}
        onSubmittingChange={setSubmitting}
        onResult={handleResult}
      />
    </Modal>
  );
}
