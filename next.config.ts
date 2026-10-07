import type { NextConfig } from "next";

const supabaseOrigin = new URL(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://oyrmxekkaymoxulkrpqc.supabase.co",
).origin;

const isDev = process.env.NODE_ENV === "development";

// Les photos sont servies directement par Supabase Storage (balises <img>) :
// le navigateur ne parle jamais à l'API Supabase, toutes les lectures et
// écritures passent par le serveur Next.
// 'unsafe-eval' et va.vercel-scripts.com ne servent qu'en développement
// (reconstruction des call stacks React, scripts debug de Vercel Analytics).
const contentSecurityPolicy = [
  `default-src 'self'`,
  // panel.chez-chlopie.fr : script de mesure d'audience du Central Admin.
  `script-src 'self' 'unsafe-inline' https://panel.chez-chlopie.fr${isDev ? " 'unsafe-eval' https://va.vercel-scripts.com" : ""}`,
  `style-src 'self' 'unsafe-inline'`,
  // blob: pour l'aperçu local d'une photo avant son envoi.
  `img-src 'self' data: blob: ${supabaseOrigin}`,
  `font-src 'self'`,
  `connect-src 'self' https://panel.chez-chlopie.fr${isDev ? " https://va.vercel-scripts.com" : ""}`,
  `object-src 'none'`,
  `base-uri 'self'`,
  `form-action 'self'`,
  `frame-ancestors 'none'`,
].join("; ");

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Photos redimensionnées côté navigateur (~200 Ko) et import Excel (4 Mo max).
      bodySizeLimit: "5mb",
    },
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: contentSecurityPolicy },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
          },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
        ],
      },
    ];
  },
};

export default nextConfig;
