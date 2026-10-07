import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { pageHref } from "@/components/Pagination";
import { parsePage, parseText } from "@/lib/perfume";
import { ADMIN_PAGE_SIZE, listForAdmin, listParfumeurs } from "@/lib/queries";
import { isAdmin } from "@/lib/session";

import GestionClient from "./GestionClient";

export const metadata: Metadata = {
  title: "Gestion",
  robots: { index: false, follow: false },
};

export default async function GestionPage({ searchParams }: PageProps<"/gestion">) {
  if (!(await isAdmin())) redirect("/");

  const query = await searchParams;
  const filters = {
    parfum: parseText(query.parfum),
    parfumeur: parseText(query.parfumeur),
    description: parseText(query.description),
  };
  const page = parsePage(query.page);

  const [{ items, total }, parfumeurs] = await Promise.all([
    listForAdmin({ ...filters, page }),
    listParfumeurs(),
  ]);

  const totalPages = Math.ceil(total / ADMIN_PAGE_SIZE);
  if (page > 1 && page > totalPages) redirect(pageHref("/gestion", filters, totalPages));

  return (
    <GestionClient
      perfumes={items}
      total={total}
      page={page}
      totalPages={totalPages}
      filters={filters}
      parfumeurs={parfumeurs.map(({ name }) => name)}
    />
  );
}
