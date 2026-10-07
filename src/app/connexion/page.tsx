import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { googleLoginEnabled } from "@/lib/env";
import { isAdmin } from "@/lib/session";

export const metadata: Metadata = {
  title: "Connexion",
  robots: { index: false, follow: false },
};

const ERRORS: Record<string, string> = {
  refusee: "Ce compte Google n'est pas autorisé à administrer le site.",
  annulee: "Connexion Google annulée.",
  expiree: "La demande de connexion a expiré, recommence.",
  google: "Google n'a pas pu confirmer la connexion. Réessaie dans un instant.",
  indisponible: "La connexion Google n'est pas encore configurée.",
};

export default async function ConnexionPage({ searchParams }: PageProps<"/connexion">) {
  if (await isAdmin()) redirect("/gestion");

  const { erreur } = await searchParams;
  const google = googleLoginEnabled();
  const error = google
    ? typeof erreur === "string"
      ? ERRORS[erreur]
      : undefined
    : ERRORS.indisponible;

  return (
    <div className="mx-auto max-w-md px-4 pt-10 pb-16 md:pt-16">
      <section className="panel p-6 md:p-8">
        <h1 className="font-display text-4xl font-semibold">Connexion admin</h1>
        <p className="mt-2 text-sm text-texte-doux">Réservée aux comptes Google autorisés.</p>

        {error && (
          <p role="alert" className="mt-5 rounded-2xl bg-red-700/10 p-4 text-sm text-red-900">
            {error}
          </p>
        )}

        {google && (
          // Lien classique (pas <Link>) : la page Google doit s'ouvrir par une vraie navigation.
          <a href="/api/auth/google" className="btn btn-secondary mt-6 h-12 w-full bg-white">
            <GoogleLogo />
            Se connecter avec Google
          </a>
        )}
      </section>
    </div>
  );
}

function GoogleLogo() {
  return (
    <svg aria-hidden viewBox="0 0 48 48" className="size-5">
      <path
        fill="#FFC107"
        d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z"
      />
      <path
        fill="#FF3D00"
        d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.6-.4-3.9z"
      />
    </svg>
  );
}
