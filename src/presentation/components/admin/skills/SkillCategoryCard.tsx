"use client";

import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";

import type { Skill, SkillCategory } from "@/domain/entities/Skill";
import { Card } from "@/presentation/components/admin/ui/Card";
import { IconButton } from "@/presentation/components/admin/ui/IconButton";

import { SkillChip } from "./SkillChip";

interface SkillCategoryCardProps {
  category: SkillCategory;
  skills: Skill[];
  onAdd: () => void;
  onEdit: (skill: Skill) => void;
  onDelete: (skill: Skill) => void;
}

export function SkillCategoryCard({
  category,
  skills,
  onAdd,
  onEdit,
  onDelete,
}: SkillCategoryCardProps) {
  const t = useTranslations("admin.skills");

  return (
    <Card className="admin-skill-cat-card">
      <h3>
        {t(`categories.${category}`)}
        <IconButton
          aria-label={t("add")}
          tooltip={t("add")}
          onClick={onAdd}
          icon={<Plus size={14} />}
        />
      </h3>
      {skills.length === 0 ? (
        <span className="admin-skill-empty">{t("noSkillsYet")}</span>
      ) : (
        <div className="list">
          {skills.map((skill) => (
            <SkillChip
              key={skill.id}
              skill={skill}
              onOpen={() => onEdit(skill)}
              onDelete={() => onDelete(skill)}
            />
          ))}
        </div>
      )}
    </Card>
  );
}
