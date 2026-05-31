import { container } from "@/infrastructure/container";
import { PageHead } from "@/presentation/components/admin/shell/PageHead";
import { SocialView } from "@/presentation/components/admin/social/SocialView";

import {
  createSocialAction,
  deleteSocialAction,
  reorderSocialsAction,
  toggleSocialVisibleAction,
  updateSocialAction,
} from "./actions";

export default async function AdminSocialListPage() {
  const links = await container.useCases.listAllSocialLinks.execute();
  const sorted = [...links].sort((a, b) => a.order - b.order);

  return (
    <div className="admin-dashboard">
      <PageHead
        title="Social links"
        lead="Manage the social profiles and contact links surfaced across the portfolio. Drag rows to reorder."
      />
      <SocialView
        links={sorted}
        actions={{
          create: createSocialAction,
          update: updateSocialAction,
          delete: deleteSocialAction,
          reorder: reorderSocialsAction,
          toggleVisible: toggleSocialVisibleAction,
        }}
      />
    </div>
  );
}
