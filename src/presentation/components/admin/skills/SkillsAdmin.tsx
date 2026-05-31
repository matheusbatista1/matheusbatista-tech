"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";

import type { Skill, SkillCategory } from "@/domain/entities/Skill";
import { useConfirm } from "@/presentation/components/admin/providers/ConfirmProvider";
import { useToast } from "@/presentation/components/admin/providers/ToastProvider";

import { SkillCategoryCard } from "./SkillCategoryCard";
import { SkillModal } from "./SkillModal";
import type { SkillActions } from "./types";
import "./skills.css";

const CATEGORY_ORDER: SkillCategory[] = ["frontend", "backend", "database", "devops", "tools"];

interface EditingState {
  category: SkillCategory;
  skill?: Skill;
}

interface SkillsAdminProps {
  groupedSkills: Record<SkillCategory, Skill[]>;
  actions: SkillActions;
}

export function SkillsAdmin({ groupedSkills, actions }: SkillsAdminProps) {
  const t = useTranslations("admin.skills");
  const { confirm } = useConfirm();
  const { toast } = useToast();
  const [, startDelete] = useTransition();
  const [editing, setEditing] = useState<EditingState | null>(null);

  function openCreate(category: SkillCategory) {
    setEditing({ category });
  }

  function openEdit(skill: Skill) {
    setEditing({ category: skill.category, skill });
  }

  async function onDelete(skill: Skill) {
    const ok = await confirm({
      title: t("confirmRemove"),
      message: t("confirmRemoveDesc", {
        name: skill.name,
        cat: t(`categories.${skill.category}`),
      }),
      danger: true,
      confirmLabel: t("confirmRemove"),
    });
    if (!ok) return;

    startDelete(async () => {
      const result = await actions.delete(skill.id, skill.name, skill.category);
      if (result.error) {
        toast({ title: result.error, kind: "error" });
        return;
      }
      toast({ title: t("removed"), kind: "success" });
    });
  }

  return (
    <>
      <div className="admin-skills-admin">
        {CATEGORY_ORDER.map((category) => {
          const skills = [...(groupedSkills[category] ?? [])].sort((a, b) => a.order - b.order);
          return (
            <SkillCategoryCard
              key={category}
              category={category}
              skills={skills}
              onAdd={() => openCreate(category)}
              onEdit={openEdit}
              onDelete={onDelete}
            />
          );
        })}
      </div>

      {editing && (
        <SkillModal
          mode={editing.skill ? "edit" : "create"}
          category={editing.category}
          skill={editing.skill}
          actions={actions}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}
