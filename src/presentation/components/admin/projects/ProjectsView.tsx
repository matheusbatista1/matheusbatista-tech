"use client";

import { useState, useTransition } from "react";
import { ChevronDown, ChevronUp, Edit, Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";

import type { Project } from "@/domain/entities/Project";
import { Button } from "@/presentation/components/admin/ui/Button";
import { IconButton } from "@/presentation/components/admin/ui/IconButton";
import { PageHead } from "@/presentation/components/admin/shell/PageHead";
import { useConfirm } from "@/presentation/components/admin/providers/ConfirmProvider";
import { useToast } from "@/presentation/components/admin/providers/ToastProvider";
import type { ProjectActions } from "./types";
import { ProjectModal } from "./ProjectModal";
import "./projects.css";

type ViewMode = "grid" | "table";

interface ProjectsViewProps {
  projects: Project[];
  actions: ProjectActions;
}

function cls(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

export function ProjectsView({ projects, actions }: ProjectsViewProps) {
  const t = useTranslations();
  const { toast } = useToast();
  const { confirm } = useConfirm();
  const [, startTransition] = useTransition();

  const [view, setView] = useState<ViewMode>("grid");
  const [openProject, setOpenProject] = useState<Project | null>(null);
  const [creating, setCreating] = useState(false);

  function move(id: string, direction: -1 | 1) {
    const ids = projects.map((p) => p.id);
    const index = ids.indexOf(id);
    if (index < 0) return;
    const target = index + direction;
    if (target < 0 || target >= ids.length) return;
    const next = [...ids];
    [next[index], next[target]] = [next[target]!, next[index]!];
    startTransition(async () => {
      const result = await actions.reorder(next);
      if (result.error) toast({ title: result.error, kind: "error" });
    });
  }

  async function onDelete(project: Project) {
    const ok = await confirm({
      title: t("admin.projects.confirmDelete"),
      message: `“${project.name}” will be removed permanently.`,
      danger: true,
      confirmLabel: "Delete",
    });
    if (!ok) return;
    startTransition(async () => {
      const result = await actions.delete(project.id);
      if (result.error) {
        toast({ title: result.error, kind: "error" });
        return;
      }
      toast({ title: t("admin.projects.deleted"), kind: "success" });
    });
  }

  const headActions = (
    <>
      <div role="group" aria-label="View mode" className="admin-projects-view-toggle">
        <Button
          size="sm"
          variant={view === "grid" ? "primary" : "ghost"}
          onClick={() => setView("grid")}
          aria-pressed={view === "grid"}
        >
          {t("admin.projects.viewGrid")}
        </Button>
        <Button
          size="sm"
          variant={view === "table" ? "primary" : "ghost"}
          onClick={() => setView("table")}
          aria-pressed={view === "table"}
        >
          {t("admin.projects.viewTable")}
        </Button>
      </div>
      <Button variant="primary" icon={<Plus size={14} />} onClick={() => setCreating(true)}>
        {t("admin.projects.new")}
      </Button>
    </>
  );

  return (
    <>
      <PageHead
        title={t("admin.projects.title")}
        lead={t("admin.projects.lead")}
        actions={headActions}
      />

      {projects.length === 0 ? (
        <div className="admin-project-empty">
          No projects yet. Click “{t("admin.projects.new")}” to add the first one.
        </div>
      ) : view === "grid" ? (
        <div className="admin-projects-grid">
          {projects.map((p) => (
            <ProjectCard
              key={p.id}
              project={p}
              onOpen={() => setOpenProject(p)}
              onDelete={() => onDelete(p)}
              draftLabel={t("admin.projects.draftInline")}
            />
          ))}
        </div>
      ) : (
        <div className="admin-projects-table-wrap">
          <table className="admin-projects-table">
            <thead>
              <tr>
                <th className="col-order">#</th>
                <th>Project</th>
                <th>URL</th>
                <th>Tags</th>
                <th className="col-imgs">Imgs</th>
                <th className="col-order-actions">Order</th>
                <th className="col-actions">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p, i) => {
                const desc = p.description.en || p.description.pt || p.description.es;
                return (
                  <tr key={p.id} className="admin-projects-row" onClick={() => setOpenProject(p)}>
                    <td className="dim">{String(i + 1).padStart(2, "0")}</td>
                    <td>
                      <div className="name-cell">
                        <strong>{p.name}</strong>
                        {!p.deployed && (
                          <span className="draft-inline">· {t("admin.projects.draftInline")}</span>
                        )}
                      </div>
                      {desc && <div className="desc-cell">{desc}</div>}
                    </td>
                    <td className="url-cell">{p.url || p.liveUrl || "—"}</td>
                    <td>
                      <div className="tags-cell">
                        {(p.tags || []).slice(0, 3).map((tag) => (
                          <span className="tag-chip" key={tag}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <span
                        className={cls(
                          "tag-chip",
                          (p.gallery?.length ?? p.images.length) > 0 && "is-images",
                        )}
                      >
                        {p.gallery?.length ?? p.images.length} img
                      </span>
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <div className="row-actions">
                        <IconButton
                          aria-label="Move up"
                          disabled={i === 0}
                          onClick={() => move(p.id, -1)}
                          icon={<ChevronUp size={14} />}
                        />
                        <IconButton
                          aria-label="Move down"
                          disabled={i === projects.length - 1}
                          onClick={() => move(p.id, 1)}
                          icon={<ChevronDown size={14} />}
                        />
                      </div>
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <div className="row-actions row-actions-hover">
                        <IconButton
                          aria-label="Edit"
                          tooltip="Edit"
                          onClick={() => setOpenProject(p)}
                          icon={<Edit size={14} />}
                        />
                        <IconButton
                          aria-label="Delete"
                          tooltip="Delete"
                          onClick={() => onDelete(p)}
                          icon={<Trash2 size={14} />}
                          className="admin-btn-danger"
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {creating && (
        <ProjectModal mode="create" actions={actions} onClose={() => setCreating(false)} />
      )}
      {openProject && (
        <ProjectModal
          mode="edit"
          actions={actions}
          project={openProject}
          onClose={() => setOpenProject(null)}
        />
      )}
    </>
  );
}

interface ProjectCardProps {
  project: Project;
  onOpen: () => void;
  onDelete: () => void;
  draftLabel: string;
}

function ProjectCard({ project, onOpen, onDelete, draftLabel }: ProjectCardProps) {
  const cover =
    project.coverImageUrl ?? project.gallery?.[0]?.url ?? project.images?.[0]?.src ?? null;
  const imgCount = project.gallery?.length ?? project.images.length;
  const url = project.url || project.liveUrl || "—";

  return (
    <article className="admin-project-card">
      <button
        type="button"
        onClick={onOpen}
        className="admin-project-card-button"
        aria-label={`Edit ${project.name}`}
      >
        <div className="admin-project-card-thumb">{cover ? <img src={cover} alt="" /> : null}</div>
        <div className="admin-project-card-body">
          <h4>
            {project.name}
            {!project.deployed && <span className="draft-inline"> · {draftLabel}</span>}
          </h4>
          <div className="url">{url}</div>
          <div className="tags">
            {(project.tags || []).slice(0, 3).map((tag) => (
              <span className="tag-chip" key={tag}>
                {tag}
              </span>
            ))}
            {imgCount > 0 && <span className="tag-chip is-images">{imgCount} img</span>}
          </div>
        </div>
      </button>
      <div className="admin-project-card-actions" onClick={(e) => e.stopPropagation()}>
        <IconButton aria-label="Edit" tooltip="Edit" onClick={onOpen} icon={<Edit size={14} />} />
        <IconButton
          aria-label="Delete"
          tooltip="Delete"
          onClick={onDelete}
          icon={<Trash2 size={14} />}
        />
      </div>
    </article>
  );
}
