import { cookies } from "next/headers";

import { redirect } from "next/navigation";

import { verifyToken } from "../../../lib/auth";

import GestionClient from "./GestionClient";

export default async function GestionPage() {
  const cookieStore = await cookies();

  const token = cookieStore.get("admin_token")?.value;

  if (!token || !verifyToken(token)) {
    redirect("/");
  }

  return <GestionClient />;
}
