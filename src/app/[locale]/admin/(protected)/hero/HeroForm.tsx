"use client";

import { RotateCcw, Save } from "lucide-react";
import { useMemo, useState, useTransition } from "react";
import { Controller, useForm, type SubmitHandler } from "react-hook-form";
import { useTranslations } from "next-intl";

import "@/presentation/components/admin/forms/forms.css";

import type { HeroContent } from "@/domain/entities/HeroContent";
import type { Locale } from "@/domain/value-objects/Locale";
import type { LocalizedText } from "@/domain/value-objects/LocalizedText";

import { Button } from "@/presentation/components/admin/ui/Button";
import { Input } from "@/presentation/components/admin/ui/Input";
import { LocaleSwitcher } from "@/presentation/components/admin/ui/LocaleSwitcher";
import { Toggle } from "@/presentation/components/admin/ui/Toggle";
import { TranslateAllButton } from "@/presentation/components/admin/ui/TranslateAllButton";
import { useToast } from "@/presentation/components/admin/providers/ToastProvider";

import { updateHeroAction, type HeroFormValues } from "./actions";

interface HeroFormProps {
  hero: HeroContent;
}

function fallbackLocalized(value: LocalizedText | undefined, fallback = ""): LocalizedText {
  return {
    en: value?.en ?? fallback,
    pt: value?.pt ?? fallback,
    es: value?.es ?? fallback,
  };
}

function deriveGreeting(hero: HeroContent): LocalizedText {
  if (hero.greeting) return fallbackLocalized(hero.greeting);
  // Back-compat: build initial i18n greeting from the legacy single string.
  const legacy = hero.greetHello ?? "hello";
  return { en: legacy, pt: legacy, es: legacy };
}

function toFormValues(hero: HeroContent): HeroFormValues {
  return {
    greeting: deriveGreeting(hero),
    firstName: hero.firstName,
    lastName: hero.lastName,
    subtitle: fallbackLocalized(hero.subtitle),
    tagline: fallbackLocalized(hero.tagline),
    available: hero.available,
    availabilityPre: hero.availabilityPre,
    availabilityA: hero.availabilityA,
    availabilityB: hero.availabilityB,
  };
}

