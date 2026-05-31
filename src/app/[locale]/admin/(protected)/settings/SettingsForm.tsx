"use client";

import { RotateCcw, Save, Trash2 } from "lucide-react";
import { useMemo, useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslations } from "next-intl";

import "@/presentation/components/admin/forms/forms.css";
import "@/presentation/components/admin/settings/settings.css";

import type { SiteSettings as ContentSiteSettings } from "@/domain/repositories/IContentRepository";
import type { SiteSettings } from "@/domain/entities/SiteSettings";
import type { Locale } from "@/domain/value-objects/Locale";

import { Button } from "@/presentation/components/admin/ui/Button";
import { Card } from "@/presentation/components/admin/ui/Card";
import { ImageDropzone } from "@/presentation/components/admin/ui/ImageDropzone";
import { Input } from "@/presentation/components/admin/ui/Input";
import { LocaleSwitcher } from "@/presentation/components/admin/ui/LocaleSwitcher";
import { Select } from "@/presentation/components/admin/ui/Select";
import { Textarea } from "@/presentation/components/admin/ui/Textarea";
import { Toggle } from "@/presentation/components/admin/ui/Toggle";
import { useConfirm } from "@/presentation/components/admin/providers/ConfirmProvider";
import { useToast } from "@/presentation/components/admin/providers/ToastProvider";

import { resetAllAction, updateSettingsAction, type SettingsFormValues } from "./actions";

interface SettingsFormProps {
  initial: {
    content: ContentSiteSettings;
    settings: SiteSettings;
  };
}

