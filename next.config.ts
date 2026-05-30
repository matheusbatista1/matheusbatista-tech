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
};

export default withNextIntl(nextConfig);
