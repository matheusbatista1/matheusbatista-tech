"use client";

import { useMemo, useState, useTransition } from "react";
import { ChevronDown, ChevronUp, LayoutGrid, Plus, Rows } from "lucide-react";

import type { Project } from "@/domain/entities/Project";
import { Button } from "@/presentation/components/admin/ui/Button";
import { IconButton } from "@/presentation/components/admin/ui/IconButton";
import { Input } from "@/presentation/components/admin/ui/Input";
import { Tabs } from "@/presentation/components/admin/ui/Tabs";
import { useToast } from "@/presentation/components/admin/providers/ToastProvider";
import type { ProjectActions } from "./types";
import { ProjectModal } from "./ProjectModal";
import "./projects.css";

type VisibilityFilter = "all" | "visible" | "hidden";
type ViewMode = "grid" | "table";

interface ProjectsViewProps {
  projects: Project[];
  actions: ProjectActions;
}

const FILTER_TABS = [
  { value: "all" as const, label: "All" },
  { value: "visible" as const, label: "Visible" },
  { value: "hidden" as const, label: "Hidden" },
];

export function ProjectsView({ projects, actions }: ProjectsViewProps) {
  const { toast } = useToast();
  const [, startTransition] = useTransition();

  const [view, setView] = useState<ViewMode>("grid");
  const [filter, setFilter] = useState<VisibilityFilter>("all");
  const [search, setSearch] = useState("");
  const [openProject, setOpenProject] = useState<Project | null>(null);
  const [creating, setCreating] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return projects.filter((p) => {
      if (filter === "visible" && !p.visible) return false;
      if (filter === "hidden" && p.visible) return false;
      if (!q) return true;
      const haystack = [p.name, p.slug, p.tags.join(" "), p.description.en, p.description.pt]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [projects, filter, search]);

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

  return (
    <>
      <div className="admin-projects-toolbar">
        <div className="search">
          <Input
            placeholder="Search by name, slug, tags…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search projects"
          />
        </div>

        <Tabs<VisibilityFilter>
          tabs={FILTER_TABS}
          value={filter}
          onValueChange={setFilter}
          aria-label="Filter by visibility"
        />

        <div className="spacer" />

        <div role="group" aria-label="View mode" className="admin-projects-view-toggle">
          <IconButton
            aria-label="Grid view"
            tooltip="Grid view"
            onClick={() => setView("grid")}
            icon={<LayoutGrid size={14} />}
            aria-pressed={view === "grid"}
          />
          <IconButton
            aria-label="Table view"
            tooltip="Table view"
            onClick={() => setView("table")}
            icon={<Rows size={14} />}
            aria-pressed={view === "table"}
          />
        </div>

        <Button variant="primary" icon={<Plus size={14} />} onClick={() => setCreating(true)}>
          New project
        </Button>
      </div>

      {filtered.length === 0 ? (
        <div className="admin-project-empty">
          {projects.length === 0
            ? "No projects yet. Click “New project” to add the first one."
            : "No projects match the current filters."}
        </div>
      ) : view === "grid" ? (
        <div className="admin-projects-grid">
          {filtered.map((p, i) => (
            <ProjectCard
              key={p.id}
              project={p}
              onOpen={() => setOpenProject(p)}
              onMoveUp={i === 0 ? undefined : () => move(p.id, -1)}
              onMoveDown={i === filtered.length - 1 ? undefined : () => move(p.id, 1)}
            />
          ))}
        </div>
      ) : (
        <table className="admin-projects-table">
          <thead>
            <tr>
              <th className="col-order">#</th>
              <th>Name</th>
              <th>Slug</th>
              <th>Pill</th>
              <th>Status</th>
              <th className="sr-col">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p, i) => (
              <tr key={p.id} onClick={() => setOpenProject(p)}>
                <td>{String(p.order).padStart(2, "0")}</td>
                <td>
                  <strong>{p.name}</strong>
                </td>
                <td>
                  <code>/{p.slug}</code>
                </td>
                <td>{p.pill ? <span className="pill">{p.pill}</span> : "—"}</td>
                <td>
                  {!p.visible ? (
                    <span className="hidden">HIDDEN</span>
                  ) : !p.deployed ? (
                    <span className="draft">DRAFT</span>
                  ) : (
                    <span className="admin-projects-status-live">LIVE</span>
                  )}
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
                      disabled={i === filtered.length - 1}
                      onClick={() => move(p.id, 1)}
                      icon={<ChevronDown size={14} />}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

function ProjectCard({ project, onOpen, onMoveUp, onMoveDown }: ProjectCardProps) {
  const cover = project.coverImageUrl ?? project.gallery?.[0]?.url ?? null;

  return (
    <article className="admin-project-card">
      <button
        type="button"
        onClick={onOpen}
        className="admin-project-card-button"
        aria-label={`Edit ${project.name}`}
      >
        <div className="cover">{cover ? <img src={cover} alt="" /> : <span>No cover</span>}</div>
        <div className="name">{project.name}</div>
        <div className="meta">
          <code>/{project.slug}</code>
          {project.pill && <span className="pill">{project.pill}</span>}
        </div>
        <div className="meta">
          {!project.visible && <span className="hidden">HIDDEN</span>}
          {project.visible && !project.deployed && <span className="draft">DRAFT</span>}
        </div>
        {project.tags.length > 0 && (
          <div className="tags">
            {project.tags.slice(0, 6).map((tag) => (
              <span className="tag" key={tag}>
                {tag}
              </span>
            ))}
          </div>
        )}
      </button>
      <div className="reorder" onClick={(e) => e.stopPropagation()}>
        <IconButton
          aria-label="Move up"
          onClick={onMoveUp}
          disabled={!onMoveUp}
          icon={<ChevronUp size={14} />}
        />
        <IconButton
          aria-label="Move down"
          onClick={onMoveDown}
          disabled={!onMoveDown}
          icon={<ChevronDown size={14} />}
        />
      </div>
    </article>
  );
}
