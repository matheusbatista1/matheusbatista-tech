import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/infrastructure/auth/auth";
import { AdminNav } from "@/presentation/components/admin/AdminNav";

export default async function AdminProtectedLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  if (!session?.user) {
    redirect("/admin/signin");
  }

  return (
    <div className="admin-shell">
      <header className="admin-topbar">
        <div className="admin-brand">
          <span className="dot" aria-hidden="true" />
          <span>Admin · matheusbatista.tech</span>
        </div>

        <div className="admin-topbar-right">
          <span className="admin-user" title={session.user.email ?? undefined}>
            {session.user.name ?? session.user.email}
          </span>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/admin/signin" });
            }}
          >
            <button type="submit" className="admin-signout">
              Sign out
            </button>
          </form>
        </div>
      </header>

      <AdminNav />

      <div className="admin-body">{children}</div>
    </div>
  );
}
