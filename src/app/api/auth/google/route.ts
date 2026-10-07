import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";

import { googleLoginEnabled } from "@/lib/env";
import { CALLBACK_PATH, OAUTH_COOKIE, startGoogleLogin } from "@/lib/google";

/** Bouton « Se connecter avec Google » : part vers la page de choix de compte Google. */
export async function GET(request: NextRequest) {
  if (!googleLoginEnabled()) redirect("/connexion?erreur=indisponible");

  const { url, cookie } = startGoogleLogin(request.nextUrl.origin);
  (await cookies()).set(OAUTH_COOKIE, cookie, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    // "lax" : le cookie doit revenir avec la redirection depuis accounts.google.com.
    sameSite: "lax",
    path: CALLBACK_PATH,
    maxAge: 10 * 60,
  });

  redirect(url);
}
