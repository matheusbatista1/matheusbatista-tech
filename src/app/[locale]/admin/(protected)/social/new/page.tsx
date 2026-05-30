import Link from "next/link";
import { SocialForm } from "../SocialForm";

export default function AdminSocialNewPage() {
  return (
    <div className="admin-dashboard">
      <div className="admin-section-head">
        <h1>New social link</h1>
        <Link href="/admin/social" className="admin-link">
          ← Back to list
        </Link>
      </div>

      <SocialForm />
    </div>
  );
}
