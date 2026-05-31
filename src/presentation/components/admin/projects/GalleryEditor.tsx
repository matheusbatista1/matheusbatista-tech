"use client";

import { useId, useRef, useState, useTransition, type ChangeEvent, type DragEvent } from "react";
import { ImagePlus, Star, Trash2 } from "lucide-react";

import type { ProjectImage } from "@/domain/entities/ProjectImage";
import { IconButton } from "@/presentation/components/admin/ui/IconButton";
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
}

const MAX_BYTES = 5 * 1024 * 1024;

export function GalleryEditor({
  projectId,
  images,
  coverImageUrl,
  actions,
  onImagesChange,
  onCoverChange,
}: GalleryEditorProps) {
  const { toast } = useToast();
  const { confirm } = useConfirm();
  const inputId = useId();
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [, startMutation] = useTransition();

  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) {
          toast({ title: `Skipped ${file.name}: not an image`, kind: "warning" });
          continue;
        }
        if (file.size > MAX_BYTES) {
          toast({ title: `Skipped ${file.name}: exceeds 5MB`, kind: "warning" });
          continue;
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
          continue;
        }
        const { url } = (await res.json()) as { url: string };
        const result = await actions.attachImage(projectId, url, file.name);
        if (result.error) {
          toast({ title: result.error, kind: "error" });
          continue;
        }
        const optimistic: ProjectImage = {
          id: `tmp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          projectId,
          url,
          alt: file.name,
          order: images.length,
          isCover: false,
          createdAt: new Date(),
        };
        onImagesChange([...images, optimistic]);
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
      onImagesChange(images.filter((i) => i.id !== image.id));
      if (coverImageUrl === image.url) onCoverChange(null);
      toast({ title: "Image removed", kind: "success" });
    });
  }

  function onSetCover(image: ProjectImage) {
    startMutation(async () => {
      const result = await actions.setCover(projectId, image.id);
      if (result.error) {
        toast({ title: result.error, kind: "error" });
        return;
      }
      onImagesChange(images.map((i) => ({ ...i, isCover: i.id === image.id })));
      onCoverChange(image.url);
      toast({ title: "Cover updated", kind: "success" });
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
    const orderedIds = next.map((i) => i.id);
    startMutation(async () => {
      const result = await actions.reorderImages(projectId, orderedIds);
      if (result.error) toast({ title: result.error, kind: "error" });
    });
  }

  return (
    <div className="admin-gallery-editor">
      {images.map((image, index) => {
        const isCover = image.url === coverImageUrl || image.isCover;
        return (
          <div
            key={image.id}
            className={`admin-gallery-tile${dragIndex === index ? "is-dragging" : ""}${
              overIndex === index ? "is-drop-target" : ""
            }`}
            draggable
            onDragStart={(e) => onDragStart(e, index)}
            onDragOver={(e) => onDragOver(e, index)}
            onDragLeave={onDragLeave}
            onDrop={(e) => onDrop(e, index)}
          >
            <img src={image.url} alt={image.alt ?? ""} />
            {isCover && <span className="cover-badge">COVER</span>}
            <div className="actions">
              <IconButton
                aria-label="Set as cover"
                tooltip="Set as cover"
                icon={<Star size={14} />}
                onClick={() => onSetCover(image)}
                disabled={isCover}
              />
              <IconButton
                aria-label="Remove image"
                tooltip="Remove"
                icon={<Trash2 size={14} />}
                onClick={() => onRemove(image)}
              />
            </div>
          </div>
        );
      })}

      <label
        htmlFor={inputId}
        className="admin-gallery-add"
        aria-disabled={uploading ? "true" : "false"}
      >
        <ImagePlus size={20} aria-hidden="true" />
        <span>{uploading ? "Uploading…" : "Upload"}</span>
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
  );
}
