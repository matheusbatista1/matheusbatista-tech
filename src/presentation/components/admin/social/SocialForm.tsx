"use client";

import { forwardRef, useImperativeHandle, useMemo, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import { z } from "zod";

import type { SocialLink } from "@/domain/entities/SocialLink";
import { Input } from "@/presentation/components/admin/ui/Input";
import { Select } from "@/presentation/components/admin/ui/Select";
import { Toggle } from "@/presentation/components/admin/ui/Toggle";

import {
  SOCIAL_NETWORKS,
  inferNetwork,
  type SocialActionResult,
  type SocialActions,
  type SocialNetwork,
  type SocialPayload,
} from "./types";

export interface SocialFormValues {
  network: SocialNetwork | "";
  url: string;
  handle: string;
  visible: boolean;
}

export interface SocialFormHandle {
  submit: () => void;
}

interface SocialFormProps {
  mode: "create" | "edit";
  social?: SocialLink;
  actions: SocialActions;
  onSubmittingChange: (submitting: boolean) => void;
  onResult: (result: SocialActionResult) => void;
}

const urlSchema = z
  .string()
  .trim()
  .min(1, "URL is required")
  .max(300, "URL too long")
  .url("Enter a valid URL");

function defaultsFor(social?: SocialLink): SocialFormValues {
  if (!social) {
    return { network: "", url: "", handle: "", visible: true };
  }
  return {
    network: inferNetwork(social.name, social.iconKey),
    url: social.url,
    handle: social.handle ?? "",
    visible: social.visible,
  };
}

export const SocialForm = forwardRef<SocialFormHandle, SocialFormProps>(function SocialForm(
  { mode, social, actions, onSubmittingChange, onResult },
  ref,
) {
  const t = useTranslations("admin.social");
  const [, startSubmit] = useTransition();
  const defaults = useMemo(() => defaultsFor(social), [social]);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<SocialFormValues>({ defaultValues: defaults });

  useImperativeHandle(ref, () => ({
    submit() {
      void handleSubmit(onValid)();
    },
  }));

  function onValid(values: SocialFormValues) {
    if (!values.network) {
      onResult({ error: t("networkPlaceholder") });
      return;
    }

    const trimmedHandle = values.handle.trim();
    const payload: SocialPayload = {
      network: values.network,
      url: values.url.trim(),
      handle: trimmedHandle === "" ? null : trimmedHandle,
      visible: values.visible,
    };

    onSubmittingChange(true);
    startSubmit(async () => {
      const result =
        mode === "edit" && social
          ? await actions.update(social.id, payload)
          : await actions.create(payload);
      onSubmittingChange(false);
      onResult(result);
    });
  }

  return (
    <form onSubmit={handleSubmit(onValid)} className="admin-social-form" noValidate>
      <Controller
        name="network"
        control={control}
        rules={{ required: t("networkPlaceholder") }}
        render={({ field }) => (
          <Select
            label={t("network")}
            value={field.value}
            onChange={(event) => field.onChange(event.target.value as SocialNetwork | "")}
            error={errors.network?.message}
          >
            <option value="" disabled>
              {t("networkPlaceholder")}
            </option>
            {SOCIAL_NETWORKS.map((network) => (
              <option key={network} value={network}>
                {network}
              </option>
            ))}
          </Select>
        )}
      />

      <Input
        label={t("url")}
        type="url"
        placeholder="https://..."
        {...register("url", {
          required: "URL is required",
          validate: (value) => {
            const result = urlSchema.safeParse(value);
            return result.success ? true : (result.error.issues[0]?.message ?? "Invalid URL");
          },
        })}
        error={errors.url?.message}
      />

      <Input
        label={t("handle")}
        placeholder="@matheusbatista or matheus@..."
        {...register("handle", {
          maxLength: { value: 120, message: "Handle too long" },
        })}
        hint={t("handleHelp")}
        error={errors.handle?.message}
      />

      <Controller
        name="visible"
        control={control}
        render={({ field }) => (
          <Toggle checked={field.value} onCheckedChange={field.onChange} label={t("visible")} />
        )}
      />
    </form>
  );
});
