"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

type Props = {
  pathname: string;
  letters: readonly string[];
  active: string | null;
  /** Libellé du choix « sans filtre » ; absent = pas de choix « Tous ». */
  allLabel?: string;
};

const chip =
  "grid h-10 min-w-10 shrink-0 snap-start place-items-center rounded-xl px-3 text-sm font-medium transition-colors";

/** Lettres sur une ligne qui défile au doigt sur mobile, sur plusieurs lignes ailleurs. */
export default function AlphabetFilter({ pathname, letters, active, allLabel }: Props) {
  const listRef = useRef<HTMLUListElement>(null);
  const activeRef = useRef<HTMLAnchorElement>(null);

  // Centre la lettre active dans la ligne défilante, sans faire défiler la page.
  useEffect(() => {
    const list = listRef.current;
    const link = activeRef.current;
    if (!list || !link || list.scrollWidth <= list.clientWidth) return;
    list.scrollLeft = link.offsetLeft - (list.clientWidth - link.clientWidth) / 2;
  }, [active]);

  const entries: [string | null, string][] = [
    ...(allLabel ? [[null, allLabel] as [null, string]] : []),
    ...letters.map((letter) => [letter, letter] as [string, string]),
  ];

  return (
    <nav aria-label="Filtrer par lettre" className="-mx-4 md:mx-0">
      <ul
        ref={listRef}
        className="relative no-scrollbar flex snap-x scroll-px-4 gap-1.5 overflow-x-auto px-4 py-1 md:flex-wrap md:justify-center md:overflow-visible md:px-0"
      >
        {entries.map(([letter, label]) => {
          const isActive = letter === active;
          const href = letter ? `${pathname}?letter=${encodeURIComponent(letter)}` : pathname;
          return (
            <li key={label}>
              <Link
                ref={isActive ? activeRef : undefined}
                href={href}
                scroll={false}
                aria-current={isActive ? "true" : undefined}
                aria-label={letter === "#" ? "Chiffres" : undefined}
                className={`${chip} ${
                  isActive
                    ? "bg-texte text-fond"
                    : "border border-texte/5 bg-carte/80 text-texte hover:bg-surface"
                }`}
              >
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
