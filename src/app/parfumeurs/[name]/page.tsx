import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import BackButton from "@/components/BackButton";
import MiniatureGrid from "@/components/MiniatureGrid";
import Pagination, { pageHref } from "@/components/Pagination";
import { initialLetter, parsePage, plural } from "@/lib/perfume";
import { listByParfumeur, PAGE_SIZE } from "@/lib/queries";

/**
 * Next 16.4 transmet le nom encodé à la page (« M%C3%A4urer ») mais déjà décodé
 * à generateMetadata (« Mäurer ») : on décode quand c'est possible, sinon on
 * garde la valeur telle quelle (ex. « 100% » déjà décodé).
 */
function parfumeurName(raw: string) {
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

export async function generateMetadata({
  params,
}: PageProps<"/parfumeurs/[name]">): Promise<Metadata> {
  const name = parfumeurName((await params).name);
  return {
    title: name,
    description: `Les miniatures de parfum ${name} de la collection, avec leurs photos.`,
  };
}

export default async function ParfumeurPage({
  params,
  searchParams,
}: PageProps<"/parfumeurs/[name]">) {
  const name = parfumeurName((await params).name);
  const page = parsePage((await searchParams).page);

  const { items, total } = await listByParfumeur(name, page);
  if (total === 0) notFound();

  const pathname = `/parfumeurs/${encodeURIComponent(name)}`;
  const totalPages = Math.ceil(total / PAGE_SIZE);
  if (page > totalPages) redirect(pageHref(pathname, {}, totalPages));

  const letter = initialLetter(name) ?? "A";

  return (
    <div className="mx-auto max-w-screen-2xl px-4 pt-4 pb-16 md:px-8 md:pt-8">
      <BackButton
        fallback={`/parfumeurs?letter=${encodeURIComponent(letter)}`}
        label="Parfumeurs"
      />

      <div className="mt-4 mb-8">
        <h1 className="font-display text-5xl font-semibold break-words italic md:text-6xl">
          {name}
        </h1>
        <p className="mt-2 text-texte-doux">{plural(total, "miniature")}</p>
      </div>

      <MiniatureGrid perfumes={items} />
      <Pagination page={page} totalPages={totalPages} pathname={pathname} />
    </div>
  );
}
