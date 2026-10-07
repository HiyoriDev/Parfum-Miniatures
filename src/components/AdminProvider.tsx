"use client";

import { createContext, use } from "react";

const AdminContext = createContext(false);

/** L'état admin est lu côté serveur (cookie de session) dans le layout racine. */
export function AdminProvider({
  isAdmin,
  children,
}: {
  isAdmin: boolean;
  children: React.ReactNode;
}) {
  return <AdminContext value={isAdmin}>{children}</AdminContext>;
}

export function useIsAdmin() {
  return use(AdminContext);
}
