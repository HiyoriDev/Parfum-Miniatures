import Link from "next/link";

import { typeLabel, type PerfumeSummary } from "@/lib/perfume";

import Photo from "./Photo";

type Props = {
  perfume: PerfumeSummary;
  /** Ouvre un aperçu au lieu de la fiche (clic simple uniquement : Ctrl/⌘-clic garde le lien). */
  onOpen?: () => void;
  priority?: boolean;
};

export default function MiniatureCard({ perfume, onOpen, priority }: Props) {
  return (
    <Link
      href={`/parfum/${perfume.id}`}
      // Pas de gestionnaire du tout hors aperçu : la carte reste alors un composant serveur.
      onClick={
        onOpen &&
        ((event) => {
          if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
          event.preventDefault();
          onOpen();
        })
      }
      className="group block rounded-2xl border border-texte/5 bg-carte/85 p-2 shadow-[0_1px_2px_rgb(53_39_31/0.05)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_12px_28px_-12px_rgb(53_39_31/0.35)] motion-reduce:transition-none motion-reduce:hover:translate-y-0"
    >
      <Photo
        src={perfume.image_file}
        alt={perfume.parfum}
        priority={priority}
        className="rounded-xl"
      />

      <div className="space-y-0.5 px-1.5 pt-2.5 pb-1">
        <p className="truncate text-sm font-semibold">{perfume.parfum}</p>
        <p className="truncate text-xs text-texte-doux">{perfume.parfumeur}</p>
        <p className="truncate text-xs text-texte-doux/90">
          <span className="font-medium text-texte/80">{typeLabel(perfume.type)}</span>
          {perfume.contenance && <> · {perfume.contenance}</>}
        </p>
      </div>
    </Link>
  );
}
