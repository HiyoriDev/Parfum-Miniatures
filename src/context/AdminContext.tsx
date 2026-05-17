"use client";

import { createContext, useContext, useEffect, useState } from "react";

type AdminContextType = {
  isAdmin: boolean;

  setIsAdmin: (value: boolean) => void;
};

const AdminContext = createContext<AdminContextType>({
  isAdmin: false,
  setIsAdmin: () => {},
});

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch("/api/check-auth");

        const data = await response.json();

        setIsAdmin(data.isAdmin);
      } catch {
        setIsAdmin(false);
      }
    }

    checkAuth();
  }, []);

  return (
    <AdminContext.Provider
      value={{
        isAdmin,
        setIsAdmin,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  return useContext(AdminContext);
}
