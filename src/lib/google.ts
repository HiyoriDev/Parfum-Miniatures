import "server-only";

import { createHash, randomBytes } from "node:crypto";

import { createRemoteJWKSet, jwtVerify } from "jose";

import { env } from "./env";

const AUTHORIZE_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_KEYS = createRemoteJWKSet(new URL("https://www.googleapis.com/oauth2/v3/certs"));

/** Cookie temporaire qui relie le départ vers Google et le retour sur le site. */
export const OAUTH_COOKIE = "google_oauth";
export const CALLBACK_PATH = "/api/auth/google/callback";

const randomToken = () => randomBytes(32).toString("base64url");

/**
 * Prépare la redirection vers Google. `state` empêche qu'un tiers fasse revenir
 * quelqu'un sur le site avec sa propre réponse ; `verifier` (PKCE) garantit que
 * seul ce serveur peut échanger le code renvoyé par Google.
 */
export function startGoogleLogin(origin: string) {
  const state = randomToken();
  const verifier = randomToken();
  const challenge = createHash("sha256").update(verifier).digest("base64url");

  const url = new URL(AUTHORIZE_URL);
  url.search = new URLSearchParams({
    client_id: env.googleClientId,
    redirect_uri: new URL(CALLBACK_PATH, origin).href,
    response_type: "code",
    scope: "openid email",
    state,
    code_challenge: challenge,
    code_challenge_method: "S256",
    // Laisse choisir parmi plusieurs comptes Google connectés.
    prompt: "select_account",
  }).toString();

  return { url: url.href, cookie: JSON.stringify({ state, verifier }) };
}

/** Échange le code renvoyé par Google et renvoie l'adresse e-mail vérifiée du compte. */
export async function finishGoogleLogin({
  code,
  verifier,
  origin,
}: {
  code: string;
  verifier: string;
  origin: string;
}) {
  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: env.googleClientId,
      client_secret: env.googleClientSecret,
      code,
      code_verifier: verifier,
      grant_type: "authorization_code",
      redirect_uri: new URL(CALLBACK_PATH, origin).href,
    }),
  });
  if (!response.ok) {
    throw new Error(
      `Échange du code Google refusé (${response.status}) : ${await response.text()}`,
    );
  }

  const { id_token: idToken } = (await response.json()) as { id_token?: string };
  if (!idToken) throw new Error("Réponse Google sans id_token");

  // Signature, émetteur, destinataire et expiration du jeton d'identité.
  const { payload } = await jwtVerify(idToken, GOOGLE_KEYS, {
    issuer: ["https://accounts.google.com", "accounts.google.com"],
    audience: env.googleClientId,
  });
  if (typeof payload.email !== "string" || payload.email_verified !== true) {
    throw new Error("Adresse e-mail Google absente ou non vérifiée");
  }
  return payload.email.toLowerCase();
}

export function isAllowedAdminEmail(email: string) {
  return env.adminGoogleEmails.includes(email.toLowerCase());
}
