"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { ImagePlus, RotateCcw, Trash2 } from "lucide-react";
import { useToast } from "@/presentation/components/admin/providers/ToastProvider";

export interface IconEditorValue {
  iconUrl: string | null;
  iconScale: number;
  iconX: number;
  iconY: number;
}

interface IconEditorProps {
  value: IconEditorValue;
  swatchColor: string | null;
  fallbackKey: string;
  onChange: (next: IconEditorValue) => void;
  onUpload: (file: File) => Promise<string>;
  label?: string;
  helpText?: string;
}

const MAX_BYTES = 2 * 1024 * 1024;
const SCALE_MIN = 0.3;
const SCALE_MAX = 2.5;
const SCALE_STEP = 0.05;
const OFFSET_LIMIT = 40;

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

export function IconEditor({
  value,
  swatchColor,
  fallbackKey,
  onChange,
  onUpload,
  label = "Icon",
  helpText = "Upload a custom icon (PNG/SVG). Optional — falls back to key letters.",
}: IconEditorProps) {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [isOver, setIsOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const dragOriginRef = useRef<{
    pointerId: number;
    baseX: number;
    baseY: number;
    startX: number;
    startY: number;
  } | null>(null);
  const [dragging, setDragging] = useState(false);

  const acceptFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        toast({ title: "Only image files are allowed", kind: "error" });
        return;
      }
      if (file.size > MAX_BYTES) {
        toast({ title: "Image must be under 2 MB", kind: "error" });
        return;
      }
      setUploading(true);
      try {
        const url = await onUpload(file);
        onChange({ iconUrl: url, iconScale: 1, iconX: 0, iconY: 0 });
        toast({ title: "Icon uploaded", kind: "success" });
      } catch {
        toast({ title: "Upload failed", kind: "error" });
      } finally {
        setUploading(false);
      }
    },
    [onUpload, onChange, toast],
  );

  function onPick(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) void acceptFile(file);
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsOver(false);
    const file = event.dataTransfer.files?.[0];
    if (file) void acceptFile(file);
  }

  function onDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    if (!isOver) setIsOver(true);
  }

  function onDragLeave(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsOver(false);
  }

  function onScaleChange(event: ChangeEvent<HTMLInputElement>) {
    const next = Number.parseFloat(event.target.value);
    if (Number.isFinite(next)) {
      onChange({ ...value, iconScale: clamp(next, SCALE_MIN, SCALE_MAX) });
    }
  }

  function onReset() {
    onChange({ ...value, iconScale: 1, iconX: 0, iconY: 0 });
  }

  function onRemove() {
    onChange({ iconUrl: null, iconScale: 1, iconX: 0, iconY: 0 });
  }

  function onPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (!value.iconUrl) return;
    if (event.button !== 0) return;
    event.preventDefault();
    const target = event.currentTarget;
    target.setPointerCapture(event.pointerId);
    dragOriginRef.current = {
      pointerId: event.pointerId,
      baseX: value.iconX,
      baseY: value.iconY,
      startX: event.clientX,
      startY: event.clientY,
    };
    setDragging(true);
  }

  function onPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const origin = dragOriginRef.current;
    if (!origin || origin.pointerId !== event.pointerId) return;
    const dx = event.clientX - origin.startX;
    const dy = event.clientY - origin.startY;
    onChange({
      ...value,
      iconX: clamp(origin.baseX + dx, -OFFSET_LIMIT, OFFSET_LIMIT),
      iconY: clamp(origin.baseY + dy, -OFFSET_LIMIT, OFFSET_LIMIT),
    });
  }

  function endDrag(event: ReactPointerEvent<HTMLDivElement>) {
    const origin = dragOriginRef.current;
    if (!origin || origin.pointerId !== event.pointerId) return;
    event.currentTarget.releasePointerCapture(event.pointerId);
    dragOriginRef.current = null;
    setDragging(false);
  }

  useEffect(() => {
    return () => {
      dragOriginRef.current = null;
    };
  }, []);

  const hasIcon = Boolean(value.iconUrl);
  const transform = `translate(${value.iconX}px, ${value.iconY}px) scale(${value.iconScale})`;
  const stageBg = swatchColor && swatchColor.trim() ? swatchColor : "#1f1f24";

  return (
    <div className="admin-icon-editor">
      <div className="admin-icon-editor-head">
        <label className="admin-icon-editor-label">{label}</label>
        {helpText ? <span className="admin-icon-editor-help">{helpText}</span> : null}
      </div>
      <div className="admin-icon-editor-body">
        <div className="admin-icon-editor-stage-wrap">
          <div
            ref={stageRef}
            className={[
              "admin-icon-editor-stage",
              hasIcon ? "has-icon" : "",
              isOver ? "is-over" : "",
              dragging ? "is-dragging" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            style={{ background: stageBg }}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
          >
            {hasIcon ? (
              <img
                src={value.iconUrl ?? ""}
                alt=""
                className="admin-icon-editor-img"
                style={{ transform }}
                draggable={false}
              />
            ) : (
              <button
                type="button"
                className="admin-icon-editor-dropbtn"
                onClick={() => inputRef.current?.click()}
                disabled={uploading}
              >
                <ImagePlus size={18} aria-hidden="true" />
                <span>{uploading ? "Uploading…" : fallbackKey.toUpperCase() || "ICON"}</span>
              </button>
            )}
            <div className="admin-icon-editor-frame" aria-hidden="true" />
          </div>
          <span className="admin-icon-editor-caption">Preview = chip on the live site</span>
        </div>

        <div className="admin-icon-editor-controls">
          <div className="admin-icon-editor-row">
            <span className="admin-icon-editor-rowlbl">Scale</span>
            <input
              type="range"
              min={SCALE_MIN}
              max={SCALE_MAX}
              step={SCALE_STEP}
              value={value.iconScale}
              onChange={onScaleChange}
              disabled={!hasIcon}
              aria-label="Icon scale"
            />
            <span className="admin-icon-editor-rowval">{value.iconScale.toFixed(2)}×</span>
          </div>
          <div className="admin-icon-editor-row admin-icon-editor-coords">
            <span>
              X <strong>{Math.round(value.iconX)}</strong>
            </span>
            <span>
              Y <strong>{Math.round(value.iconY)}</strong>
            </span>
            <span className="admin-icon-editor-hint">drag preview to reposition</span>
          </div>
          <div className="admin-icon-editor-actions">
            <button
              type="button"
              className="admin-btn admin-btn-ghost admin-btn-sm"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
            >
              {hasIcon ? "Replace" : "Upload"}
            </button>
            <button
              type="button"
              className="admin-btn admin-btn-ghost admin-btn-sm"
              onClick={onReset}
              disabled={
                !hasIcon || (value.iconScale === 1 && value.iconX === 0 && value.iconY === 0)
              }
            >
              <RotateCcw size={13} aria-hidden="true" />
              Reset
            </button>
            <button
              type="button"
              className="admin-btn admin-btn-ghost admin-btn-sm admin-btn-danger"
              onClick={onRemove}
              disabled={!hasIcon}
            >
              <Trash2 size={13} aria-hidden="true" />
              Remove
            </button>
          </div>
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={onPick}
        hidden
        aria-hidden="true"
      />
    </div>
  );
}
