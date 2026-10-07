"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, ExternalLink, X } from "lucide-react";

import { typeLabel, type Perfume } from "@/lib/perfume";

type Props = {
  perfumes: Perfume[];
  index: number;
  onIndexChange: (index: number) => void;
  onClose: () => void;
};

const roundButton =
  "grid size-12 shrink-0 place-items-center rounded-full bg-texte text-fond shadow-lg transition hover:bg-accent-fonce active:scale-95";

/** Visionneuse plein écran des résultats : flèches, clavier et balayage au doigt. */
export default function Lightbox({ perfumes, index, onIndexChange, onClose }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const touchStartX = useRef<number | null>(null);
  const perfume = perfumes[index];

  const go = (step: number) => onIndexChange((index + step + perfumes.length) % perfumes.length);
  // Un clic dans le vide autour de la fiche ferme la visionneuse.
  const closeOnBackdrop = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) onClose();
  };

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  if (!perfume) return null;

  return (
    <dialog
      ref={dialogRef}
      aria-label={`${perfume.parfum} — ${perfume.parfumeur}`}
      onClose={onClose}
      onKeyDown={(event) => {
        if (event.key === "ArrowRight") go(1);
        if (event.key === "ArrowLeft") go(-1);
      }}
      onTouchStart={(event) => {
        touchStartX.current = event.touches[0].clientX;
      }}
      onTouchEnd={(event) => {
        if (touchStartX.current === null) return;
        const distance = event.changedTouches[0].clientX - touchStartX.current;
        touchStartX.current = null;
        if (Math.abs(distance) > 50) go(distance < 0 ? 1 : -1);
      }}
      className="m-0 h-dvh max-h-none w-screen max-w-none bg-transparent p-0 text-texte backdrop:bg-texte/60 backdrop:backdrop-blur-md"
    >
      <div
        onClick={closeOnBackdrop}
        className="flex h-full flex-col p-3 pt-[calc(0.75rem+env(safe-area-inset-top))] pb-[calc(0.75rem+env(safe-area-inset-bottom))] md:p-8"
      >
        <div className="mb-3 flex items-center justify-between text-fond">
          <span className="rounded-full bg-texte/60 px-4 py-2 text-sm tracking-[0.2em] tabular-nums">
            {index + 1} / {perfumes.length}
          </span>
          <button type="button" onClick={onClose} aria-label="Fermer" className={roundButton}>
            <X aria-hidden size={22} />
          </button>
        </div>

        <div onClick={closeOnBackdrop} className="flex min-h-0 flex-1 items-center gap-4">
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Miniature précédente"
            className={`${roundButton} max-md:hidden`}
          >
            <ChevronLeft aria-hidden size={26} />
          </button>

          <article className="mx-auto grid max-h-full min-h-0 w-full max-w-6xl grid-rows-[auto_minmax(0,1fr)] overflow-hidden rounded-3xl bg-fond shadow-2xl md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] md:grid-rows-1">
            <div className="flex items-center justify-center bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                key={perfume.id}
                src={perfume.image_file}
                alt={perfume.parfum}
                className="max-h-[42dvh] w-full object-contain md:max-h-[80dvh]"
              />
            </div>

            <div className="overflow-y-auto p-5 md:p-10">
              <p className="text-xs font-medium tracking-[0.25em] text-accent-fonce uppercase">
                {perfume.parfumeur}
              </p>
              <h2 className="mt-2 font-display text-4xl leading-none font-semibold break-words italic md:text-6xl">
                {perfume.parfum}
              </h2>

              <dl className="mt-6 grid grid-cols-3 gap-2 text-sm">
                {[
                  ["Boîte", perfume.boite || "Inconnue"],
                  ["Type", typeLabel(perfume.type)],
                  ["Contenance", perfume.contenance || "Inconnue"],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-2xl bg-carte p-3">
                    <dt className="text-[11px] tracking-widest text-texte-doux uppercase">
                      {label}
                    </dt>
                    <dd className="mt-1 leading-tight font-medium">{value}</dd>
                  </div>
                ))}
              </dl>

              {perfume.description && (
                <p className="mt-4 text-sm leading-relaxed whitespace-pre-wrap">
                  {perfume.description}
                </p>
              )}

              <Link href={`/parfum/${perfume.id}`} className="btn btn-secondary mt-6">
                <ExternalLink aria-hidden size={16} />
                Voir la fiche
              </Link>
            </div>
          </article>

          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Miniature suivante"
            className={`${roundButton} max-md:hidden`}
          >
            <ChevronRight aria-hidden size={26} />
          </button>
        </div>

        {/* Sur mobile, les flèches passent sous la fiche (balayage aussi possible). */}
        <div className="mt-3 flex justify-center gap-6 md:hidden">
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Miniature précédente"
            className={roundButton}
          >
            <ChevronLeft aria-hidden size={26} />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Miniature suivante"
            className={roundButton}
          >
            <ChevronRight aria-hidden size={26} />
          </button>
        </div>
      </div>
    </dialog>
  );
}
