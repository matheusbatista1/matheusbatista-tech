import { container } from "@/infrastructure/container";
import { getTranslations } from "next-intl/server";
import { PageHead } from "@/presentation/components/admin/shell/PageHead";
import { SkillsAdmin } from "@/presentation/components/admin/skills/SkillsAdmin";
import { createSkillAction, deleteSkillAction, updateSkillAction } from "./actions";

export default async function AdminSkillsListPage() {
  const grouped = await container.useCases.groupSkillsByCategory.execute();
  const t = await getTranslations("admin.skills");

  return (
    <div className="admin-dashboard">
      <PageHead title={t("title")} lead={t("lead")} />
      <SkillsAdmin
        groupedSkills={grouped}
        actions={{
          create: createSkillAction,
          update: updateSkillAction,
          delete: deleteSkillAction,
        }}
      />
    </div>
  );
}
