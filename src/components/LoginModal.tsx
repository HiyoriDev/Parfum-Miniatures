"use client";

import { useState } from "react";

import toast from "react-hot-toast";

import { useAdmin } from "../context/AdminContext";

type Props = {
  isOpen: boolean;

  onClose: () => void;
};

export default function LoginModal({ isOpen, onClose }: Props) {
  const { setIsAdmin } = useAdmin();

  const [username, setUsername] = useState("");

  const [password, setPassword] = useState("");

  const [error, setError] = useState("");

  if (!isOpen) return null;

  async function handleLogin() {
    setError("");

    const response = await fetch("/api/login", {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        username: username.trim(),
        password: password.trim(),
      }),
    });

    const data = await response.json();

    if (!data.success) {
      setError("Identifiants invalides");

      return;
    }

    setIsAdmin(true);

    toast.success("Connexion réussie 😄");

    onClose();
  }

  return (
    <div className="fixed inset-0 z-[999] bg-black/50 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="bg-[var(--surface)] rounded-[32px] p-8 w-full max-w-[420px] border border-black/5 shadow-2xl">
        <h2 className="text-3xl font-semibold mb-8 text-center text-[var(--texte)]">
          Connexion Admin
        </h2>

        <div className="flex flex-col gap-6">
          <input
            type="text"
            placeholder="Utilisateur"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="h-12 px-4 rounded-xl border border-black/10 bg-[var(--fond)] text-[var(--texte)] outline-none focus:border-[var(--accent)] transition-all"
          />

          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-12 px-4 rounded-xl border border-black/10 bg-[var(--fond)] text-[var(--texte)] outline-none focus:border-[var(--accent)] transition-all"
          />

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button
            onClick={handleLogin}
            className="h-12 rounded-xl bg-[var(--texte)] text-[var(--fond)] cursor-pointer transition-all hover:bg-[var(--accent)] hover:text-[var(--texte)] hover:scale-[1.02] active:scale-[0.98]"
          >
            Se connecter
          </button>

          <button
            onClick={onClose}
            className="text-sm text-[var(--texte)]/60 hover:text-[var(--texte)] transition-all cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
