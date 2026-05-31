"use client";

import { Upload } from "lucide-react";
import {
  useId,
  useRef,
  useState,
  useTransition,
  type ChangeEvent,
  type DragEvent,
  type KeyboardEvent,
} from "react";

import type { Locale } from "@/domain/value-objects/Locale";
import { useToast } from "@/presentation/components/admin/providers/ToastProvider";

export interface CVDropzoneResult {
  ok?: boolean;
  error?: string;
}

export interface CVDropzoneLabels {
  uploadFor: string;
  replaceFor: string;
  dropHint: string;
  maxSize: string;
  wrongFileType: string;
  tooLarge: string;
  uploadedToast: string;
}

interface CVDropzoneProps {
  locale: Locale;
  hasCurrent: boolean;
  labels: CVDropzoneLabels;
  uploadAction: (locale: string, formData: FormData) => Promise<CVDropzoneResult>;
}

const MAX_BYTES = 10 * 1024 * 1024;

export function CVDropzone({ locale, hasCurrent, labels, uploadAction }: CVDropzoneProps) {
  const { toast } = useToast();
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [pending, startTransition] = useTransition();
  const [isOver, setIsOver] = useState(false);

  function handleFile(file: File) {
    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
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
      toast({ title: labels.uploadedToast, message: file.name, kind: "success" });
    });
  }

  function onChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) handleFile(file);
    event.target.value = "";
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsOver(false);
    const file = event.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  function onDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    if (!isOver) setIsOver(true);
  }

  function onDragLeave(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsOver(false);
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      inputRef.current?.click();
    }
  }

  const title = hasCurrent ? labels.replaceFor : labels.uploadFor;

  return (
    <div
      className={`admin-cv-dropzone${isOver ? "is-drop-target" : ""}${pending ? "is-pending" : ""}`}
      role="button"
      tabIndex={0}
      aria-label={title}
      onClick={() => inputRef.current?.click()}
      onKeyDown={onKeyDown}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
    >
      <div className="admin-cv-dropzone-icon" aria-hidden="true">
        <Upload size={18} />
      </div>
      <div className="admin-cv-dropzone-title">{title}</div>
      <div className="admin-cv-dropzone-sub">{labels.dropHint}</div>
      <input
        id={inputId}
        ref={inputRef}
        type="file"
        accept="application/pdf"
        onChange={onChange}
        disabled={pending}
        className="admin-cv-dropzone-input"
      />
    </div>
  );
}
