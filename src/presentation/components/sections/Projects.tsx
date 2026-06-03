"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Project } from "@/domain/entities/Project";
import type { Locale } from "@/domain/value-objects/Locale";
import { SemanticSearch } from "@/presentation/components/ai/SemanticSearch";
import { ProjectStage } from "./projects/ProjectStage";
import { ProjectMeta } from "./projects/ProjectMeta";
import { ProjectSwitcher } from "./projects/ProjectSwitcher";

interface ProjectsProps {
  projects: Project[];
  locale: Locale;
  aiEnabled?: boolean;
}

export interface RankedProject {
  id: string;
  reason: string;
}

const IN_VIEW_UPPER = 0.5;
const IN_VIEW_LOWER = 0.3;

export function Projects({ projects: allProjects, locale, aiEnabled = false }: ProjectsProps) {
  const t = useTranslations("projects");
  const sectionRef = useRef<HTMLElement>(null);

  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [imgIdx, setImgIdx] = useState(0);
  const [ranked, setRanked] = useState<RankedProject[] | null>(null);
  const projectsLengthRef = useRef(0);

  const goTo = useCallback((next: number) => {
    setActiveIndex((current) => {
      if (next === current) return current;
      setDirection(next > current ? 1 : -1);
      return next;
    });
  }, []);

  const goPrev = useCallback(() => {
    setActiveIndex((current) => {
      if (current <= 0) return current;
      setDirection(-1);
      return current - 1;
    });
  }, []);

  const goNext = useCallback(() => {
    setActiveIndex((current) => {
      const last = projectsLengthRef.current - 1;
      if (current >= last) return current;
      setDirection(1);
      return current + 1;
    });
  }, []);

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
    projectsLengthRef.current = projects.length;
  }, [projects.length]);

  useEffect(() => {
    setImgIdx(0);
  }, [activeIndex]);

  useEffect(() => {
    setActiveIndex(0);
    setDirection(0);
  }, [ranked]);

  useEffect(() => {
    const onOpenProject = (event: Event) => {
      const detail = (event as CustomEvent<string>).detail;
      const idx = projects.findIndex((p) => p.id === detail);
      if (idx >= 0) {
        goTo(idx);
        sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    };
    window.addEventListener("open-project", onOpenProject);
    return () => window.removeEventListener("open-project", onOpenProject);
  }, [projects, goTo]);

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
        goNext();
      } else {
        goPrev();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goNext, goPrev]);

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

  // Touch swipe nav — mobile gallery feel.
  // The handlers also run on mouse/pen pointers, but desktop already has
  // arrow buttons + keyboard so they're a harmless bonus.
  const SWIPE_THRESHOLD = 60;
  const VERTICAL_TOLERANCE = 12;
  const swipeStartRef = useRef<{ x: number; y: number; pointerId: number } | null>(null);
  const swipeActiveRef = useRef(false);

  function onSwipeDown(event: ReactPointerEvent<HTMLDivElement>) {
    swipeStartRef.current = {
      x: event.clientX,
      y: event.clientY,
      pointerId: event.pointerId,
    };
    swipeActiveRef.current = false;
  }

  function onSwipeMove(event: ReactPointerEvent<HTMLDivElement>) {
    const start = swipeStartRef.current;
    if (!start || start.pointerId !== event.pointerId) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (!swipeActiveRef.current) {
      // Wait for movement to disambiguate horizontal swipe from vertical scroll.
      if (Math.abs(dx) < VERTICAL_TOLERANCE && Math.abs(dy) < VERTICAL_TOLERANCE) return;
      if (Math.abs(dy) > Math.abs(dx)) {
        // It's a vertical pan — let the page scroll, bail out.
        swipeStartRef.current = null;
        return;
      }
      swipeActiveRef.current = true;
    }
  }

  function onSwipeUp(event: ReactPointerEvent<HTMLDivElement>) {
    const start = swipeStartRef.current;
    swipeStartRef.current = null;
    if (!start || start.pointerId !== event.pointerId) return;
    if (!swipeActiveRef.current) return;
    swipeActiveRef.current = false;
    const dx = event.clientX - start.x;
    if (Math.abs(dx) < SWIPE_THRESHOLD) return;
    if (dx > 0) goPrev();
    else goNext();
  }

  function onSwipeCancel() {
    swipeStartRef.current = null;
    swipeActiveRef.current = false;
  }

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

        {aiEnabled && <SemanticSearch onResults={setRanked} />}

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
            <div
              className="showcase-wrap"
              onPointerDown={onSwipeDown}
              onPointerMove={onSwipeMove}
              onPointerUp={onSwipeUp}
              onPointerCancel={onSwipeCancel}
            >
              <button
                type="button"
                className="proj-nav prev"
                onClick={goPrev}
                disabled={activeIndex <= 0}
                aria-label={t("prev")}
              >
                <ChevronLeft width={20} height={20} aria-hidden="true" />
              </button>
              <AnimatePresence mode="wait" initial={false} custom={direction}>
                <motion.div
                  key={activeProject.id}
                  className="showcase"
                  custom={direction}
                  variants={{
                    enter: (dir: number) => ({ opacity: 0, x: dir >= 0 ? 28 : -28 }),
                    center: { opacity: 1, x: 0 },
                    exit: (dir: number) => ({ opacity: 0, x: dir >= 0 ? -28 : 28 }),
                  }}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                >
                  <ProjectStage
                    project={activeProject}
                    imgIdx={imgIdx}
                    onPrev={handlePrevImage}
                    onNext={handleNextImage}
                    onSelectImage={setImgIdx}
                  />
                  <ProjectMeta project={activeProject} locale={locale} matchReason={matchReason} />
                </motion.div>
              </AnimatePresence>
              <button
                type="button"
                className="proj-nav next"
                onClick={goNext}
                disabled={activeIndex >= projects.length - 1}
                aria-label={t("next")}
              >
                <ChevronRight width={20} height={20} aria-hidden="true" />
              </button>
            </div>

            <ProjectSwitcher
              projects={projects}
              activeIndex={activeIndex}
              onSelect={goTo}
              reasons={reasons}
            />
          </>
        )}
      </div>
    </section>
  );
}
