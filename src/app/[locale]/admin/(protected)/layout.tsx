import "@/presentation/app/admin.css";
import "@/presentation/components/admin/ui/primitives.css";

import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { auth, signOut } from "@/infrastructure/auth/auth";
import { container } from "@/infrastructure/container";
import { AccessDenied } from "@/presentation/components/admin/AccessDenied";
import { AdminContent } from "@/presentation/components/admin/AdminContent";
import { AdminScrollDiag } from "@/presentation/components/admin/AdminScrollDiag";
import { AdminSidebar } from "@/presentation/components/admin/AdminSidebar";
import { AdminTopbar } from "@/presentation/components/admin/AdminTopbar";
import { AmbientBackground } from "@/presentation/components/admin/AmbientBackground";
import { ConfirmProvider } from "@/presentation/components/admin/providers/ConfirmProvider";
import { ToastProvider } from "@/presentation/components/admin/providers/ToastProvider";
import { AdminShellProvider } from "@/presentation/components/admin/shell/AdminShellContext";

interface AdminProtectedLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function AdminProtectedLayout({
  children,
  params,
}: AdminProtectedLayoutProps) {
  const { locale } = await params;
  const session = await auth();

  if (!session?.user?.email) {
    redirect(`/${locale}/admin/signin`);
  }

  const allowedEmails = (process.env.AUTH_ALLOWED_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);

  if (allowedEmails.length > 0 && !allowedEmails.includes(session.user.email)) {
    return <AccessDenied email={session.user.email} />;
  }

  const unreadMessages = await container.useCases.listMessages.execute({ unreadOnly: true });
  const unreadCount = unreadMessages.length;

  async function signOutAction() {
    "use server";
    await signOut({ redirectTo: "/admin/signin" });
  }

  return (
    <ToastProvider>
      {process.env.NODE_ENV !== "production" && <AdminScrollDiag />}
      <ConfirmProvider>
        <AdminShellProvider>
          <div className="admin-shell" data-theme="dark">
            <AmbientBackground />
            <div className="admin-grid">
              <AdminSidebar
                user={{
                  name: session.user.name ?? null,
                  email: session.user.email,
                  image: session.user.image ?? null,
                }}
                unreadCount={unreadCount}
                signOutAction={signOutAction}
              />
              <div className="admin-main">
                <AdminTopbar title="Admin" hasNotifications={unreadCount > 0} />
                <AdminContent>{children}</AdminContent>
              </div>
            </div>
          </div>
        </AdminShellProvider>
      </ConfirmProvider>
    </ToastProvider>
  );
}
