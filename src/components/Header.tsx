"use client";

import Link from "next/link";

import { useAdmin } from "../context/AdminContext";

export default function Header() {
  const { isAdmin } = useAdmin();

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-[var(--surface)]/90 backdrop-blur-md border-b border-black/5 shadow-sm">
      <div className="px-7 py-3 flex items-center">
        {/* LOGO */}
        <div>
          <Link
            href="/"
            className="text-[28px] font-semibold text-[var(--texte)] no-underline transition-all duration-200 inline-block hover:scale-[1.03] hover:text-[var(--accent)]"
          >
            Notre Collection
          </Link>
        </div>

        {/* MENU */}
        <div className="ml-auto flex gap-16 items-center">
          {/* GESTION ADMIN */}
          {isAdmin && (
            <Link
              href="/gestion"
              className="text-[28px] font-semibold text-[var(--texte)] no-underline transition-all duration-200 inline-block hover:scale-[1.03] hover:text-[var(--accent)]"
            >
              Gestion
            </Link>
          )}
          <Link
            href="/parfumeurs"
            className="text-[28px] font-semibold text-[var(--texte)] no-underline transition-all duration-200 inline-block hover:scale-[1.03] hover:text-[var(--accent)]"
          >
            Parfumeurs
          </Link>

          <Link
            href="/recherche"
            className="text-[28px] font-semibold text-[var(--texte)] no-underline transition-all duration-200 inline-block hover:scale-[1.03] hover:text-[var(--accent)]"
          >
            Recherche
          </Link>
        </div>
      </div>
    </header>
  );
}
