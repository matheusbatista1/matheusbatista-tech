"use client";

import { forwardRef, useImperativeHandle, useMemo, useState, useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { useTranslations } from "next-intl";

import type { Project } from "@/domain/entities/Project";
import type { ProjectImage } from "@/domain/entities/ProjectImage";
import type { Locale } from "@/domain/value-objects/Locale";
import { AIButton } from "@/presentation/components/admin/ai/AIButton";
import { Input } from "@/presentation/components/admin/ui/Input";
import { Textarea } from "@/presentation/components/admin/ui/Textarea";
import { Toggle } from "@/presentation/components/admin/ui/Toggle";
import { LocaleSwitcher } from "@/presentation/components/admin/ui/LocaleSwitcher";
import { TranslateAllButton } from "@/presentation/components/admin/ui/TranslateAllButton";
import { useToast } from "@/presentation/components/admin/providers/ToastProvider";

import { GalleryEditor } from "./GalleryEditor";
import type { ProjectActionResult, ProjectActions } from "./types";

export interface ProjectFormValues {
  name: string;
  url: string;
  liveUrl: string;
  pill: string;
  tagsCsv: string;
  employerName: string;
  employerUrl: string;
  clientName: string;
  clientUrl: string;
  deployed: boolean;
  description: { en: string; pt: string; es: string };
}

export interface ProjectFormHandle {
  submit: () => void;
}

interface ProjectFormProps {
  mode: "create" | "edit";
  project?: Project;
  actions: ProjectActions;
  onSubmittingChange: (submitting: boolean) => void;
  onResult: (result: ProjectActionResult, values: ProjectFormValues) => void;
}

function defaultsFor(project?: Project): ProjectFormValues {
  return {
    name: project?.name ?? "",
    url: project?.url ?? "",
    liveUrl: project?.liveUrl ?? "",
    pill: project?.pill ?? "",
    tagsCsv: project?.tags.join(", ") ?? "",
    employerName: project?.employerName ?? "",
    employerUrl: project?.employerUrl ?? "",
    clientName: project?.clientName ?? "",
    clientUrl: project?.clientUrl ?? "",
    deployed: project?.deployed ?? false,
    description: {
      en: project?.description.en ?? "",
      pt: project?.description.pt ?? "",
      es: project?.description.es ?? "",
    },
  };
}

export const ProjectForm = forwardRef<ProjectFormHandle, ProjectFormProps>(function ProjectForm(
  { mode, project, actions, onSubmittingChange, onResult },
  ref,
) {
  const t = useTranslations();
  const { toast } = useToast();
  const [, startSubmit] = useTransition();
  const [gallery, setGallery] = useState<ProjectImage[]>(project?.gallery ?? []);
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(project?.coverImageUrl ?? null);
  const [descLocale, setDescLocale] = useState<Locale>("en");

  const defaults = useMemo(() => defaultsFor(project), [project]);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useForm<ProjectFormValues>({ defaultValues: defaults });

  useImperativeHandle(ref, () => ({
    submit() {
      void handleSubmit(onValid)();
    },
  }));

  const deployed = watch("deployed");

  function onValid(values: ProjectFormValues) {
    const tags = values.tagsCsv
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    const payload = {
      name: values.name.trim(),
      url: values.url.trim() || null,
      liveUrl: values.deployed ? values.liveUrl.trim() || null : null,
      description: values.description,
      pill: values.pill.trim() || null,
      tags,
      employerName: values.employerName.trim() || null,
      employerUrl: values.employerUrl.trim() || null,
      clientName: values.clientName.trim() || null,
      clientUrl: values.clientUrl.trim() || null,
      deployed: values.deployed,
      visible: true,
    };

    onSubmittingChange(true);
    startSubmit(async () => {
      const result =
        mode === "edit" && project
          ? await actions.update(project.id, payload)
          : await actions.create(payload);
      onSubmittingChange(false);
      onResult(result, values);
    });
  }

  function parseTagsCsv(value: string): string[] {
    return value
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
  }

  async function runImproveDescription() {
    const values = getValues();
    const current = values.description[descLocale]?.trim();
    if (!current) {
      toast({ title: "Write something first", kind: "info" });
      return;
    }
    const response = await fetch("/api/ai/improve", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text: current, locale: descLocale }),
    });
    if (!response.ok) {
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      throw new Error(data.error ?? `Request failed (${response.status})`);
    }
    const data = (await response.json()) as { improved: string };
    setValue(`description.${descLocale}`, data.improved, { shouldDirty: true });
    toast({ title: "Description improved", kind: "success" });
  }

  async function runGenerateDescription() {
    const values = getValues();
    const name = values.name.trim();
    if (!name) {
      toast({ title: "Name required", message: "Add a project name first.", kind: "info" });
      return;
    }

    const trimmedUrl = values.url.trim() || values.liveUrl.trim();
    const payload: Record<string, unknown> = {
      name,
      tags: parseTagsCsv(values.tagsCsv),
    };
    if (trimmedUrl) payload.url = trimmedUrl;

    const response = await fetch("/api/ai/project-description", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      throw new Error(data.error ?? `Request failed (${response.status})`);
    }
    const data = (await response.json()) as {
      description: { en: string; pt: string; es: string };
    };
    setValue("description.en", data.description.en, { shouldDirty: true });
    setValue("description.pt", data.description.pt, { shouldDirty: true });
    setValue("description.es", data.description.es, { shouldDirty: true });
    toast({ title: "Description generated", kind: "success" });
  }

  async function runSuggestTags() {
    const values = getValues();
    const name = values.name.trim();
    if (!name) {
      toast({ title: "Name required", message: "Add a project name first.", kind: "info" });
      return;
    }
    const description =
      values.description.en.trim() || values.description.pt.trim() || values.description.es.trim();
    if (!description) {
      toast({
        title: "Description required",
        message: "Write a short description first.",
        kind: "info",
      });
      return;
    }
    const response = await fetch("/api/ai/suggest-tags", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name, description }),
    });
    if (!response.ok) {
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      throw new Error(data.error ?? `Request failed (${response.status})`);
    }
    const data = (await response.json()) as { tags: string[] };
    const existing = parseTagsCsv(values.tagsCsv);
    const merged = Array.from(new Set([...existing, ...data.tags]));
    setValue("tagsCsv", merged.join(", "), { shouldDirty: true });
    toast({ title: "Tags suggested", kind: "success" });
  }

  return (
    <form onSubmit={handleSubmit(onValid)} className="admin-project-form" noValidate>
      {/* Name */}
      <div className="admin-form-row">
        <div className="admin-form-row-label-col">
          <span className="label-text">{t("admin.projects.name")}</span>
        </div>
        <div className="admin-form-row-field">
          <Input
            placeholder="My Project"
            {...register("name", { required: "Name is required" })}
            error={errors.name?.message}
            autoFocus
          />
        </div>
      </div>

      {/* URL */}
      <div className="admin-form-row">
        <div className="admin-form-row-label-col">
          <span className="label-text">{t("admin.projects.url")}</span>
        </div>
        <div className="admin-form-row-field">
          <Input
            placeholder="https://example.com"
            {...register("url")}
            error={errors.url?.message}
          />
        </div>
      </div>

      {/* Deployed toggle */}
      <div className="admin-form-row">
        <div className="admin-form-row-label-col">
          <span className="label-text">{t("admin.projects.deployed")}?</span>
          <div className="help">If off, no live link button shows on the portfolio.</div>
        </div>
        <div className="admin-form-row-field">
          <Controller
            name="deployed"
            control={control}
            render={({ field }) => (
              <Toggle
                checked={field.value}
                onCheckedChange={field.onChange}
                label={field.value ? "Live with public link" : "Not deployed"}
              />
            )}
          />
        </div>
      </div>

      {/* Live link — conditional */}
      {deployed && (
        <div className="admin-form-row">
          <div className="admin-form-row-label-col">
            <span className="label-text">{t("admin.projects.liveUrl")}</span>
          </div>
          <div className="admin-form-row-field">
            <Input
              placeholder="https://..."
              {...register("liveUrl")}
              error={errors.liveUrl?.message}
            />
          </div>
        </div>
      )}

      {/* Description */}
      <div className="admin-form-row">
        <div className="admin-form-row-label-col">
          <span className="label-text">{t("admin.projects.description")}</span>
        </div>
        <div className="admin-form-row-field">
          <LocaleSwitcher
            value={descLocale}
            onValueChange={setDescLocale}
            aria-label="Description locale"
          />
          <Controller
            control={control}
            name={`description.${descLocale}` as const}
            rules={{ required: true }}
            render={({ field, fieldState }) => (
              <Textarea
                {...field}
                key={descLocale}
                rows={4}
                placeholder={`Description (${descLocale.toUpperCase()})`}
                error={fieldState.error ? `${descLocale.toUpperCase()} required` : undefined}
              />
            )}
          />
          <div className="admin-project-ai-row">
            <AIButton onRun={runImproveDescription} label={t("admin.projects.improve")} size="sm" />
            <AIButton
              onRun={runGenerateDescription}
              label={t("admin.projects.generate")}
              size="sm"
            />
            <TranslateAllButton
              sourceLocale={descLocale}
              getSourceText={() => getValues(`description.${descLocale}` as const)}
              onTranslated={(target, value) =>
                setValue(`description.${target}` as const, value, { shouldDirty: true })
              }
            />
          </div>
        </div>
      </div>

      {/* Tags */}
      <div className="admin-form-row">
        <div className="admin-form-row-label-col">
          <span className="label-text">{t("admin.projects.tags")}</span>
          <div className="help">{t("admin.projects.tagsHint")}</div>
        </div>
        <div className="admin-form-row-field">
          <Input placeholder=".NET, C#, REST APIs" {...register("tagsCsv")} />
          <div className="admin-project-ai-row">
            <AIButton onRun={runSuggestTags} label={t("admin.projects.suggestTags")} size="sm" />
          </div>
        </div>
      </div>

      {/* Badge */}
      <div className="admin-form-row">
        <div className="admin-form-row-label-col">
          <span className="label-text">Badge</span>
          <div className="help">Small uppercase pill.</div>
        </div>
        <div className="admin-form-row-field">
          <Input placeholder="FLAGSHIP" {...register("pill")} maxLength={40} />
        </div>
      </div>

      {/* Employer */}
      <div className="admin-form-row">
        <div className="admin-form-row-label-col">
          <span className="label-text">Employer</span>
          <div className="help">
            Company that hired me for this project. Leave blank for personal/freelance work.
          </div>
        </div>
        <div className="admin-form-row-field">
          <Input placeholder="Cubos Tecnologia" {...register("employerName")} maxLength={120} />
          <Input placeholder="https://cubos.io/" {...register("employerUrl")} maxLength={300} />
        </div>
      </div>

      {/* Client */}
      <div className="admin-form-row">
        <div className="admin-form-row-label-col">
          <span className="label-text">Client</span>
          <div className="help">
            Separate company where I was outsourced (e.g., Dietbox under Cubos). Leave blank if the
            project belongs to the employer itself.
          </div>
        </div>
        <div className="admin-form-row-field">
          <Input placeholder="Dietbox" {...register("clientName")} maxLength={120} />
          <Input
            placeholder="https://dietbox.me/pt-BR"
            {...register("clientUrl")}
            maxLength={300}
          />
        </div>
      </div>

      {/* Images — full-width */}
      <div className="admin-form-row admin-form-row-full">
        <div className="admin-form-row-field admin-form-row-field-full">
          <span className="label-text admin-project-section-title">
            {t("admin.projects.gallery")}
          </span>
          {mode === "create" || !project ? (
            <p className="admin-field-hint">
              Save the project first to start uploading images and pick a cover.
            </p>
          ) : (
            <GalleryEditor
              projectId={project.id}
              images={gallery}
              coverImageUrl={coverImageUrl}
              actions={actions}
              onImagesChange={setGallery}
              onCoverChange={setCoverImageUrl}
              addImageLabel={t("admin.projects.addImage")}
              hintLabel={t("admin.projects.dragDropHint")}
            />
          )}
        </div>
      </div>
    </form>
  );
});
