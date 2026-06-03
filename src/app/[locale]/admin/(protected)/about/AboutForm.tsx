"use client";

import { Languages, RotateCcw, Save, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useMemo, useState, useTransition } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";

import "@/presentation/components/admin/forms/forms.css";

import type { AboutContent } from "@/domain/entities/AboutContent";
import { LOCALES, type Locale } from "@/domain/value-objects/Locale";
import { AIButton } from "@/presentation/components/admin/ai/AIButton";
import { Button } from "@/presentation/components/admin/ui/Button";
import { Input } from "@/presentation/components/admin/ui/Input";
import { LocaleSwitcher } from "@/presentation/components/admin/ui/LocaleSwitcher";
import { Textarea } from "@/presentation/components/admin/ui/Textarea";
import { PageHead } from "@/presentation/components/admin/shell/PageHead";
import { useToast } from "@/presentation/components/admin/providers/ToastProvider";

import { updateAboutAction } from "./actions";

interface AboutFormProps {
  about: AboutContent;
}

interface AboutFormValues {
  label: { en: string; pt: string; es: string };
  body: { en: string; pt: string; es: string };
  currently: { en: string; pt: string; es: string };
  role: string;
  location: string;
  years: string;
  languages: string;
}

function toFormValues(about: AboutContent): AboutFormValues {
  return {
    label: { ...about.label },
    body: { ...about.body },
    currently: { ...about.currently },
    role: about.role,
    location: about.location,
    years: about.years,
    languages: about.languages ?? "",
  };
}

