"use client";

import {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useState,
  useTransition,
  type ChangeEvent,
} from "react";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";

import type { Skill, SkillCategory } from "@/domain/entities/Skill";
import { Input } from "@/presentation/components/admin/ui/Input";
import { ColorField } from "@/presentation/components/admin/ui/ColorField";
import { useToast } from "@/presentation/components/admin/providers/ToastProvider";

import type { SkillActionResult, SkillActions, SkillPayload } from "./types";
import { IconEditor, type IconEditorValue } from "./IconEditor";

export interface SkillFormValues {
  name: string;
  key: string;
  color: string;
}

export interface SkillFormHandle {
  submit: () => void;
}

interface SkillFormProps {
  mode: "create" | "edit";
  category: SkillCategory;
  skill?: Skill;
  actions: SkillActions;
  onSubmittingChange: (submitting: boolean) => void;
  onResult: (result: SkillActionResult) => void;
}

const DEFAULT_COLOR = "#3178c6";

function defaultsFor(skill?: Skill): SkillFormValues {
  return {
    name: skill?.name ?? "",
    key: skill?.key ?? "",
    color: skill?.color ?? DEFAULT_COLOR,
  };
}

export const SkillForm = forwardRef<SkillFormHandle, SkillFormProps>(function SkillForm(
  { mode, category, skill, actions, onSubmittingChange, onResult },
  ref,
) {
  const t = useTranslations("admin.skills");
  const { toast } = useToast();
  const [, startSubmit] = useTransition();
  const [colorValue, setColorValue] = useState<string>(skill?.color ?? DEFAULT_COLOR);
  const [iconState, setIconState] = useState<IconEditorValue>({
    iconUrl: skill?.iconUrl ?? null,
    iconScale: skill?.iconScale ?? 1,
    iconX: skill?.iconX ?? 0,
    iconY: skill?.iconY ?? 0,
  });

  const defaults = useMemo(() => defaultsFor(skill), [skill]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setError,
  } = useForm<SkillFormValues>({ defaultValues: defaults });

  const watchedKey = watch("key");

  useImperativeHandle(ref, () => ({
    submit() {
      void handleSubmit(onValid, onInvalid)();
    },
  }));

  function onInvalid() {
    toast({ title: t("nameRequired"), kind: "error" });
  }

  function onValid(values: SkillFormValues) {
    const trimmedName = values.name.trim();
    if (!trimmedName) {
      setError("name", { message: t("nameRequired") });
      toast({ title: t("nameRequired"), kind: "error" });
      return;
    }

    const payload: SkillPayload = {
      name: trimmedName,
      key: (values.key ?? "").trim(),
      color: colorValue && colorValue.trim() ? colorValue.trim() : null,
      iconUrl: iconState.iconUrl,
      iconScale: iconState.iconUrl ? iconState.iconScale : null,
      iconX: iconState.iconUrl ? iconState.iconX : null,
      iconY: iconState.iconUrl ? iconState.iconY : null,
    };

    onSubmittingChange(true);
    startSubmit(async () => {
      const result =
        mode === "edit" && skill
          ? await actions.update(skill.id, payload)
          : await actions.create(category, payload);
      onSubmittingChange(false);
      onResult(result);
    });
  }

  const keyRegister = register("key", { maxLength: 4 });

  function onKeyChange(event: ChangeEvent<HTMLInputElement>) {
    void keyRegister.onChange(event);
  }

  async function uploadIcon(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("scope", "skill-icon");
    const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
    if (!res.ok) {
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      throw new Error(data?.error ?? "Upload failed");
    }
    const data = (await res.json()) as { url: string };
    return data.url;
  }

  return (
    <form onSubmit={handleSubmit(onValid, onInvalid)} className="admin-skill-form" noValidate>
      <Input
        label={t("name")}
        placeholder="TypeScript"
        {...register("name", { required: t("nameRequired") })}
        error={errors.name?.message}
        autoFocus
      />
      <Input
        label={t("key")}
        placeholder="TS"
        maxLength={4}
        hint={t("keyHint")}
        {...keyRegister}
        onChange={onKeyChange}
      />
      <ColorField
        label={t("color")}
        value={colorValue}
        onChange={setColorValue}
        previewKey={watchedKey || skill?.key || ""}
      />
      <IconEditor
        value={iconState}
        swatchColor={colorValue}
        fallbackKey={watchedKey || skill?.key || ""}
        onChange={setIconState}
        onUpload={uploadIcon}
      />
    </form>
  );
});
