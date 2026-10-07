"use client";

import Link from "next/link";
import { useTransition } from "react";
import toast from "react-hot-toast";

import { logout } from "@/app/actions/auth";

import { useIsAdmin } from "./AdminProvider";

export default function Footer() {
  const isAdmin = useIsAdmin();
  const [pending, startTransition] = useTransition();

  return (
    <footer className="border-t border-texte/5 bg-surface/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-screen-2xl items-center justify-between gap-4 px-4 py-5 text-sm md:px-8">
        <p className="text-texte/70">© {new Date().getFullYear()} Parfum Miniatures</p>

        {isAdmin ? (
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                await logout();
                toast.success("Déconnexion réussie");
              })
            }
            className="text-texte/80 transition-colors hover:text-accent-fonce"
          >
            Déconnexion
          </button>
        ) : (
          <Link
            href="/connexion"
            prefetch={false}
            className="text-texte/80 transition-colors hover:text-accent-fonce"
          >
            Connexion
          </Link>
        )}
      </div>
    </footer>
  );
}
