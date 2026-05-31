"use client";

import {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useState,
  useTransition,
  type ChangeEvent,
} from "react";
import { useForm, Controller } from "react-hook-form";
import { Sparkles, Wand2 } from "lucide-react";

import type { Project, ProjectPill } from "@/domain/entities/Project";
import type { ProjectImage } from "@/domain/entities/ProjectImage";
import { AIButton } from "@/presentation/components/admin/ai/AIButton";
import { Input } from "@/presentation/components/admin/ui/Input";
import { Textarea } from "@/presentation/components/admin/ui/Textarea";
import { Select } from "@/presentation/components/admin/ui/Select";
import { Toggle } from "@/presentation/components/admin/ui/Toggle";
import { useToast } from "@/presentation/components/admin/providers/ToastProvider";

import { GalleryEditor } from "./GalleryEditor";
import type { ProjectActionResult, ProjectActions } from "./types";

export interface ProjectFormValues {
  slug: string;
  name: string;
  url: string;
  liveUrl: string;
  pill: ProjectPill | "NONE";
  tagsCsv: string;
  deployed: boolean;
  visible: boolean;
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

const PILL_OPTIONS: ReadonlyArray<{ value: ProjectPill | "NONE"; label: string }> = [
  { value: "NONE", label: "— None —" },
  { value: "FLAGSHIP", label: "Flagship" },
  { value: "PRODUCTION", label: "Production" },
  { value: "INTEGRATION", label: "Integration" },
  { value: "CASE_STUDY", label: "Case study" },
  { value: "AI", label: "AI" },
];

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function defaultsFor(project?: Project): ProjectFormValues {
  return {
    slug: project?.slug ?? "",
    name: project?.name ?? "",
    url: project?.url ?? "",
    liveUrl: project?.liveUrl ?? "",
    pill: project?.pill ?? "NONE",
    tagsCsv: project?.tags.join(", ") ?? "",
    deployed: project?.deployed ?? false,
    visible: project?.visible ?? true,
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
  const { toast } = useToast();
  const [, startSubmit] = useTransition();
  const [slugTouched, setSlugTouched] = useState(Boolean(project?.slug));
  const [gallery, setGallery] = useState<ProjectImage[]>(project?.gallery ?? []);
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(project?.coverImageUrl ?? null);

  const defaults = useMemo(() => defaultsFor(project), [project]);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<ProjectFormValues>({ defaultValues: defaults });

  useImperativeHandle(ref, () => ({
    submit() {
      void handleSubmit(onValid)();
    },
  }));

  const nameRegister = register("name", { required: "Name is required" });
  const slugRegister = register("slug", {
    required: "Slug is required",
    pattern: {
      value: /^[a-z0-9-]+$/,
      message: "Lowercase letters, numbers and hyphens only",
    },
  });

  function onNameChange(e: ChangeEvent<HTMLInputElement>) {
    void nameRegister.onChange(e);
    if (!slugTouched) {
      setValue("slug", slugify(e.target.value), { shouldDirty: true });
    }
  }

  function onSlugChange(e: ChangeEvent<HTMLInputElement>) {
    setSlugTouched(true);
    void slugRegister.onChange(e);
  }

  function onValid(values: ProjectFormValues) {
    const tags = values.tagsCsv
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const payload = {
      slug: values.slug.trim(),
      name: values.name.trim(),
      url: values.url.trim() || null,
      liveUrl: values.liveUrl.trim() || null,
      description: values.description,
      pill: values.pill === "NONE" ? null : (values.pill as ProjectPill),
      tags,
      deployed: values.deployed,
      visible: values.visible,
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
      .map((t) => t.trim())
      .filter(Boolean);
  }

  async function runGenerateDescription() {
    const values = getValues();
    const name = values.name.trim();
    if (!name) {
      toast({ title: "Name required", message: "Add a project name first.", kind: "info" });
      return;
    }

    const url = values.url.trim() || values.liveUrl.trim();
    const payload: Record<string, unknown> = {
      name,
      tags: parseTagsCsv(values.tagsCsv),
      hint: "",
    };
    if (url) payload.url = url;

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
    setValue("tagsCsv", data.tags.join(", "), { shouldDirty: true });
    toast({ title: "Tags suggested", kind: "success" });
  }

  return (
    <form onSubmit={handleSubmit(onValid)} className="admin-project-form" noValidate>
      <Input
        label="Name"
        placeholder="My project"
        {...nameRegister}
        onChange={onNameChange}
        error={errors.name?.message}
      />
      <Input
        label="Slug"
        placeholder="my-project"
        {...slugRegister}
        onChange={onSlugChange}
        hint="Auto-generated from name; edit if needed."
        error={errors.slug?.message}
      />

      <Input
        label="Display URL"
        placeholder="company.com/product"
        {...register("url")}
        error={errors.url?.message}
      />
      <Input
        label="Live URL"
        type="url"
        placeholder="https://…"
        {...register("liveUrl")}
        error={errors.liveUrl?.message}
      />

      <Controller
        name="pill"
        control={control}
        render={({ field }) => (
          <Select label="Pill" value={field.value} onChange={(e) => field.onChange(e.target.value)}>
            {PILL_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>
        )}
      />
      <Input
        label="Tags (comma-separated)"
        placeholder=".NET, C#, REST APIs"
        {...register("tagsCsv")}
        hint="Up to 20 tags."
      />

      <div className="full">
        <p className="admin-project-section-title">Description</p>
        <div className="lang-row">
          <span className="admin-field-label">EN</span>
          <Textarea
            rows={3}
            placeholder="English description"
            {...register("description.en", { required: "EN description is required" })}
            error={errors.description?.en?.message}
          />
        </div>
        <div className="lang-row">
          <span className="admin-field-label">PT</span>
          <Textarea
            rows={3}
            placeholder="Descrição em português"
            {...register("description.pt", { required: "PT description is required" })}
            error={errors.description?.pt?.message}
          />
        </div>
        <div className="lang-row">
          <span className="admin-field-label">ES</span>
          <Textarea
            rows={3}
            placeholder="Descripción en español"
            {...register("description.es", { required: "ES description is required" })}
            error={errors.description?.es?.message}
          />
        </div>
      </div>

      <div className="full admin-project-form-row">
        <Controller
          name="deployed"
          control={control}
          render={({ field }) => (
            <Toggle
              checked={field.value}
              onCheckedChange={field.onChange}
              label="Deployed (shows Open button)"
            />
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
      </div>

      <div className="full">
        <div className="admin-project-form-row">
          <AIButton
            onRun={runGenerateDescription}
            label="Generate description"
            icon={<Sparkles size={14} />}
            title="Generate descriptions in EN/PT/ES"
            size="md"
          />
          <AIButton
            onRun={runSuggestTags}
            label="Suggest tags"
            icon={<Wand2 size={14} />}
            title="Suggest tags from the description"
            size="md"
          />
        </div>
      </div>

      <div className="full">
        <p className="admin-project-section-title">Gallery</p>
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
          />
        )}
      </div>
    </form>
  );
});
