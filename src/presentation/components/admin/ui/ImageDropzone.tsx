"use client";

import {
  useCallback,
  useId,
  useState,
  type ChangeEvent,
  type DragEvent,
  type KeyboardEvent,
} from "react";
import { ImagePlus } from "lucide-react";

export interface ImageDropzoneProps {
  onFile: (file: File) => void;
  accept?: string;
  multiple?: boolean;
  maxSizeMb?: number;
  current?: string;
  label?: string;
  hint?: string;
  className?: string;
}

function cx(...parts: Array<string | false | undefined | null>): string {
  return parts.filter(Boolean).join(" ");
}

const MIME_WILDCARD = /^([\w.-]+)\/\*$/;

function matchesAccept(file: File, accept?: string): boolean {
  if (!accept) return true;
  const list = accept
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  if (list.length === 0) return true;

  return list.some((rule) => {
    if (rule.startsWith(".")) return file.name.toLowerCase().endsWith(rule.toLowerCase());
    const wildcard = rule.match(MIME_WILDCARD);
    if (wildcard && wildcard[1]) {
      const prefix = wildcard[1].toLowerCase();
      return file.type.toLowerCase().startsWith(`${prefix}/`);
    }
    return file.type.toLowerCase() === rule.toLowerCase();
  });
}

export function ImageDropzone({
  onFile,
  accept = "image/*",
  multiple = false,
  maxSizeMb = 5,
  current,
  label = "Drop an image here, or click to browse",
  hint,
  className,
}: ImageDropzoneProps) {
  const [isOver, setIsOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const reactId = useId();
  const inputId = `${reactId}-input`;
  const errorId = `${reactId}-error`;

  const handleFiles = useCallback(
    (files: FileList | null | undefined) => {
      if (!files || files.length === 0) return;
      const first = files[0];
      if (!first) return;
      const next: File[] = multiple ? Array.from(files) : [first];
      const maxBytes = maxSizeMb * 1024 * 1024;
      for (const file of next) {
        if (!matchesAccept(file, accept)) {
          setError(`Unsupported file type: ${file.name}`);
          return;
        }
        if (file.size > maxBytes) {
          setError(`File too large (max ${maxSizeMb} MB): ${file.name}`);
          return;
        }
      }
      setError(null);
      for (const file of next) onFile(file);
    },
    [accept, maxSizeMb, multiple, onFile],
  );

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    handleFiles(event.target.files);
    event.target.value = "";
  };

  const onDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsOver(false);
    handleFiles(event.dataTransfer.files);
  };

  const onDragOver = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    if (!isOver) setIsOver(true);
  };

  const onDragLeave = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsOver(false);
  };

  const onLabelKeyDown = (event: KeyboardEvent<HTMLLabelElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      const el = event.currentTarget.querySelector<HTMLInputElement>("input[type='file']");
      el?.click();
    }
  };

  return (
    <div className={cx("admin-dropzone-wrap", className)}>
      <label
        htmlFor={inputId}
        onKeyDown={onLabelKeyDown}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className={cx("admin-dropzone", isOver && "is-over", error && "has-error")}
      >
        {current ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={current} alt="" className="admin-dropzone-preview" />
        ) : (
          <span className="admin-dropzone-icon" aria-hidden="true">
            <ImagePlus size={20} />
          </span>
        )}
        <span className="admin-dropzone-text">
          <span className="admin-dropzone-label">{label}</span>
          {hint && <span className="admin-dropzone-hint">{hint}</span>}
          <span className="admin-dropzone-meta">
            Max {maxSizeMb} MB · {accept}
          </span>
        </span>
        <input
          id={inputId}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={onChange}
          aria-label={label}
          aria-describedby={error ? errorId : undefined}
          className="admin-dropzone-input"
        />
      </label>
      {error && (
        <p id={errorId} className="admin-field-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