function toDefaults(initial: SettingsFormProps["initial"]): SettingsFormValues {
  const { content, settings } = initial;
  const defaultLang = (
    ["en", "pt", "es"].includes(content.defaultLang) ? content.defaultLang : "en"
  ) as SettingsFormValues["defaultLang"];
  const defaultTheme = (
    ["dark", "light"].includes(content.defaultTheme) ? content.defaultTheme : "dark"
  ) as SettingsFormValues["defaultTheme"];

  return {
    defaultLang,
    defaultTheme,
    seoTitle: {
      en: settings.seoTitle?.en ?? "",
      pt: settings.seoTitle?.pt ?? "",
      es: settings.seoTitle?.es ?? "",
    },
    seoDescription: {
      en: settings.seoDescription?.en ?? "",
      pt: settings.seoDescription?.pt ?? "",
      es: settings.seoDescription?.es ?? "",
    },
    ogImageUrl: settings.ogImageUrl ?? "",
    analyticsEnabled: settings.analyticsEnabled,
    aiFeaturesEnabled: settings.aiFeaturesEnabled,
    maintenanceMode: settings.maintenanceMode,
    contactEmail: settings.contactEmail ?? "",
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
  const [ogUploading, setOgUploading] = useState(false);

  const [seoTitleLocale, setSeoTitleLocale] = useState<Locale>("en");
  const [seoDescLocale, setSeoDescLocale] = useState<Locale>("en");

  const defaults = useMemo(() => toDefaults(initial), [initial]);

  const form = useForm<SettingsFormValues>({
    defaultValues: defaults,
    mode: "onSubmit",
  });
  const { register, handleSubmit, control, reset, formState, setValue, watch } = form;

  const ogImageUrl = watch("ogImageUrl") ?? "";

  const onSubmit = handleSubmit((values) => {
    setServerError(null);
    startTransition(async () => {
      const res = await updateSettingsAction(values);
      if (res.error) {
        setServerError(res.error);
        toast({ kind: "error", title: res.error });
        return;
      }
      toast({ kind: "success", title: t("saved") });
      reset(values);
    });
  });

  async function handleOgFile(file: File) {
    setOgUploading(true);
    try {
      const fd = new FormData();
      fd.set("file", file);
      fd.set("scope", "og");
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({ error: "Upload failed" }))) as {
          error?: string;
        };
        toast({ kind: "error", title: body.error ?? "Upload failed" });
        return;
      }
      const { url } = (await res.json()) as { url: string };
      setValue("ogImageUrl", url, { shouldDirty: true });
    } catch (err) {
      console.error(err);
      toast({ kind: "error", title: "Upload failed" });
    } finally {
      setOgUploading(false);
    }
  }

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
      toast({ kind: "success", title: t("resetDone") });
    });
  }

  return (
    <>
      <form onSubmit={onSubmit} className="admin-settings-form" noValidate>
        {/* Preferences */}
        <Card header={{ title: t("title") }} className="admin-settings-section">
          <div className="admin-form-grid">
            <div className="admin-form-row">
              <div className="label-row">
                <span className="label-text">{t("defaultLang")}</span>
              </div>
              <Select {...register("defaultLang")}>
                <option value="en">English</option>
                <option value="pt">Português</option>
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
          </div>
        </Card>

        {/* SEO */}
        <Card header={{ title: t("seo.title") }} className="admin-settings-section">
          <div className="admin-form-row">
            <div className="label-row">
              <span className="label-text">{t("seo.seoTitle")}</span>
              <LocaleSwitcher
                value={seoTitleLocale}
                onValueChange={setSeoTitleLocale}
                aria-label={`${t("seo.seoTitle")} locale`}
              />
            </div>
            <Controller
              control={control}
              name={`seoTitle.${seoTitleLocale}` as const}
              render={({ field }) => <Input {...field} key={seoTitleLocale} />}
            />
          </div>

          <div className="admin-form-row">
            <div className="label-row">
              <span className="label-text">{t("seo.seoDescription")}</span>
              <LocaleSwitcher
                value={seoDescLocale}
                onValueChange={setSeoDescLocale}
                aria-label={`${t("seo.seoDescription")} locale`}
              />
            </div>
            <Controller
              control={control}
              name={`seoDescription.${seoDescLocale}` as const}
              render={({ field }) => <Textarea {...field} key={seoDescLocale} rows={4} />}
            />
          </div>

          <div className="admin-form-row">
            <div className="label-row">
              <span className="label-text">{t("seo.ogImage")}</span>
              {ogImageUrl && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setValue("ogImageUrl", "", { shouldDirty: true })}
                  disabled={ogUploading}
                >
                  {tCommon("remove")}
                </Button>
              )}
            </div>
            <ImageDropzone
              onFile={handleOgFile}
              accept="image/png,image/jpeg,image/webp"
              maxSizeMb={5}
              current={ogImageUrl || undefined}
            />
          </div>
        </Card>

        {/* Features */}
        <Card header={{ title: t("toggles.title") }} className="admin-settings-section">
          <div className="admin-form-row">
            <Controller
              control={control}
              name="analyticsEnabled"
              render={({ field }) => (
                <Toggle
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  label={t("toggles.analytics")}
                />
              )}
            />
          </div>
          <div className="admin-form-row">
            <Controller
              control={control}
              name="aiFeaturesEnabled"
              render={({ field }) => (
                <Toggle
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  label={t("toggles.ai")}
                />
              )}
            />
          </div>
          <div className="admin-form-row">
            <Controller
              control={control}
              name="maintenanceMode"
              render={({ field }) => (
                <Toggle
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  label={t("toggles.maintenance")}
                />
              )}
            />
          </div>
        </Card>

        {/* Contact */}
        <Card header={{ title: t("contactEmail") }} className="admin-settings-section">
          <div className="admin-form-row">
            <Input
              type="email"
              placeholder="hello@example.com"
              {...register("contactEmail")}
              error={formState.errors.contactEmail?.message}
            />
          </div>
        </Card>

        <div className="admin-form-foot">
          {serverError && <p className="admin-form-error">{serverError}</p>}
          <Button
            type="button"
            variant="ghost"
            icon={<RotateCcw size={14} />}
            onClick={() => reset(defaults)}
            disabled={isPending}
          >
            {tCommon("cancel")}
          </Button>
          <Button type="submit" variant="primary" icon={<Save size={14} />} loading={isPending}>
            {tCommon("save")}
          </Button>
        </div>
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
          variant="danger-solid"
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
