import "server-only";

function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Variable d'environnement manquante : ${name} (voir README.md)`);
  }
  return value;
}

// Lecture paresseuse : une variable absente ne casse que la fonctionnalité qui
// en a besoin (ex. la clé secrète n'est nécessaire que pour les écritures).
export const env = {
  get supabaseUrl() {
    return required("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL);
  },
  get supabaseAnonKey() {
    return required("NEXT_PUBLIC_SUPABASE_ANON_KEY", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  },
  get supabaseSecretKey() {
    return required(
      "SUPABASE_SECRET_KEY",
      process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY,
    );
  },
  get jwtSecret() {
    return required("JWT_SECRET", process.env.JWT_SECRET);
  },
  get googleClientId() {
    return required("GOOGLE_CLIENT_ID", process.env.GOOGLE_CLIENT_ID);
  },
  get googleClientSecret() {
    return required("GOOGLE_CLIENT_SECRET", process.env.GOOGLE_CLIENT_SECRET);
  },
  /** Adresses Google autorisées à ouvrir la session admin (toutes ouvrent le même compte). */
  get adminGoogleEmails() {
    return required("ADMIN_GOOGLE_EMAILS", process.env.ADMIN_GOOGLE_EMAILS)
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean);
  },
};

/** Vrai quand la connexion Google est configurée (sinon son bouton n'est pas proposé). */
export function googleLoginEnabled() {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET &&
    process.env.ADMIN_GOOGLE_EMAILS,
  );
}
