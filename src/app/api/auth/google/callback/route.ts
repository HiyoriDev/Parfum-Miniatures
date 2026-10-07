import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";

import { CALLBACK_PATH, finishGoogleLogin, isAllowedAdminEmail, OAUTH_COOKIE } from "@/lib/google";
import { createSession } from "@/lib/session";

/** Retour depuis Google : vérifie la réponse puis ouvre la session admin si l'adresse est autorisée. */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const cookieStore = await cookies();
  const saved = cookieStore.get(OAUTH_COOKIE)?.value;
  cookieStore.delete({ name: OAUTH_COOKIE, path: CALLBACK_PATH });

  // Fenêtre Google fermée ou « Annuler ».
  if (params.get("error")) redirect("/connexion?erreur=annulee");

  let expected: { state?: string; verifier?: string } = {};
  try {
    expected = JSON.parse(saved ?? "{}");
  } catch {}

  const code = params.get("code");
  if (!code || !expected.state || !expected.verifier || params.get("state") !== expected.state) {
    redirect("/connexion?erreur=expiree");
  }

  let email: string;
  try {
    email = await finishGoogleLogin({
      code,
      verifier: expected.verifier,
      origin: request.nextUrl.origin,
    });
  } catch (error) {
    console.error(error);
    redirect("/connexion?erreur=google");
  }

  if (!isAllowedAdminEmail(email)) {
    console.warn("Connexion Google refusée pour", email);
    redirect("/connexion?erreur=refusee");
  }

  await createSession();
  redirect("/gestion");
}
