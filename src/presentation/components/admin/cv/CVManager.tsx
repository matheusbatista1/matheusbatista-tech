"use client";

import { useState } from "react";

import type { CVAsset } from "@/domain/entities/CVAsset";
import { isLocale, type Locale, DEFAULT_LOCALE } from "@/domain/value-objects/Locale";
import { LocaleSwitcher } from "@/presentation/components/admin/ui/LocaleSwitcher";

import { CVCurrentBar, type CVCurrentBarLabels } from "./CVCurrentBar";
import { CVDropzone, type CVDropzoneLabels } from "./CVDropzone";
import { CVOverview } from "./CVOverview";

export interface CVManagerLabels {
  notUploaded: string;
  versionLabel: string;
  uploaded: string;
  download: string;
  remove: string;
  confirmRemove: string;
  confirmRemoveMessage: string;
  removedToast: string;
  uploadFor: string;
  replaceFor: string;
  dropHint: string;
  maxSize: string;
  wrongFileType: string;
  tooLarge: string;
  uploadedToast: string;
}

export interface CVActionResult {
  ok?: boolean;
  error?: string;
}

interface CVManagerProps {
  initialAssets: Record<Locale, CVAsset | null>;
  appLocale: string;
  labels: CVManagerLabels;
  uploadAction: (locale: string, formData: FormData) => Promise<CVActionResult>;
  deleteAction: (locale: string) => Promise<CVActionResult>;
}

function pickInitialLocale(appLocale: string): Locale {
  return isLocale(appLocale) ? appLocale : DEFAULT_LOCALE;
}

export function CVManager({
  initialAssets,
  appLocale,
  labels,
  uploadAction,
  deleteAction,
}: CVManagerProps) {
  const [activeLocale, setActiveLocale] = useState<Locale>(() => pickInitialLocale(appLocale));

  const current = initialAssets[activeLocale];
  const activeUpper = activeLocale.toUpperCase();

  const dropLabels: CVDropzoneLabels = {
    uploadFor: labels.uploadFor.replace("{locale}", activeUpper),
    replaceFor: labels.replaceFor.replace("{locale}", activeUpper),
    dropHint: labels.dropHint,
    maxSize: labels.maxSize,
    wrongFileType: labels.wrongFileType,
    tooLarge: labels.tooLarge,
    uploadedToast: labels.uploadedToast,
  };

  const barLabels: CVCurrentBarLabels = {
    versionLabel: labels.versionLabel.replace("{lang}", activeUpper),
    uploaded: labels.uploaded,
    download: labels.download,
    remove: labels.remove,
    confirmRemove: labels.confirmRemove,
    confirmRemoveMessage: labels.confirmRemoveMessage.replace("{locale}", activeUpper),
    removedToast: labels.removedToast,
  };

  return (
    <div className="admin-cv-manager">
      <div className="admin-cv-manager-head">
        <LocaleSwitcher
          value={activeLocale}
          onValueChange={setActiveLocale}
          aria-label="CV language"
        />
      </div>

      <CVOverview
        assets={initialAssets}
        active={activeLocale}
        notUploadedLabel={labels.notUploaded}
        onSelect={setActiveLocale}
      />

      {current && (
        <CVCurrentBar
          locale={activeLocale}
          asset={current}
          appLocale={appLocale}
          labels={barLabels}
          deleteAction={deleteAction}
        />
      )}

      <CVDropzone
        locale={activeLocale}
        hasCurrent={!!current}
        labels={dropLabels}
        uploadAction={uploadAction}
      />
    </div>
  );
}
