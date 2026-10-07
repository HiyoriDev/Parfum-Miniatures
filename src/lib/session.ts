import "server-only";

import { cookies } from "next/headers";
import { jwtVerify, SignJWT } from "jose";

import { env } from "./env";

const COOKIE_NAME = "admin_token";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

type SessionPayload = { role: "admin"; method: "google" };

const secretKey = () => new TextEncoder().encode(env.jwtSecret);

export async function createSession() {
  const token = await new SignJWT({ role: "admin", method: "google" } satisfies SessionPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setSubject("admin")
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .sign(secretKey());

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    // "lax" (et non "strict") : la connexion Google revient sur le site par une
    // redirection depuis accounts.google.com, où un cookie "strict" ne serait
    // pas envoyé. Les Server Actions vérifient de toute façon l'origine.
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function isAdmin(): Promise<boolean> {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return false;

  try {
    const { payload } = await jwtVerify(token, secretKey(), { algorithms: ["HS256"] });
    // Seules les sessions ouvertes via Google sont valables (l'ancienne connexion
    // par mot de passe a été retirée, ses sessions ne doivent plus fonctionner).
    return payload.role === "admin" && payload.method === "google";
  } catch {
    return false;
  }
}

/** À appeler en tête de chaque Server Action / Route Handler d'administration. */
export async function requireAdmin() {
  if (!(await isAdmin())) {
    throw new Error("Non autorisé");
  }
}
