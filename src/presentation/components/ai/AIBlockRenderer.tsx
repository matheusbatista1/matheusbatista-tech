"use client";

import type { AIBlock } from "@/domain/entities/ai/AIBlock";
import type { Project } from "@/domain/entities/Project";
import type { Skill } from "@/domain/entities/Skill";
import type { SocialLink } from "@/domain/entities/SocialLink";
import type { Locale } from "@/domain/value-objects/Locale";
import { SkillsChartBlock } from "./blocks/SkillsChartBlock";
import { SkillChipsBlock } from "./blocks/SkillChipsBlock";
import { ProjectsListBlock } from "./blocks/ProjectsListBlock";
import { ContactBlock } from "./blocks/ContactBlock";
import { StatsBlock } from "./blocks/StatsBlock";
import { TimelineBlock } from "./blocks/TimelineBlock";
import { TextBlock } from "./blocks/TextBlock";

export interface AIBlockContext {
  projects: Project[];
  skills: Skill[];
  socials: SocialLink[];
  locale: Locale;
  onOpenProject: (id: string) => void;
}

interface AIBlockRendererProps {
  block: AIBlock;
  context: AIBlockContext;
}

export function AIBlockRenderer({ block, context }: AIBlockRendererProps) {
  switch (block.type) {
    case "skills-chart":
      return <SkillsChartBlock groups={block.groups} skills={context.skills} />;
    case "skill-chips":
      return <SkillChipsBlock names={block.names} skills={context.skills} />;
    case "project":
      return (
        <ProjectsListBlock
          ids={[block.id]}
          projects={context.projects}
          locale={context.locale}
          onOpen={context.onOpenProject}
        />
      );
    case "projects":
      return (
        <ProjectsListBlock
          ids={block.ids}
          projects={context.projects}
          locale={context.locale}
          onOpen={context.onOpenProject}
        />
      );
    case "contact":
      return <ContactBlock socials={context.socials} />;
    case "stats":
      return <StatsBlock items={block.items} />;
    case "timeline":
      return <TimelineBlock items={block.items} />;
    case "text":
      return <TextBlock content={block.content} />;
    default:
      return null;
  }
}
