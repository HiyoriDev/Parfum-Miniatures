import type { Metadata } from "next";
import Link from "next/link";

import AlphabetFilter from "@/components/AlphabetFilter";
import EmptyState from "@/components/EmptyState";
import { initialLetter, parseLetter, plural } from "@/lib/perfume";
import { listParfumeurs } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Parfumeurs",
  description: "Tous les parfumeurs de la collection de miniatures, de A à Z.",
};

const LETTERS = [..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"];

export default async function ParfumeursPage({ searchParams }: PageProps<"/parfumeurs">) {
  const letter = parseLetter((await searchParams).letter) ?? "A";
  const parfumeurs = (await listParfumeurs()).filter(({ name }) => initialLetter(name) === letter);

  return (
    <div className="mx-auto max-w-screen-2xl px-4 pt-8 pb-16 md:px-8 md:pt-12">
      <div className="mb-6 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h1 className="font-display text-5xl font-semibold italic md:text-6xl">Parfumeurs</h1>
          <p className="mt-2 text-texte-doux">
            {plural(parfumeurs.length, "parfumeur")} en {letter}
          </p>
        </div>
        <AlphabetFilter pathname="/parfumeurs" letters={LETTERS} active={letter} />
      </div>

      {parfumeurs.length > 0 ? (
        <ul className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {parfumeurs.map(({ name, total }) => (
            <li key={name}>
              <Link
                href={`/parfumeurs/${encodeURIComponent(name)}`}
                className="panel flex h-full items-center justify-between gap-3 px-5 py-4 transition hover:-translate-y-0.5 hover:border-accent/50 motion-reduce:hover:translate-y-0"
              >
                <span className="min-w-0 font-semibold break-words">{name}</span>
                <span className="shrink-0 rounded-full bg-texte/5 px-2.5 py-1 text-xs text-texte-doux tabular-nums">
                  {total}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState title={`Aucun parfumeur en ${letter}`} />
      )}
    </div>
  );
}
