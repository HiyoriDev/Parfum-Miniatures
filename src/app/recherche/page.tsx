import type { Metadata } from "next";
import Form from "next/form";
import { redirect } from "next/navigation";
import { Search } from "lucide-react";

import EmptyState from "@/components/EmptyState";
import Pagination, { pageHref } from "@/components/Pagination";
import { parsePage, parseText, plural } from "@/lib/perfume";
import { PAGE_SIZE, searchPerfumes } from "@/lib/queries";

import SearchResults from "./SearchResults";

export const metadata: Metadata = {
  title: "Recherche",
  description: "Rechercher une miniature de parfum par nom ou par parfumeur.",
};

export default async function RecherchePage({ searchParams }: PageProps<"/recherche">) {
  const query = await searchParams;
  const parfum = parseText(query.parfum);
  const parfumeur = parseText(query.parfumeur);
  const page = parsePage(query.page);
  const submitted = "parfum" in query || "parfumeur" in query;
  const hasCriteria = parfum !== "" || parfumeur !== "";

  const { items, total } = hasCriteria
    ? await searchPerfumes({ parfum, parfumeur, page })
    : { items: [], total: 0 };

  const totalPages = Math.ceil(total / PAGE_SIZE);
  if (page > 1 && page > totalPages) {
    redirect(pageHref("/recherche", { parfum, parfumeur }, Math.max(totalPages, 1)));
  }

  return (
    <div className="mx-auto max-w-screen-2xl px-4 pt-8 pb-16 md:px-8 md:pt-12">
      <h1 className="text-center font-display text-5xl font-semibold italic md:text-7xl">
        Recherche
      </h1>

      {/* key : remet les champs à jour quand on revient sur une recherche précédente. */}
      <Form
        key={`${parfum}|${parfumeur}`}
        action="/recherche"
        className="panel mx-auto mt-8 grid max-w-3xl gap-4 p-5 md:mt-10 md:grid-cols-[1fr_1fr_auto] md:items-end md:p-6"
      >
        <div>
          <label htmlFor="recherche-parfum" className="label">
            Nom du parfum
          </label>
          <input
            id="recherche-parfum"
            name="parfum"
            type="search"
            defaultValue={parfum}
            enterKeyHint="search"
            className="field"
          />
        </div>
        <div>
          <label htmlFor="recherche-parfumeur" className="label">
            Nom du parfumeur
          </label>
          <input
            id="recherche-parfumeur"
            name="parfumeur"
            type="search"
            defaultValue={parfumeur}
            enterKeyHint="search"
            className="field"
          />
        </div>
        <button type="submit" className="btn btn-primary h-11">
          <Search aria-hidden size={18} />
          Rechercher
        </button>
      </Form>

      <section aria-live="polite" className="mt-10">
        {submitted && !hasCriteria && (
          <EmptyState title="Renseigne au moins un champ">
            Le nom du parfum, celui du parfumeur, ou les deux.
          </EmptyState>
        )}

        {hasCriteria && total === 0 && (
          <EmptyState title="Aucune miniature trouvée">
            Vérifie l&apos;orthographe ou essaie avec une partie du nom seulement.
          </EmptyState>
        )}

        {total > 0 && (
          <>
            <p className="mb-4 text-sm tracking-[0.2em] text-texte-doux uppercase">
              {plural(total, "résultat")}
            </p>
            <SearchResults perfumes={items} />
            <Pagination
              page={page}
              totalPages={totalPages}
              pathname="/recherche"
              params={{ parfum, parfumeur }}
            />
          </>
        )}
      </section>
    </div>
  );
}
