"use server";

import { refresh } from "next/cache";

import { deleteSession } from "@/lib/session";

export async function logout() {
  await deleteSession();
  refresh();
}
