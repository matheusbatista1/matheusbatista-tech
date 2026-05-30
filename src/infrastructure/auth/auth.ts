import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/infrastructure/db/prisma";
import { env } from "@/infrastructure/config/env";

const ALLOWED_EMAILS = env.AUTH_ALLOWED_EMAILS
  ? env.AUTH_ALLOWED_EMAILS.split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean)
  : [];

const googleProviders =
  env.AUTH_GOOGLE_ID && env.AUTH_GOOGLE_SECRET
    ? [
        Google({
          clientId: env.AUTH_GOOGLE_ID,
          clientSecret: env.AUTH_GOOGLE_SECRET,
        }),
      ]
    : [];

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: googleProviders,
  session: { strategy: "database" },
  pages: {
    signIn: "/admin/signin",
    error: "/admin/signin",
  },
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;
      if (ALLOWED_EMAILS.length === 0) return false;
      return ALLOWED_EMAILS.includes(user.email.toLowerCase());
    },
    async session({ session, user }) {
      session.user.id = user.id;
      return session;
    },
  },
  secret: env.AUTH_SECRET ?? "dev-only-not-for-production",
  trustHost: true,
});
