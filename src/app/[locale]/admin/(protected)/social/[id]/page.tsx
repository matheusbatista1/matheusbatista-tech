import Link from "next/link";
import { notFound } from "next/navigation";
import { container } from "@/infrastructure/container";
import { SocialForm } from "../SocialForm";
import { deleteSocialAction } from "../actions";

interface AdminSocialEditPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminSocialEditPage({ params }: AdminSocialEditPageProps) {
  const { id } = await params;
  const social = await container.useCases.getSocialLinkById.execute(id);
  if (!social) notFound();

  return (
    <div className="admin-dashboard">
      <div className="admin-section-head">
        <h1>{social.name}</h1>
        <Link href="/admin/social" className="admin-link">
          ← Back to list
        </Link>
      </div>

      <SocialForm social={social} />

      <form
        action={async () => {
          "use server";
          await deleteSocialAction(id);
        }}
        className="admin-danger-zone"
      >
        <h3>Danger zone</h3>
        <p>This deletes the social link permanently.</p>
        <button type="submit" className="admin-danger-btn">
          Delete link
        </button>
      </form>
    </div>
  );
}
