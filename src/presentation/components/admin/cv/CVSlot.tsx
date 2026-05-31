"use client";

import { Download, FileUp, Trash2 } from "lucide-react";
import {
  useId,
  useRef,
  useState,
  useTransition,
  type ChangeEvent,
  type DragEvent,
  type KeyboardEvent,
} from "react";

import type { CVAsset } from "@/domain/entities/CVAsset";
import { Button } from "@/presentation/components/admin/ui/Button";
import { Card } from "@/presentation/components/admin/ui/Card";
import { useConfirm } from "@/presentation/components/admin/providers/ConfirmProvider";
import { useToast } from "@/presentation/components/admin/providers/ToastProvider";

type SlotLocale = "en" | "pt" | "es";

export interface CVActionResult {
  ok?: boolean;
  error?: string;
}

export interface CVSlotLabels {
  uploadFor: string;
  noFile: string;
  filename: string;
  size: string;
  uploaded: string;
  remove: string;
  download: string;
  wrongFileType: string;
  uploadedToast: string;
  removedToast: string;
  confirmRemove: string;
  dropHint: string;
  tooLarge: string;
}

interface CVSlotProps {
  locale: SlotLocale;
  current: CVAsset | null;
  uploadAction: (locale: string, formData: FormData) => Promise<CVActionResult>;
  deleteAction: (locale: string) => Promise<CVActionResult>;
  labels: CVSlotLabels;
}

const MAX_BYTES = 5 * 1024 * 1024;

function formatSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${bytes} B`;
}

function formatDate(d: Date): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
    }).format(new Date(d));
  } catch {
    return new Date(d).toISOString().slice(0, 10);
  }
}

export function CVSlot({ locale, current, uploadAction, deleteAction, labels }: CVSlotProps) {
  const { toast } = useToast();
  const { confirm } = useConfirm();
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [pending, startTransition] = useTransition();
  const [isOver, setIsOver] = useState(false);

  function handleFile(file: File) {
    if (file.type !== "application/pdf") {
      toast({ title: labels.wrongFileType, kind: "error" });
      return;
    }
    if (file.size > MAX_BYTES) {
      toast({ title: labels.tooLarge, kind: "error" });
      return;
    }

    const formData = new FormData();
    formData.set("file", file);

    startTransition(async () => {
      const result = await uploadAction(locale, formData);
      if (result.error) {
        toast({ title: result.error, kind: "error" });
        return;
      }
      toast({ title: labels.uploadedToast, kind: "success" });
    });
  }

  function onChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) handleFile(file);
    event.target.value = "";
  }

  function onDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsOver(false);
    const file = event.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  function onDragOver(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    if (!isOver) setIsOver(true);
  }

  function onDragLeave(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsOver(false);
  }

  function onKeyDown(event: KeyboardEvent<HTMLLabelElement>) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      inputRef.current?.click();
    }
  }

  async function onRemove() {
    const ok = await confirm({
      title: labels.confirmRemove,
      danger: true,
      confirmLabel: labels.remove,
    });
    if (!ok) return;

    startTransition(async () => {
      const result = await deleteAction(locale);
      if (result.error) {
        toast({ title: result.error, kind: "error" });
        return;
      }
      toast({ title: labels.removedToast, kind: "success" });
    });
  }

  return (
    <Card className="admin-cv-slot" padding="md">
      <span className="locale-label">{locale.toUpperCase()}</span>

      {current ? (
        <>
          <div className="admin-cv-info">
            <span className="filename">{current.filename}</span>
            <span className="meta">
              {labels.size}: {formatSize(current.sizeBytes)}
            </span>
            <span className="meta">
              {labels.uploaded}: {formatDate(current.createdAt)}
            </span>
          </div>
          <div className="admin-cv-actions">
            <a
              href={current.url}
              target="_blank"
              rel="noopener noreferrer"
              className="admin-btn admin-btn-default admin-btn-sm"
              aria-label={labels.download}
            >
              <span className="admin-btn-icon-slot">
                <Download size={14} />
              </span>
              <span className="admin-btn-label">{labels.download}</span>
            </a>
            <Button
              variant="danger"
              size="sm"
              icon={<Trash2 size={14} />}
              loading={pending}
              onClick={onRemove}
            >
              {labels.remove}
            </Button>
          </div>
        </>
      ) : (
        <label
          htmlFor={inputId}
          className="admin-cv-dropzone"
          data-active={isOver ? "true" : "false"}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onKeyDown={onKeyDown}
          tabIndex={0}
          aria-label={labels.uploadFor}
        >
          <FileUp aria-hidden="true" />
          <span>{pending ? "…" : labels.uploadFor}</span>
          <span className="admin-cv-dropzone-hint">{labels.dropHint}</span>
          <input
            id={inputId}
            ref={inputRef}
            type="file"
            accept="application/pdf"
            onChange={onChange}
            disabled={pending}
            className="admin-cv-dropzone-input"
          />
        </label>
      )}
    </Card>
  );
}