export function AboutForm({ about }: AboutFormProps) {
  const t = useTranslations("admin.about");
  const { toast } = useToast();
  const [activeLocale, setActiveLocale] = useState<Locale>("en");
  const [pending, startTransition] = useTransition();
  const defaults = useMemo(() => toFormValues(about), [about]);

  const {
    register,
    handleSubmit,
    reset,
    getValues,
    setValue,
    formState: { errors, isDirty },
  } = useForm<AboutFormValues>({
    defaultValues: defaults,
    mode: "onBlur",
  });

  const onSubmit: SubmitHandler<AboutFormValues> = useCallback(
    (values) => {
      const formData = new FormData();
      formData.set("label.en", values.label.en);
      formData.set("label.pt", values.label.pt);
      formData.set("label.es", values.label.es);
      formData.set("body.en", values.body.en);
      formData.set("body.pt", values.body.pt);
      formData.set("body.es", values.body.es);
      formData.set("currently.en", values.currently.en);
      formData.set("currently.pt", values.currently.pt);
      formData.set("currently.es", values.currently.es);
      formData.set("role", values.role);
      formData.set("location", values.location);
      formData.set("years", values.years);
      formData.set("languages", values.languages);

      startTransition(async () => {
        const result = await updateAboutAction({}, formData);
        if (result.error) {
          toast({ title: "Could not save", message: result.error, kind: "error" });
          return;
        }
        toast({ title: t("saved"), message: t("savedMessage"), kind: "success" });
        reset(values);
      });
    },
    [reset, toast, t],
  );

  const runImproveCopy = useCallback(async () => {
    const current = getValues(`body.${activeLocale}` as const);
    if (!current || current.trim().length === 0) {
      toast({ title: "Nothing to improve", message: "Write some copy first.", kind: "info" });
      return;
    }

    const response = await fetch("/api/ai/improve", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text: current, locale: activeLocale }),
    });

    if (!response.ok) {
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      throw new Error(data.error ?? `Request failed (${response.status})`);
    }

    const data = (await response.json()) as { improved: string };
    setValue(`body.${activeLocale}` as const, data.improved, { shouldDirty: true });
    toast({
      title: t("improveDone"),
      message: t("improveDoneMessage", { locale: activeLocale.toUpperCase() }),
      kind: "success",
    });
  }, [activeLocale, getValues, setValue, toast, t]);

  const runTranslateAll = useCallback(async () => {
    const current = getValues(`body.${activeLocale}` as const);
    if (!current || current.trim().length === 0) {
      toast({ title: "Nothing to translate", message: "Write some copy first.", kind: "info" });
      return;
    }

    const targets = LOCALES.filter((l) => l !== activeLocale);

    const response = await fetch("/api/ai/translate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text: current, from: activeLocale, targets }),
    });

    if (!response.ok) {
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      throw new Error(data.error ?? `Request failed (${response.status})`);
    }

    const data = (await response.json()) as { translated: Record<string, string> };
    for (const target of targets) {
      const value = data.translated?.[target];
      if (typeof value === "string" && value.length > 0) {
        setValue(`body.${target}` as const, value, { shouldDirty: true });
      }
    }

    toast({ title: t("translateDone"), kind: "success" });
  }, [activeLocale, getValues, setValue, toast, t]);

  return (
    <form className="admin-form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <PageHead
        title={t("title")}
        lead={t("lead")}
        actions={
          <LocaleSwitcher
            value={activeLocale}
            onValueChange={setActiveLocale}
            aria-label="Editing locale"
          />
        }
      />

      {/* Row 1 — Label (i18n) */}
      <div className="admin-form-row">
        <div className="label-col">
          {t("label")}
          <div className="help">{t("help.label")}</div>
        </div>
        <Input
          key={`label-${activeLocale}`}
          {...register(`label.${activeLocale}` as const, { required: "Required" })}
          placeholder="ABOUT ME"
          error={errors.label?.[activeLocale]?.message}
        />
      </div>

      {/* Row 2 — Body (i18n) + AI buttons */}
      <div className="admin-form-row">
        <div className="label-col">
          {t("body")}
          <div className="help">{t("help.body")}</div>
        </div>
        <div>
          <Textarea
            key={`body-${activeLocale}`}
            rows={5}
            {...register(`body.${activeLocale}` as const, { required: "Required" })}
            placeholder="Tell visitors who you are…"
            error={errors.body?.[activeLocale]?.message}
          />
          <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
            <AIButton
              onRun={runImproveCopy}
              label={t("improve")}
              icon={<Sparkles size={14} />}
              title={t("improve")}
            />
            <AIButton
              onRun={runTranslateAll}
              label={t("translateAll")}
              icon={<Languages size={14} />}
              title={t("translateAll")}
            />
          </div>
        </div>
      </div>

      {/* Row 3 — Currently (i18n) */}
      <div className="admin-form-row">
        <div className="label-col">
          {t("currently")}
          <div className="help">{t("help.currently")}</div>
        </div>
        <Textarea
          key={`currently-${activeLocale}`}
          rows={3}
          {...register(`currently.${activeLocale}` as const, { required: "Required" })}
          placeholder="What you are working on right now"
          error={errors.currently?.[activeLocale]?.message}
        />
      </div>

      {/* Row 4 — Profile facts (non-i18n) */}
      <div className="admin-form-row">
        <div className="label-col">
          {t("profileFacts")}
          <div className="help">{t("help.profileFacts")}</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 }}>
          <Input
            {...register("role", { required: "Required" })}
            placeholder="Software Engineer"
            error={errors.role?.message}
          />
          <Input
            {...register("location", { required: "Required" })}
            placeholder="Jandira, SP, BR"
            error={errors.location?.message}
          />
          <Input
            {...register("years", { required: "Required" })}
            placeholder="2+ years"
            error={errors.years?.message}
          />
          <Input
            {...register("languages")}
            placeholder="PT · EN · ES"
            error={errors.languages?.message}
          />
        </div>
      </div>

      <div className="admin-form-foot">
        <Button
          type="button"
          variant="ghost"
          icon={<RotateCcw size={14} />}
          disabled={!isDirty || pending}
          onClick={() => reset(defaults)}
        >
          Reset
        </Button>
        <Button
          type="submit"
          variant="primary"
          icon={<Save size={14} />}
          loading={pending}
          disabled={!isDirty}
        >
          Save
        </Button>
      </div>
    </form>
  );
}
