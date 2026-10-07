"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { ArrowLeft } from "lucide-react";

let inAppNavigations = 0;

/** À placer une fois dans le layout : compte les navigations faites dans le site. */
export function NavigationTracker() {
  const pathname = usePathname();
  const previous = useRef(pathname);

  useEffect(() => {
    if (previous.current !== pathname) {
      previous.current = pathname;
      inAppNavigations += 1;
    }
  }, [pathname]);

  return null;
}

/**
 * Vrai si la page précédente de l'historique appartient au site. L'API Navigation
 * le sait exactement ; à défaut (anciens navigateurs), on se fie au compteur.
 */
function previousPageIsOnSite() {
  const { navigation } = window as Window & { navigation?: { canGoBack: boolean } };
  return navigation ? navigation.canGoBack : inAppNavigations > 0;
}

/**
 * Revient à la page précédente du site (même page de la liste, même position),
 * ou au lien de repli si la fiche a été ouverte directement (lien partagé…).
 */
export default function BackButton({
  fallback,
  label = "Retour",
}: {
  fallback: string;
  label?: string;
}) {
  const router = useRouter();

  return (
    <Link
      href={fallback}
      onClick={(event) => {
        if (event.metaKey || event.ctrlKey || !previousPageIsOnSite()) return;
        event.preventDefault();
        router.back();
      }}
      className="inline-flex items-center gap-2 rounded-xl py-2 pr-3 text-sm font-medium text-texte-doux transition-colors hover:text-texte"
    >
      <ArrowLeft aria-hidden size={18} />
      {label}
    </Link>
  );
}
