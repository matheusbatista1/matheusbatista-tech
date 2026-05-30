"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import type { Project } from "@/domain/entities/Project";
import type { Locale } from "@/domain/value-objects/Locale";
import { ProjectStage } from "./projects/ProjectStage";
import { ProjectMeta } from "./projects/ProjectMeta";
import { ProjectSwitcher } from "./projects/ProjectSwitcher";

interface ProjectsProps {
  projects: Project[];
  locale: Locale;
}

export interface RankedProject {
  id: string;
  reason: string;
}

const IN_VIEW_UPPER = 0.5;
const IN_VIEW_LOWER = 0.3;

export function Projects({ projects: allProjects, locale }: ProjectsProps) {
  const t = useTranslations("projects");
  const sectionRef = useRef<HTMLElement>(null);

  const [activeIndex, setActiveIndex] = useState(0);
  const [imgIdx, setImgIdx] = useState(0);
  const [ranked, setRanked] = useState<RankedProject[] | null>(null);

  const { projects, reasons } = useMemo(() => {
    if (!ranked || ranked.length === 0) {
      return { projects: allProjects, reasons: {} as Record<string, string> };
    }
    const byId = new Map(allProjects.map((p) => [p.id, p]));
    const reordered = ranked.map((r) => byId.get(r.id)).filter((p): p is Project => Boolean(p));
    const reasonMap = Object.fromEntries(ranked.map((r) => [r.id, r.reason]));
    return { projects: reordered, reasons: reasonMap };
  }, [ranked, allProjects]);

  useEffect(() => {
    setImgIdx(0);
  }, [activeIndex]);

  useEffect(() => {
    setActiveIndex(0);
  }, [ranked]);

  useEffect(() => {
    const onOpenProject = (event: Event) => {
      const detail = (event as CustomEvent<string>).detail;
      const idx = projects.findIndex((p) => p.id === detail);
      if (idx >= 0) {
        setActiveIndex(idx);
        sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    };
    window.addEventListener("open-project", onOpenProject);
    return () => window.removeEventListener("open-project", onOpenProject);
  }, [projects]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      const rect = sectionRef.current?.getBoundingClientRect();
      if (!rect) return;
      const inView =
        rect.top < window.innerHeight * IN_VIEW_UPPER &&
        rect.bottom > window.innerHeight * IN_VIEW_LOWER;
      if (!inView) return;
      if (e.key === "ArrowRight") {
        setActiveIndex((i) => Math.min(projects.length - 1, i + 1));
      } else {
        setActiveIndex((i) => Math.max(0, i - 1));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [projects.length]);

  const activeProject = projects[activeIndex];
  const matchReason = activeProject ? reasons[activeProject.id] : undefined;

  const handlePrevImage = useCallback(() => {
    if (!activeProject) return;
    setImgIdx((i) => (i - 1 + activeProject.images.length) % activeProject.images.length);
  }, [activeProject]);

  const handleNextImage = useCallback(() => {
    if (!activeProject) return;
    setImgIdx((i) => (i + 1) % activeProject.images.length);
  }, [activeProject]);

  return (
    <section className="section reveal" id="projects" ref={sectionRef}>
      <div className="shell">
        <div className="section-head">
          <span className="section-num">02 /</span>
          <span className="section-label">{t("label")}</span>
          <span className="proj-counter">
            <span className="cur">
              {projects.length ? String(activeIndex + 1).padStart(2, "0") : "00"}
            </span>
            <span className="sep">/</span>
            <span>{String(projects.length).padStart(2, "0")}</span>
          </span>
        </div>

        {ranked && (
          <div className="sem-result-bar" role="status">
            {ranked.length > 0 ? (
              <span>
                {t("ranked")} <b>{ranked.length}</b> {t("byRelevance")}
              </span>
            ) : (
              <span>{t("noMatch")}</span>
            )}
            <button type="button" onClick={() => setRanked(null)}>
              {t("reset")}
            </button>
          </div>
        )}

        {projects.length === 0 || !activeProject ? (
          <p className="text-text-mute text-sm">No projects yet.</p>
        ) : (
          <>
            <div className="showcase">
              <ProjectStage
                project={activeProject}
                imgIdx={imgIdx}
                onPrev={handlePrevImage}
                onNext={handleNextImage}
                onSelectImage={setImgIdx}
              />
              <ProjectMeta project={activeProject} locale={locale} matchReason={matchReason} />
            </div>

            <ProjectSwitcher
              projects={projects}
              activeIndex={activeIndex}
              onSelect={setActiveIndex}
              reasons={reasons}
            />
          </>
        )}
      </div>
    </section>
  );
}
