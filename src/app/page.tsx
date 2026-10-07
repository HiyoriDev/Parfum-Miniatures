import { redirect } from "next/navigation";

import AlphabetFilter from "@/components/AlphabetFilter";
import EmptyState from "@/components/EmptyState";
import MiniatureGrid from "@/components/MiniatureGrid";
import Pagination, { pageHref } from "@/components/Pagination";
import { formatCount, LETTERS, parseLetter, parsePage, plural } from "@/lib/perfume";
import { getCollectionStats, listPerfumes, PAGE_SIZE } from "@/lib/queries";

export default async function HomePage({ searchParams }: PageProps<"/">) {
  const query = await searchParams;
  const letter = parseLetter(query.letter);
  const page = parsePage(query.page);

  const [stats, { items, total }] = await Promise.all([
    getCollectionStats(),
    listPerfumes({ letter, page }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const params = { letter: letter ?? undefined };
  if (page > 1 && page > totalPages) redirect(pageHref("/", params, totalPages));

  return (
    <div className="mx-auto max-w-screen-2xl px-4 pt-8 pb-16 md:px-8 md:pt-14">
      <section className="mb-8 text-center md:mb-12">
        <h1 className="font-display text-5xl font-semibold tracking-wide italic sm:text-6xl lg:text-7xl">
          Miniatures de Parfum
        </h1>
        <p className="mx-auto mt-4 max-w-3xl text-lg leading-snug text-texte/85 sm:text-2xl md:mt-6 md:text-3xl md:font-light">
          Collection de {formatCount(stats.total)} miniatures avec leurs photos, dont{" "}
          {formatCount(stats.withBox)} avec leur boîte
        </p>
      </section>

      <AlphabetFilter pathname="/" letters={LETTERS} active={letter} allLabel="Tous" />

      <p className="mt-6 mb-4 text-center text-sm text-texte-doux">
        {letter
          ? `${plural(total, "miniature")} ${letter === "#" ? "commençant par un chiffre" : `en ${letter}`}`
          : "Les plus récentes en premier"}
      </p>

      {items.length > 0 ? (
        <MiniatureGrid perfumes={items} />
      ) : (
        <EmptyState title="Aucune miniature pour cette lettre" />
      )}

      <Pagination page={page} totalPages={totalPages} pathname="/" params={params} />
    </div>
  );
}
