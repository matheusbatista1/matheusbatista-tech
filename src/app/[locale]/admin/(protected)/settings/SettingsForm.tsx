"use client";

import { RotateCcw, Save, Trash2 } from "lucide-react";
import { useMemo, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";

import "@/presentation/components/admin/forms/forms.css";
import "@/presentation/components/admin/settings/settings.css";

import type { SiteSettings as ContentSiteSettings } from "@/domain/repositories/IContentRepository";

import { Button } from "@/presentation/components/admin/ui/Button";
import { Card } from "@/presentation/components/admin/ui/Card";
import { PageHead } from "@/presentation/components/admin/shell/PageHead";
import { Select } from "@/presentation/components/admin/ui/Select";
import { useConfirm } from "@/presentation/components/admin/providers/ConfirmProvider";
import { useToast } from "@/presentation/components/admin/providers/ToastProvider";

import { resetAllAction, updateSettingsAction, type SettingsFormValues } from "./actions";

interface SettingsFormProps {
  initial: {
    content: ContentSiteSettings;
  };
}

function toDefaults(initial: SettingsFormProps["initial"]): SettingsFormValues {
  const { content } = initial;
  const defaultLang = (
    ["en", "pt", "es"].includes(content.defaultLang) ? content.defaultLang : "pt"
  ) as SettingsFormValues["defaultLang"];
  const defaultTheme = (
    ["dark", "light"].includes(content.defaultTheme) ? content.defaultTheme : "dark"
  ) as SettingsFormValues["defaultTheme"];

  return {
    defaultLang,
    defaultTheme,
  };
}

export function SettingsForm({ initial }: SettingsFormProps) {
  const t = useTranslations("admin.settings");
  const tCommon = useTranslations("admin.common");
  const { toast } = useToast();
  const { confirm } = useConfirm();
  const [isPending, startTransition] = useTransition();
  const [isResetting, startResetTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const defaults = useMemo(() => toDefaults(initial), [initial]);

  const form = useForm<SettingsFormValues>({
    defaultValues: defaults,
    mode: "onSubmit",
  });
  const { register, handleSubmit, reset, formState } = form;

  const onSubmit = handleSubmit((values) => {
    setServerError(null);
    startTransition(async () => {
      const res = await updateSettingsAction(values);
      if (res.error) {
        setServerError(res.error);
        toast({ kind: "error", title: res.error });
        return;
      }
      toast({ title: t("saved") });
      reset(values);
    });
  });

  async function handleResetAll() {
    const confirmed = await confirm({
      title: t("confirmReset"),
      message: t("confirmResetDesc"),
      danger: true,
      confirmLabel: t("reset"),
    });
    if (!confirmed) return;

    startResetTransition(async () => {
      const res = await resetAllAction();
      if (res.error) {
        toast({ kind: "error", title: res.error });
        return;
      }
      toast({ title: t("resetDone") });
    });
  }

  return (
    <>
      <PageHead
        title={t("title")}
        lead={t("lead")}
        actions={
          <>
            <Button
              type="button"
              variant="ghost"
              icon={<RotateCcw size={14} />}
              onClick={() => reset(defaults)}
              disabled={isPending || !formState.isDirty}
            >
              {tCommon("cancel")}
            </Button>
            <Button
              type="submit"
              form="admin-settings-form"
              variant="primary"
              icon={<Save size={14} />}
              loading={isPending}
            >
              {tCommon("save")}
            </Button>
          </>
        }
      />

      <form id="admin-settings-form" onSubmit={onSubmit} className="admin-settings-form" noValidate>
        <Card header={{ title: t("title") }} className="admin-settings-section">
          <div className="admin-form-row">
            <div className="label-row">
              <span className="label-text">{t("defaultLang")}</span>
            </div>
            <Select {...register("defaultLang")}>
              <option value="pt">Português</option>
              <option value="en">English</option>
              <option value="es">Español</option>
            </Select>
          </div>
          <div className="admin-form-row">
            <div className="label-row">
              <span className="label-text">{t("defaultTheme")}</span>
            </div>
            <Select {...register("defaultTheme")}>
              <option value="dark">{t("themeDark")}</option>
              <option value="light">{t("themeLight")}</option>
            </Select>
          </div>
        </Card>

        {serverError && <p className="admin-form-error">{serverError}</p>}
      </form>

      {/* Danger zone — outside the main form */}
      <Card
        header={{ title: t("dangerZone") }}
        className="admin-settings-section admin-danger-zone"
      >
        <h4>{t("reset")}</h4>
        <p>{t("resetDesc")}</p>
        <Button
          type="button"
          variant="danger"
          icon={<Trash2 size={14} />}
          onClick={handleResetAll}
          loading={isResetting}
        >
          {t("reset")}
        </Button>
      </Card>
    </>
  );
}
