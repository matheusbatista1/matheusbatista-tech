import "@/presentation/components/admin/cv/cv.css";

import { getTranslations } from "next-intl/server";

import { auth } from "@/infrastructure/auth/auth";
import { container } from "@/infrastructure/container";
import type { CVAsset } from "@/domain/entities/CVAsset";
import { LOCALES, type Locale } from "@/domain/value-objects/Locale";
import { CVManager, type CVManagerLabels } from "@/presentation/components/admin/cv/CVManager";
import { CVTips } from "@/presentation/components/admin/cv/CVTips";
import { PageHead } from "@/presentation/components/admin/shell/PageHead";

import { deleteCV, uploadCV } from "./actions";

interface AdminCVPageProps {
  params: Promise<{ locale: string }>;
}

export default async function AdminCVPage({ params }: AdminCVPageProps) {
  const { locale } = await params;
  await auth();

  const t = await getTranslations({ locale, namespace: "admin.cv" });

  const cvs = await container.useCases.listCVs.execute();
  const initialAssets = LOCALES.reduce(
    (acc, loc) => {
      acc[loc] = cvs.find((cv) => cv.locale === loc) ?? null;
      return acc;
    },
    {} as Record<Locale, CVAsset | null>,
  );

  const labels: CVManagerLabels = {
    notUploaded: t("notUploaded"),
    versionLabel: t("version", { lang: "{lang}" }),
    uploaded: t("uploaded"),
    download: t("download"),
    remove: t("remove"),
    confirmRemove: t("confirmRemove"),
    confirmRemoveMessage: t("confirmRemoveMessage", { locale: "{locale}" }),
    removedToast: t("removed_toast"),
    uploadFor: t("uploadFor", { locale: "{locale}" }),
    replaceFor: t("replaceFor", { locale: "{locale}" }),
    dropHint: t("dropHint"),
    maxSize: t("maxSize"),
    wrongFileType: t("wrongFileType"),
    tooLarge: t("tooLarge"),
    uploadedToast: t("uploaded_toast"),
  };

  return (
    <div className="admin-dashboard">
      <PageHead title={t("title")} lead={t("lead")} />

      <CVManager
        initialAssets={initialAssets}
        appLocale={locale}
        labels={labels}
        uploadAction={uploadCV}
        deleteAction={deleteCV}
      />

      <CVTips />
    </div>
  );
}
