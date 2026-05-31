"use client";

import { Download, FileText, Trash2 } from "lucide-react";
import { useTransition } from "react";

import type { CVAsset } from "@/domain/entities/CVAsset";
import type { Locale } from "@/domain/value-objects/Locale";
import { Button } from "@/presentation/components/admin/ui/Button";
import { useConfirm } from "@/presentation/components/admin/providers/ConfirmProvider";
import { useToast } from "@/presentation/components/admin/providers/ToastProvider";

export interface CVCurrentBarResult {
  ok?: boolean;
  error?: string;
}

export interface CVCurrentBarLabels {
  versionLabel: string;
  uploaded: string;
  download: string;
  remove: string;
  confirmRemove: string;
  confirmRemoveMessage: string;
  removedToast: string;
}

interface CVCurrentBarProps {
  locale: Locale;
  asset: CVAsset;
  appLocale: string;
  labels: CVCurrentBarLabels;
  deleteAction: (locale: string) => Promise<CVCurrentBarResult>;
}

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;

function formatRelative(date: Date, appLocale: string): string {
  const now = Date.now();
  const ts = new Date(date).getTime();
  const diff = ts - now;
  const abs = Math.abs(diff);
  try {
    const rtf = new Intl.RelativeTimeFormat(appLocale, { numeric: "auto" });
    if (abs < HOUR) return rtf.format(Math.round(diff / MINUTE), "minute");
    if (abs < DAY) return rtf.format(Math.round(diff / HOUR), "hour");
    if (abs < WEEK) return rtf.format(Math.round(diff / DAY), "day");
    return new Intl.DateTimeFormat(appLocale, {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(date));
  } catch {
    return new Date(date).toISOString().slice(0, 10);
  }
}

function formatSizeKb(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  return `${Math.round(bytes / 1024)} KB`;
}

export function CVCurrentBar({
  locale,
  asset,
  appLocale,
  labels,
  deleteAction,
}: CVCurrentBarProps) {
  const { toast } = useToast();
  const { confirm } = useConfirm();
  const [pending, startTransition] = useTransition();

  async function onRemove() {
    const ok = await confirm({
      title: labels.confirmRemove,
      message: labels.confirmRemoveMessage,
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
      toast({ title: labels.removedToast, kind: "info" });
    });
  }

  return (
    <div className="admin-cv-current">
      <span className="admin-cv-ficon is-uploaded is-large" aria-hidden="true">
        <FileText size={18} />
      </span>

      <div className="admin-cv-current-info">
        <span className="admin-cv-current-name" title={asset.filename}>
          {asset.filename}
        </span>
        <span className="admin-cv-current-meta">
          {formatSizeKb(asset.sizeBytes)} · {labels.versionLabel} · {labels.uploaded}{" "}
          {formatRelative(asset.createdAt, appLocale)}
        </span>
      </div>

      <div className="admin-cv-current-actions">
        <a
          href={asset.url}
          target="_blank"
          rel="noopener noreferrer"
          download={asset.filename}
          className="admin-btn admin-btn-ghost admin-btn-sm"
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
    </div>
  );
}
