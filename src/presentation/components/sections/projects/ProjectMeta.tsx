"use client";

import { useTranslations } from "next-intl";
import type { Project, ProjectPill } from "@/domain/entities/Project";
import type { Locale } from "@/domain/value-objects/Locale";
import { pickLocalized } from "@/domain/value-objects/LocalizedText";
import { ArrowUpRightIcon } from "@/presentation/components/icons/Icons";

interface ProjectMetaProps {
  project: Project;
  locale: Locale;
  matchReason?: string;
  personaDescription?: string;
}

const PILL_LABELS: Record<ProjectPill, string> = {
  FLAGSHIP: "FLAGSHIP",
  PRODUCTION: "PRODUCTION",
  INTEGRATION: "INTEGRATION",
  CASE_STUDY: "CASE STUDY",
  AI: "AI",
};

export function ProjectMeta({
  project,
  locale,
  matchReason,
  personaDescription,
}: ProjectMetaProps) {
  const t = useTranslations("projects");
  const description = pickLocalized(project.description, locale);
  const showPersona =
    personaDescription !== undefined &&
    personaDescription !== description &&
    personaDescription.length > 0;
  const externalUrl = project.deployed ? (project.liveUrl ?? project.url) : null;
  const pillLabel = project.pill ? PILL_LABELS[project.pill] : "PROJECT";

  return (
    <div className="showcase-meta" key={project.id}>
      <div className="meta-pill-row">
        <div className="meta-pill">{pillLabel}</div>
        {matchReason && <div className="meta-match">{matchReason}</div>}
      </div>

      <h3 className="meta-name">{project.name}</h3>

      {showPersona ? (
        <p className="meta-desc">
          <span className="meta-persona-tag">· {t("tailored")}</span>
          {personaDescription}
        </p>
      ) : (
        <p className="meta-desc">{description}</p>
      )}

      <div className="meta-tags">
        {project.tags.map((tag) => (
          <span key={tag} className="proj-tag">
            {tag}
          </span>
        ))}
      </div>

      <div className="meta-cta">
        {externalUrl ? (
          <a className="meta-open" href={externalUrl} target="_blank" rel="noopener noreferrer">
            <span>{t("open")}</span>
            <span className="ico">
              <ArrowUpRightIcon />
            </span>
          </a>
        ) : (
          <span className="meta-draft">
            <span className="d-dot" /> {t("notDeployed")}
          </span>
        )}
      </div>
    </div>
  );
}
