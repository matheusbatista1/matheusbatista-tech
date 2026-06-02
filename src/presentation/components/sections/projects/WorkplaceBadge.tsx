"use client";

import { Building2, Briefcase } from "lucide-react";
import type { Project } from "@/domain/entities/Project";

interface WorkplaceBadgeProps {
  project: Project;
}

interface Entry {
  label: string;
  url: string | null;
  kind: "employer" | "client";
}

function entriesFor(project: Project): Entry[] {
  const entries: Entry[] = [];
  if (project.employerName) {
    entries.push({
      label: project.employerName,
      url: project.employerUrl,
      kind: "employer",
    });
  }
  if (project.clientName && project.clientName !== project.employerName) {
    entries.push({
      label: project.clientName,
      url: project.clientUrl,
      kind: "client",
    });
  }
  return entries;
}

export function WorkplaceBadge({ project }: WorkplaceBadgeProps) {
  const entries = entriesFor(project);
  if (entries.length === 0) return null;

  return (
    <div className="workplace-badge" aria-label="Project workplace context">
      {entries.map((entry, idx) => {
        const Icon = entry.kind === "employer" ? Briefcase : Building2;
        const inner = (
          <>
            <Icon className="wb-ico" aria-hidden="true" />
            <span className="wb-text">{entry.label}</span>
          </>
        );
        const node = entry.url ? (
          <a
            key={`${entry.kind}-${entry.label}`}
            href={entry.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`wb-pill wb-${entry.kind}`}
          >
            {inner}
          </a>
        ) : (
          <span key={`${entry.kind}-${entry.label}`} className={`wb-pill wb-${entry.kind}`}>
            {inner}
          </span>
        );
        return (
          <span key={`row-${entry.kind}-${entry.label}`} className="wb-row">
            {idx > 0 ? (
              <span className="wb-sep" aria-hidden="true">
                ·
              </span>
            ) : null}
            {node}
          </span>
        );
      })}
    </div>
  );
}
