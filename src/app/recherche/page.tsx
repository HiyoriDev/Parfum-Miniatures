export const dynamic = "force-dynamic";

import { cookies } from "next/headers";

import { verifyToken } from "../../../lib/auth";

import RechercheClient from "./RechercheClient";

export default async function Page() {
  const cookieStore = await cookies();

  const token = cookieStore.get("admin_token")?.value;

  const isAdmin = Boolean(token && verifyToken(token));

  return <RechercheClient isAdmin={isAdmin} />;
}
