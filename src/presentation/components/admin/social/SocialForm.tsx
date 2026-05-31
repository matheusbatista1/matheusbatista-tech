"use client";

import { forwardRef, useImperativeHandle, useMemo, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import type { SocialLink } from "@/domain/entities/SocialLink";
import { Input } from "@/presentation/components/admin/ui/Input";
import { Select } from "@/presentation/components/admin/ui/Select";
import { Toggle } from "@/presentation/components/admin/ui/Toggle";

import {
  ICON_TO_NETWORK,
  NETWORK_TO_ICON,
  SOCIAL_ICON_KEYS,
  SOCIAL_NETWORKS,
  inferNetwork,
  type SocialActionResult,
  type SocialActions,
  type SocialIconKey,
  type SocialNetwork,
  type SocialPayload,
} from "./types";

export interface SocialFormValues {
  name: string;
  network: SocialNetwork;
  url: string;
  handle: string;
  iconKey: SocialIconKey;
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
  const inferredNetwork = inferNetwork(social?.name ?? "", social?.iconKey ?? null);
  const fallbackIcon = NETWORK_TO_ICON[inferredNetwork];
  return {
    name: social?.name ?? "",
    network: inferredNetwork,
    url: social?.url ?? "",
    handle: social?.handle ?? "",
    iconKey: (social?.iconKey as SocialIconKey | undefined) ?? fallbackIcon,
    visible: social?.visible ?? true,
  };
}

export const SocialForm = forwardRef<SocialFormHandle, SocialFormProps>(function SocialForm(
  { mode, social, actions, onSubmittingChange, onResult },
  ref,
) {
  const [, startSubmit] = useTransition();
  const defaults = useMemo(() => defaultsFor(social), [social]);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<SocialFormValues>({ defaultValues: defaults });

  useImperativeHandle(ref, () => ({
    submit() {
      void handleSubmit(onValid)();
    },
  }));

  function onValid(values: SocialFormValues) {
    const trimmedHandle = values.handle.trim();
    const payload: SocialPayload = {
      name: values.name.trim(),
      network: values.network,
      url: values.url.trim(),
      handle: trimmedHandle === "" ? null : trimmedHandle,
      iconKey: values.iconKey,
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
      <Input
        label="Name"
        placeholder="GitHub"
        {...register("name", {
          required: "Name is required",
          maxLength: { value: 40, message: "Name too long" },
        })}
        error={errors.name?.message}
      />

      <Controller
        name="network"
        control={control}
        render={({ field }) => (
          <Select
            label="Network"
            value={field.value}
            onChange={(event) => {
              const next = event.target.value as SocialNetwork;
              field.onChange(next);
              // Auto-fill iconKey when network changes (user can still edit)
              const currentIcon = getValues("iconKey");
              const currentNetworkIcon = NETWORK_TO_ICON[field.value as SocialNetwork];
              if (currentIcon === currentNetworkIcon) {
                setValue("iconKey", NETWORK_TO_ICON[next], { shouldDirty: true });
              }
            }}
          >
            {SOCIAL_NETWORKS.map((network) => (
              <option key={network} value={network}>
                {network}
              </option>
            ))}
          </Select>
        )}
      />

      <Input
        label="URL"
        type="url"
        placeholder="https://github.com/matheusbatista1"
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
        label="Handle (optional)"
        placeholder="@matheusbatista1"
        {...register("handle", {
          maxLength: { value: 120, message: "Handle too long" },
        })}
        hint="Shown next to the link on the portfolio."
        error={errors.handle?.message}
      />

      <Controller
        name="iconKey"
        control={control}
        render={({ field }) => (
          <Select
            label="Icon"
            value={field.value}
            onChange={(event) => field.onChange(event.target.value as SocialIconKey)}
            hint="Auto-filled from network; override if needed."
          >
            {SOCIAL_ICON_KEYS.map((key) => (
              <option key={key} value={key}>
                {key} ({ICON_TO_NETWORK[key]})
              </option>
            ))}
          </Select>
        )}
      />

      <Controller
        name="visible"
        control={control}
        render={({ field }) => (
          <Toggle
            checked={field.value}
            onCheckedChange={field.onChange}
            label="Visible on the portfolio"
          />
        )}
      />
    </form>
  );
});
