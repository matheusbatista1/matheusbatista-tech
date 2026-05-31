"use client";

import { Languages, RotateCcw, Save, Sparkles } from "lucide-react";
import { useCallback, useMemo, useState, useTransition } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";

import type { AboutContent } from "@/domain/entities/AboutContent";
import { LOCALES, type Locale } from "@/domain/value-objects/Locale";
import { AIButton } from "@/presentation/components/admin/ai/AIButton";
import { Button } from "@/presentation/components/admin/ui/Button";
import { Card } from "@/presentation/components/admin/ui/Card";
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
}

function toFormValues(about: AboutContent): AboutFormValues {
  return {
    label: { ...about.label },
    body: { ...about.body },
    currently: { ...about.currently },
    role: about.role,
    location: about.location,
    years: about.years,
  };
}

export function AboutForm({ about }: AboutFormProps) {
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

      startTransition(async () => {
        const result = await updateAboutAction({}, formData);
        if (result.error) {
          toast({ title: "Could not save", message: result.error, kind: "error" });
          return;
        }
        toast({ title: "About saved", kind: "success" });
        reset(values);
      });
    },
    [reset, toast],
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
    toast({ title: "Copy improved", kind: "success" });
  }, [activeLocale, getValues, setValue, toast]);

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
    let count = 0;
    for (const target of targets) {
      const value = data.translated?.[target];
      if (typeof value === "string" && value.length > 0) {
        setValue(`body.${target}` as const, value, { shouldDirty: true });
        count += 1;
      }
    }

    toast({
      title: "Translation ready",
      message: `${count} locale${count === 1 ? "" : "s"} translated.`,
      kind: "success",
    });
  }, [activeLocale, getValues, setValue, toast]);

  const localeUpper = activeLocale.toUpperCase();

  return (
    <form className="admin-form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <PageHead
        title="About"
        lead="Edit the personal bio shown in the About section. Switch locales to translate the i18n fields."
        actions={
          <LocaleSwitcher
            value={activeLocale}
            onValueChange={setActiveLocale}
            aria-label="Editing locale"
          />
        }
      />

      <Card padding="lg">
        <div className="admin-form-row">
          <div className="admin-form-row-head">
            <span className="admin-form-row-label">Label · {localeUpper}</span>
          </div>
          <Input
            key={`label-${activeLocale}`}
            {...register(`label.${activeLocale}` as const, { required: "Required" })}
            placeholder="About"
            error={errors.label?.[activeLocale]?.message}
          />
        </div>

        <div className="admin-form-row">
          <div className="admin-form-row-head">
            <span className="admin-form-row-label">Body · {localeUpper}</span>
            <div className="admin-form-row-actions">
              <AIButton
                onRun={runImproveCopy}
                label="Improve copy"
                icon={<Sparkles size={14} />}
                title="Rewrite this copy for clarity and tone"
              />
              <AIButton
                onRun={runTranslateAll}
                label="Translate to all langs"
                icon={<Languages size={14} />}
                title="Translate the current text to the other locales"
              />
            </div>
          </div>
          <Textarea
            key={`body-${activeLocale}`}
            rows={8}
            {...register(`body.${activeLocale}` as const, { required: "Required" })}
            placeholder="Tell visitors who you are…"
            error={errors.body?.[activeLocale]?.message}
          />
        </div>

        <div className="admin-form-row">
          <div className="admin-form-row-head">
            <span className="admin-form-row-label">Currently · {localeUpper}</span>
          </div>
          <Input
            key={`currently-${activeLocale}`}
            {...register(`currently.${activeLocale}` as const, { required: "Required" })}
            placeholder="What you are working on right now"
            error={errors.currently?.[activeLocale]?.message}
          />
        </div>

        <div className="admin-form-grid-3">
          <div className="admin-form-row">
            <span className="admin-form-row-label">Role</span>
            <Input
              {...register("role", { required: "Required" })}
              placeholder="Software Engineer"
              error={errors.role?.message}
            />
          </div>
          <div className="admin-form-row">
            <span className="admin-form-row-label">Location</span>
            <Input
              {...register("location", { required: "Required" })}
              placeholder="Remote · São Paulo"
              error={errors.location?.message}
            />
          </div>
          <div className="admin-form-row">
            <span className="admin-form-row-label">Years</span>
            <Input
              {...register("years", { required: "Required" })}
              placeholder="6+ years"
              error={errors.years?.message}
            />
          </div>
        </div>

        <div className="admin-form-foot">
          <span className="admin-form-foot-status">
            {isDirty ? "Unsaved changes" : "All changes saved"}
          </span>
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
      </Card>
    </form>
  );
}
