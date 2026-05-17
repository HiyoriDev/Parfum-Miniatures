"use client";

import { useState } from "react";

import LoginModal from "./LoginModal";

import { useRouter } from "next/navigation";

import toast from "react-hot-toast";

import { useAdmin } from "../context/AdminContext";

export default function Footer() {
  const [open, setOpen] = useState(false);

  const router = useRouter();

  const { isAdmin, setIsAdmin } = useAdmin();

  async function handleLogout() {
    await fetch("/api/logout", {
      method: "POST",
    });

    setIsAdmin(false);

    toast.success("Déconnexion réussie 👋");
  }

  return (
    <>
      <footer className="bg-[var(--surface)] border-t border-black/5 px-8 py-6 flex items-center justify-between">
        <p className="text-sm text-[var(--texte)]/70">
          © 2026 Parfum Miniatures
        </p>

        {!isAdmin ? (
          <button
            onClick={() => setOpen(true)}
            className="text-sm text-[var(--texte)] transition-all hover:text-[var(--accent)] hover:opacity-100 cursor-pointer"
          >
            Connexion
          </button>
        ) : (
          <button
            onClick={() => {
              handleLogout();

              router.push("/");
            }}
            className="text-sm text-[var(--texte)] transition-all hover:text-[var(--accent)] hover:opacity-100 cursor-pointer"
          >
            Déconnexion
          </button>
        )}
      </footer>

      <LoginModal isOpen={open} onClose={() => setOpen(false)} />
    </>
  );
}
