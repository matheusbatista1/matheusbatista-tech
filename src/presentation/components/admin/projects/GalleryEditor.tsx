"use client";

import { useId, useRef, useState, useTransition, type ChangeEvent, type DragEvent } from "react";
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";

import type { ProjectImage } from "@/domain/entities/ProjectImage";
import { useConfirm } from "@/presentation/components/admin/providers/ConfirmProvider";
import { useToast } from "@/presentation/components/admin/providers/ToastProvider";
import type { ProjectActions } from "./types";

interface GalleryEditorProps {
  projectId: string;
  images: ProjectImage[];
  coverImageUrl: string | null;
  actions: ProjectActions;
  onImagesChange: (next: ProjectImage[]) => void;
  onCoverChange: (next: string | null) => void;
  addImageLabel?: string;
  hintLabel?: string;
}

const MAX_BYTES = 5 * 1024 * 1024;

function cls(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

export function GalleryEditor({
  projectId,
  images,
  coverImageUrl,
  actions,
  onImagesChange,
  onCoverChange,
  addImageLabel = "Add image",
  hintLabel = "First image is the cover. Drag-drop multiple files at once. PNG / JPG / WebP.",
}: GalleryEditorProps) {
  const { toast } = useToast();
  const { confirm } = useConfirm();
  const inputId = useId();
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [, startMutation] = useTransition();

  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const [isDropTarget, setIsDropTarget] = useState(false);

  async function uploadOne(file: File): Promise<ProjectImage | null> {
    if (!file.type.startsWith("image/")) {
      toast({ title: `Skipped ${file.name}: not an image`, kind: "warning" });
      return null;
    }
    if (file.size > MAX_BYTES) {
      toast({ title: `Skipped ${file.name}: exceeds 5MB`, kind: "warning" });
      return null;
    }
    const fd = new FormData();
    fd.set("file", file);
    fd.set("scope", "project");
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    if (!res.ok) {
      const body = (await res.json().catch(() => ({ error: "Upload failed" }))) as {
        error?: string;
      };
      toast({ title: body.error ?? `Upload failed for ${file.name}`, kind: "error" });
      return null;
    }
    const { url } = (await res.json()) as { url: string };
    const result = await actions.attachImage(projectId, url, file.name);
    if (result.error) {
      toast({ title: result.error, kind: "error" });
      return null;
    }
    return {
      id: `tmp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      projectId,
      url,
      alt: file.name,
      order: images.length,
      isCover: false,
      createdAt: new Date(),
    };
  }

  async function handleFiles(files: FileList | File[] | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    const next: ProjectImage[] = [...images];
    try {
      for (const file of Array.from(files)) {
        const uploaded = await uploadOne(file);
        if (uploaded) {
          next.push({ ...uploaded, order: next.length });
          onImagesChange([...next]);
        }
      }
      toast({ title: "Upload complete", kind: "success" });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function onPickChange(e: ChangeEvent<HTMLInputElement>) {
    void handleFiles(e.target.files);
  }

  async function onRemove(image: ProjectImage) {
    const ok = await confirm({
      title: "Remove image?",
      message: "This deletes the image from storage and the gallery.",
      danger: true,
      confirmLabel: "Remove",
    });
    if (!ok) return;
    startMutation(async () => {
      const result = await actions.removeImage(projectId, image.id, image.url);
      if (result.error) {
        toast({ title: result.error, kind: "error" });
        return;
      }
      const next = images.filter((i) => i.id !== image.id);
      onImagesChange(next);
      if (coverImageUrl === image.url) onCoverChange(next[0]?.url ?? null);
      toast({ title: "Image removed", kind: "success" });
    });
  }

  function swap(from: number, to: number) {
    if (to < 0 || to >= images.length || from === to) return;
    const next = [...images];
    [next[from], next[to]] = [next[to]!, next[from]!];
    onImagesChange(next);
    const orderedIds = next.map((image) => image.id);
    startMutation(async () => {
      const result = await actions.reorderImages(projectId, orderedIds);
      if (result.error) toast({ title: result.error, kind: "error" });
    });
  }

  function onDragStart(e: DragEvent<HTMLDivElement>, index: number) {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = "move";
    try {
      e.dataTransfer.setData("text/plain", String(index));
    } catch {
      /* some browsers throw if dataTransfer is unavailable */
    }
  }

  function onDragOver(e: DragEvent<HTMLDivElement>, index: number) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (overIndex !== index) setOverIndex(index);
  }

  function onDragLeave() {
    setOverIndex(null);
  }

  function onDrop(e: DragEvent<HTMLDivElement>, index: number) {
    e.preventDefault();
    setOverIndex(null);
    const from = dragIndex;
    setDragIndex(null);
    if (from === null || from === index) return;
    const next = [...images];
    const [moved] = next.splice(from, 1);
    if (!moved) return;
    next.splice(index, 0, moved);
    onImagesChange(next);
    const orderedIds = next.map((image) => image.id);
    startMutation(async () => {
      const result = await actions.reorderImages(projectId, orderedIds);
      if (result.error) toast({ title: result.error, kind: "error" });
    });
  }

  function onUploadDragOver(e: DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    setIsDropTarget(true);
  }

  function onUploadDragLeave() {
    setIsDropTarget(false);
  }

  async function onUploadDrop(e: DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    setIsDropTarget(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;
    await handleFiles(files);
  }

  return (
    <div>
      <div className="admin-gallery-grid">
        {images.map((image, index) => {
          const isCover = image.url === coverImageUrl || image.isCover || index === 0;
          const tileCls = cls(
            "admin-gallery-tile",
            dragIndex === index && "is-dragging",
            overIndex === index && "is-drop-target",
          );
          return (
            <div
              key={image.id}
              className={tileCls}
              draggable
              onDragStart={(e) => onDragStart(e, index)}
              onDragOver={(e) => onDragOver(e, index)}
              onDragLeave={onDragLeave}
              onDrop={(e) => onDrop(e, index)}
            >
              <img src={image.url} alt={image.alt ?? ""} />
              {isCover && <span className="cover-badge">COVER</span>}
              <div className="ic-actions">
                <button
                  type="button"
                  aria-label="Move left"
                  title="Move left"
                  onClick={() => swap(index, index - 1)}
                  disabled={index === 0}
                  className="admin-gallery-rot-left"
                >
                  <ChevronUp size={14} />
                </button>
                <button
                  type="button"
                  aria-label="Move right"
                  title="Move right"
                  onClick={() => swap(index, index + 1)}
                  disabled={index === images.length - 1}
                  className="admin-gallery-rot-right"
                >
                  <ChevronDown size={14} />
                </button>
                <button
                  type="button"
                  aria-label="Remove image"
                  title="Remove"
                  onClick={() => onRemove(image)}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          );
        })}

        <label
          htmlFor={inputId}
          className={cls(
            "admin-gallery-upload",
            isDropTarget && "is-drop-target",
            uploading && "is-uploading",
          )}
          aria-disabled={uploading}
          onDragOver={onUploadDragOver}
          onDragLeave={onUploadDragLeave}
          onDrop={onUploadDrop}
        >
          <Plus size={20} aria-hidden="true" />
          <span>{uploading ? "Uploading…" : addImageLabel}</span>
          <input
            id={inputId}
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            onChange={onPickChange}
            disabled={uploading}
          />
        </label>
      </div>
      <p className="admin-field-hint admin-gallery-hint">{hintLabel}</p>
    </div>
  );
}
