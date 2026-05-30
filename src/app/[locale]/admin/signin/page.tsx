import { redirect } from "next/navigation";
import { auth, signIn } from "@/infrastructure/auth/auth";
import { isAuthConfigured } from "@/infrastructure/config/env";

interface SignInPageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const session = await auth();
  if (session?.user) redirect("/admin");

  const { error } = await searchParams;

  return (
    <main className="admin-signin">
      <div className="admin-signin-card">
        <div className="admin-signin-mark">mb.</div>
        <h1>Sign in to admin</h1>
        <p>Restricted to the configured email allowlist.</p>

        {error && (
          <p className="admin-signin-error">
            {error === "AccessDenied"
              ? "This Google account is not allowed."
              : "Could not sign in. Please try again."}
          </p>
        )}

        {isAuthConfigured ? (
          <form
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: "/admin" });
            }}
          >
            <button type="submit" className="admin-signin-google">
              <span aria-hidden="true">G</span>
              Continue with Google
            </button>
          </form>
        ) : (
          <p className="admin-signin-warn">
            Auth not configured. Set <code>AUTH_GOOGLE_ID</code>, <code>AUTH_GOOGLE_SECRET</code>,{" "}
            <code>AUTH_SECRET</code> and <code>AUTH_ALLOWED_EMAILS</code> in <code>.env.local</code>
            .
          </p>
        )}
      </div>
    </main>
  );
}
