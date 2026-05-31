import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/presentation/lib/i18n/request.ts");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // typedRoutes: ativar depois quando navegacao localizada via next-intl estiver pronta (fase 2)
  images: {
    remotePatterns: [
      // TODO: adicionar dominios de upload (Vercel Blob / S3) na fase de assets
    ],
  },
  async redirects() {
    return [
      {
        source: "/admin/projects/new",
        destination: "/admin/projects",
        permanent: false,
      },
      {
        source: "/:locale(en|pt|es)/admin/projects/new",
        destination: "/:locale/admin/projects",
        permanent: false,
      },
      {
        source: "/admin/projects/:id",
        destination: "/admin/projects",
        permanent: false,
      },
      {
        source: "/:locale(en|pt|es)/admin/projects/:id",
        destination: "/:locale/admin/projects",
        permanent: false,
      },
      {
        source: "/admin/skills/new",
        destination: "/admin/skills",
        permanent: false,
      },
      {
        source: "/:locale(en|pt|es)/admin/skills/new",
        destination: "/:locale/admin/skills",
        permanent: false,
      },
      {
        source: "/admin/skills/:id",
        destination: "/admin/skills",
        permanent: false,
      },
      {
        source: "/:locale(en|pt|es)/admin/skills/:id",
        destination: "/:locale/admin/skills",
        permanent: false,
      },
      {
        source: "/admin/social/new",
        destination: "/admin/social",
        permanent: false,
      },
      {
        source: "/:locale(en|pt|es)/admin/social/new",
        destination: "/:locale/admin/social",
        permanent: false,
      },
      {
        source: "/admin/social/:id",
        destination: "/admin/social",
        permanent: false,
      },
      {
        source: "/:locale(en|pt|es)/admin/social/:id",
        destination: "/:locale/admin/social",
        permanent: false,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=()",
          },
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: blob: https:; font-src 'self' https://fonts.gstatic.com data:; connect-src 'self' https://generativelanguage.googleapis.com https://*.upstash.io https://vitals.vercel-insights.com https://vercel.live; frame-ancestors 'none'; base-uri 'self'; object-src 'none'; form-action 'self'",
          },
        ],
      },
      {
        source: "/admin/:path*",
        headers: [{ key: "Content-Security-Policy", value: "frame-ancestors 'none'" }],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
