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