export function HeroForm({ hero }: HeroFormProps) {
  const t = useTranslations();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();

  const defaults = useMemo(() => toFormValues(hero), [hero]);

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    getValues,
    setValue,
    formState: { errors, isDirty },
  } = useForm<HeroFormValues>({
    defaultValues: defaults,
    mode: "onBlur",
  });

  const [greetingLocale, setGreetingLocale] = useState<Locale>("en");
  const [subtitleLocale, setSubtitleLocale] = useState<Locale>("en");
  const [taglineLocale, setTaglineLocale] = useState<Locale>("en");

  const available = watch("available");

  const onSubmit: SubmitHandler<HeroFormValues> = (values) => {
    startTransition(async () => {
      const res = await updateHeroAction(values);
      if (res.error) {
        toast({
          kind: "error",
          title: t("admin.common.error"),
          message: res.error,
        });
        return;
      }
      toast({
        kind: "success",
        title: t("admin.hero.saved"),
        message: t("admin.hero.savedMessage"),
      });
      reset(values);
    });
  };

  return (
    <form className="admin-form" onSubmit={handleSubmit(onSubmit)} noValidate>
      {/* Greeting (i18n) */}
      <div className="admin-form-row">
        <div className="admin-form-row-label-col">
          <span className="label-text">{t("admin.hero.greeting")}</span>
          <div className="help">{t("admin.hero.help.greeting")}</div>
        </div>
        <div className="admin-form-row-field">
          <LocaleSwitcher
            value={greetingLocale}
            onValueChange={setGreetingLocale}
            aria-label={`${t("admin.hero.greeting")} locale`}
          />
          <Controller
            control={control}
            name={`greeting.${greetingLocale}` as const}
            rules={{ required: true }}
            render={({ field, fieldState }) => (
              <Input
                {...field}
                key={greetingLocale}
                placeholder="hello"
                error={fieldState.error ? `${greetingLocale.toUpperCase()} required` : undefined}
              />
            )}
          />
          <div className="admin-form-ai-row">
            <TranslateAllButton
              sourceLocale={greetingLocale}
              getSourceText={() => getValues(`greeting.${greetingLocale}` as const)}
              onTranslated={(target, value) =>
                setValue(`greeting.${target}` as const, value, { shouldDirty: true })
              }
            />
          </div>
        </div>
      </div>

      {/* Name (not i18n, two columns) */}
      <div className="admin-form-row">
        <div className="admin-form-row-label-col">
          <span className="label-text">{t("admin.hero.firstName")}</span>
          <div className="help">{t("admin.hero.help.name")}</div>
        </div>
        <div className="admin-form-row-field">
          <div className="admin-form-subgrid-2">
            <Input
              {...register("firstName", { required: true })}
              placeholder="MATHEUS"
              error={errors.firstName ? "Required" : undefined}
            />
            <Input
              {...register("lastName", { required: true })}
              placeholder="BATISTA"
              error={errors.lastName ? "Required" : undefined}
            />
          </div>
        </div>
      </div>

      {/* Subtitle (i18n) */}
      <div className="admin-form-row">
        <div className="admin-form-row-label-col">
          <span className="label-text">{t("admin.hero.subtitle")}</span>
          <div className="help">{t("admin.hero.help.subtitle")}</div>
        </div>
        <div className="admin-form-row-field">
          <LocaleSwitcher
            value={subtitleLocale}
            onValueChange={setSubtitleLocale}
            aria-label={`${t("admin.hero.subtitle")} locale`}
          />
          <Controller
            control={control}
            name={`subtitle.${subtitleLocale}` as const}
            rules={{ required: true }}
            render={({ field, fieldState }) => (
              <Input
                {...field}
                key={subtitleLocale}
                placeholder="a fullstack engineer based in Brazil"
                error={fieldState.error ? `${subtitleLocale.toUpperCase()} required` : undefined}
              />
            )}
          />
          <div className="admin-form-ai-row">
            <TranslateAllButton
              sourceLocale={subtitleLocale}
              getSourceText={() => getValues(`subtitle.${subtitleLocale}` as const)}
              onTranslated={(target, value) =>
                setValue(`subtitle.${target}` as const, value, { shouldDirty: true })
              }
            />
          </div>
        </div>
      </div>

      {/* Tagline (i18n) */}
      <div className="admin-form-row">
        <div className="admin-form-row-label-col">
          <span className="label-text">{t("admin.hero.tagline")}</span>
          <div className="help">{t("admin.hero.help.tagline")}</div>
        </div>
        <div className="admin-form-row-field">
          <LocaleSwitcher
            value={taglineLocale}
            onValueChange={setTaglineLocale}
            aria-label={`${t("admin.hero.tagline")} locale`}
          />
          <Controller
            control={control}
            name={`tagline.${taglineLocale}` as const}
            rules={{ required: true }}
            render={({ field, fieldState }) => (
              <Input
                {...field}
                key={taglineLocale}
                placeholder="Backend-focused — .NET, Node.js, APIs..."
                error={fieldState.error ? `${taglineLocale.toUpperCase()} required` : undefined}
              />
            )}
          />
          <div className="admin-form-ai-row">
            <TranslateAllButton
              sourceLocale={taglineLocale}
              getSourceText={() => getValues(`tagline.${taglineLocale}` as const)}
              onTranslated={(target, value) =>
                setValue(`tagline.${target}` as const, value, { shouldDirty: true })
              }
            />
          </div>
        </div>
      </div>

      {/* Availability */}
      <div className="admin-form-row">
        <div className="admin-form-row-label-col">
          <span className="label-text">{t("admin.hero.available")}</span>
          <div className="help">{t("admin.hero.help.availability")}</div>
        </div>
        <div className="admin-form-row-field">
          <Controller
            control={control}
            name="available"
            render={({ field }) => (
              <Toggle
                checked={field.value}
                onCheckedChange={field.onChange}
                label={t("admin.hero.showAvailability")}
              />
            )}
          />
          {available && (
            <div className="admin-form-subgrid-3">
              <Input
                {...register("availabilityPre", { required: true })}
                placeholder="Available for"
                error={errors.availabilityPre ? "Required" : undefined}
              />
              <Input
                {...register("availabilityA", { required: true })}
                placeholder="roles"
                error={errors.availabilityA ? "Required" : undefined}
              />
              <Input
                {...register("availabilityB", { required: true })}
                placeholder="projects."
                error={errors.availabilityB ? "Required" : undefined}
              />
            </div>
          )}
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
