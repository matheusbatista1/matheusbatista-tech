"use client";

import { useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslations } from "next-intl";

import "@/presentation/components/admin/forms/forms.css";

import type { HeroContent } from "@/domain/entities/HeroContent";
import type { Locale } from "@/domain/value-objects/Locale";
import type { LocalizedText } from "@/domain/value-objects/LocalizedText";

import { Button } from "@/presentation/components/admin/ui/Button";
import { Input } from "@/presentation/components/admin/ui/Input";
import { LocaleSwitcher } from "@/presentation/components/admin/ui/LocaleSwitcher";
import { Toggle } from "@/presentation/components/admin/ui/Toggle";
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

export function HeroForm({ hero }: HeroFormProps) {
  const t = useTranslations("admin.hero");
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const defaults: HeroFormValues = {
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

  const form = useForm<HeroFormValues>({
    defaultValues: defaults,
    mode: "onSubmit",
  });

  const { register, handleSubmit, control, reset, formState } = form;

  const [greetingLocale, setGreetingLocale] = useState<Locale>("en");
  const [subtitleLocale, setSubtitleLocale] = useState<Locale>("en");
  const [taglineLocale, setTaglineLocale] = useState<Locale>("en");

  const onSubmit = handleSubmit((values) => {
    setServerError(null);
    startTransition(async () => {
      const res = await updateHeroAction(values);
      if (res.error) {
        setServerError(res.error);
        toast({ kind: "error", title: res.error });
        return;
      }
      toast({ kind: "success", title: t("saved") });
      reset(values);
    });
  });

  return (
    <form onSubmit={onSubmit} className="admin-form" noValidate>
      {/* Greeting (i18n, per-row LangTabs) */}
      <div className="admin-form-row">
        <div className="label-row">
          <span className="label-text">{t("greeting")}</span>
          <LocaleSwitcher
            value={greetingLocale}
            onValueChange={setGreetingLocale}
            aria-label={`${t("greeting")} locale`}
          />
        </div>
        <Controller
          control={control}
          name={`greeting.${greetingLocale}` as const}
          rules={{ required: true }}
          render={({ field, fieldState }) => (
            <Input
              {...field}
              key={greetingLocale}
              error={fieldState.error ? `${greetingLocale.toUpperCase()} required` : undefined}
            />
          )}
        />
      </div>

      {/* First / Last name */}
      <div className="admin-form-grid">
        <div className="admin-form-row">
          <div className="label-row">
            <span className="label-text">{t("firstName")}</span>
          </div>
          <Input
            {...register("firstName", { required: true })}
            error={formState.errors.firstName ? "Required" : undefined}
          />
        </div>
        <div className="admin-form-row">
          <div className="label-row">
            <span className="label-text">{t("lastName")}</span>
          </div>
          <Input
            {...register("lastName", { required: true })}
            error={formState.errors.lastName ? "Required" : undefined}
          />
        </div>
      </div>

      {/* Subtitle (i18n, per-row LangTabs) */}
      <div className="admin-form-row">
        <div className="label-row">
          <span className="label-text">{t("subtitle")}</span>
          <LocaleSwitcher
            value={subtitleLocale}
            onValueChange={setSubtitleLocale}
            aria-label={`${t("subtitle")} locale`}
          />
        </div>
        <Controller
          control={control}
          name={`subtitle.${subtitleLocale}` as const}
          rules={{ required: true }}
          render={({ field, fieldState }) => (
            <Input
              {...field}
              key={subtitleLocale}
              error={fieldState.error ? `${subtitleLocale.toUpperCase()} required` : undefined}
            />
          )}
        />
      </div>

      {/* Tagline (i18n, per-row LangTabs) */}
      <div className="admin-form-row">
        <div className="label-row">
          <span className="label-text">{t("tagline")}</span>
          <LocaleSwitcher
            value={taglineLocale}
            onValueChange={setTaglineLocale}
            aria-label={`${t("tagline")} locale`}
          />
        </div>
        <Controller
          control={control}
          name={`tagline.${taglineLocale}` as const}
          rules={{ required: true }}
          render={({ field, fieldState }) => (
            <Input
              {...field}
              key={taglineLocale}
              error={fieldState.error ? `${taglineLocale.toUpperCase()} required` : undefined}
            />
          )}
        />
      </div>

      {/* Available toggle */}
      <div className="admin-form-row">
        <Controller
          control={control}
          name="available"
          render={({ field }) => (
            <Toggle checked={field.value} onCheckedChange={field.onChange} label={t("available")} />
          )}
        />
      </div>

      {/* Availability words (non-i18n) */}
      <div className="admin-form-grid">
        <div className="admin-form-row">
          <div className="label-row">
            <span className="label-text">{t("availabilityPre")}</span>
          </div>
          <Input
            {...register("availabilityPre", { required: true })}
            error={formState.errors.availabilityPre ? "Required" : undefined}
          />
        </div>
        <div className="admin-form-row">
          <div className="label-row">
            <span className="label-text">{t("availabilityA")}</span>
          </div>
          <Input
            {...register("availabilityA", { required: true })}
            error={formState.errors.availabilityA ? "Required" : undefined}
          />
        </div>
        <div className="admin-form-row">
          <div className="label-row">
            <span className="label-text">{t("availabilityB")}</span>
          </div>
          <Input
            {...register("availabilityB", { required: true })}
            error={formState.errors.availabilityB ? "Required" : undefined}
          />
        </div>
      </div>

      <div className="admin-form-foot">
        {serverError && <p className="admin-form-error">{serverError}</p>}
        <Button type="button" variant="ghost" onClick={() => reset(defaults)} disabled={isPending}>
          Reset
        </Button>
        <Button type="submit" variant="primary" loading={isPending}>
          Save changes
        </Button>
      </div>
    </form>
  );
}
