export const SITE_NAME = "Miniatures de Parfum";

// Domaine de production fourni par Vercel (domaine personnalisé compris).
export const SITE_URL = new URL(
  process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000",
);
