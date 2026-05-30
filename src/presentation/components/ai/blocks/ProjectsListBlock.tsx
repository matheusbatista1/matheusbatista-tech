"use client";

import Image from "next/image";
import type { Project } from "@/domain/entities/Project";
import type { Locale } from "@/domain/value-objects/Locale";
import { pickLocalized } from "@/domain/value-objects/LocalizedText";
import { ArrowUpRightIcon } from "@/presentation/components/icons/Icons";

interface ProjectsListBlockProps {
  ids: string[];
  projects: Project[];
  locale: Locale;
  onOpen: (id: string) => void;
}

export function ProjectsListBlock({ ids, projects, locale, onOpen }: ProjectsListBlockProps) {
  const byId = new Map(projects.map((p) => [p.id, p]));
  const list = ids.map((id) => byId.get(id)).filter((p): p is Project => Boolean(p));
  if (list.length === 0) return null;

  return (
    <div className="ai-proj-list">
      {list.map((p) => {
        const cover = p.images[0];
        const description = pickLocalized(p.description, locale);
        return (
          <button type="button" className="ai-proj" key={p.id} onClick={() => onOpen(p.id)}>
            <div className="ai-proj-thumb">
              {cover ? (
                <Image src={cover.src} alt={p.name} width={64} height={44} unoptimized />
              ) : (
                <span>{p.name}</span>
              )}
            </div>
            <div>
              <div className="ai-proj-top">
                <span className="ai-proj-name">{p.name}</span>
                {p.pill && <span className="ai-proj-pill">{p.pill}</span>}
              </div>
              <p className="ai-proj-desc">{description}</p>
              <div className="ai-proj-tags">
                {p.tags.slice(0, 4).map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            </div>
            <span className="ai-proj-arrow">
              <ArrowUpRightIcon />
            </span>
          </button>
        );
      })}
    </div>
  );
}
