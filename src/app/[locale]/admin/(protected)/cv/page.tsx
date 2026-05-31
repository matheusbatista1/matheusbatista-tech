import "@/presentation/components/admin/cv/cv.css";

import { getTranslations } from "next-intl/server";

import { auth } from "@/infrastructure/auth/auth";
import { container } from "@/infrastructure/container";
import type { CVAsset } from "@/domain/entities/CVAsset";
import { LOCALES, type Locale } from "@/domain/value-objects/Locale";
import { CVSlot, type CVSlotLabels } from "@/presentation/components/admin/cv/CVSlot";
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
  const byLocale = new Map<Locale, CVAsset>();
  for (const cv of cvs) byLocale.set(cv.locale, cv);

  return (
    <div className="admin-dashboard">
      <PageHead title={t("title")} lead={t("lead")} />

      <div className="admin-cv-grid">
        {LOCALES.map((loc) => {
          const labels: CVSlotLabels = {
            uploadFor: t("uploadFor", { locale: loc.toUpperCase() }),
            noFile: t("noFile", { locale: loc.toUpperCase() }),
            filename: t("filename"),
            size: t("size"),
            uploaded: t("uploaded"),
            remove: t("remove"),
            download: t("download"),
            wrongFileType: t("wrongFileType"),
            uploadedToast: t("uploaded_toast"),
            removedToast: t("removed_toast"),
            confirmRemove: t("confirmRemove"),
            dropHint: t("dropHint"),
            tooLarge: t("tooLarge"),
          };
          return (
            <CVSlot
              key={loc}
              locale={loc}
              current={byLocale.get(loc) ?? null}
              uploadAction={uploadCV}
              deleteAction={deleteCV}
              labels={labels}
            />
          );
        })}
      </div>

      <CVTips locale={locale} />
    </div>
  );
}
