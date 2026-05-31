"use client";

import { Languages, RotateCcw, Save, Sparkles } from "lucide-react";
import { useCallback, useMemo, useState, useTransition } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";

import type { AboutContent } from "@/domain/entities/AboutContent";
import type { Locale } from "@/domain/value-objects/Locale";
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

  const onAiDisabled = useCallback(() => {
    toast({
      title: "AI is coming soon",
      message: "This action will be available in the next phase.",
      kind: "info",
    });
  }, [toast]);

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
              <Button
                variant="ai"
                size="sm"
                icon={<Sparkles size={14} />}
                disabled
                title="AI feature coming in next phase"
                onClick={onAiDisabled}
              >
                Improve
              </Button>
              <Button
                variant="ai"
                size="sm"
                icon={<Languages size={14} />}
                disabled
                title="AI feature coming in next phase"
                onClick={onAiDisabled}
              >
                Translate to all langs
              </Button>
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
