import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getPerfume, listParfumeurs } from "@/lib/queries";
import { isAdmin } from "@/lib/session";

import PerfumeDetail from "./PerfumeDetail";

async function findPerfume(id: string) {
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId <= 0) return null;
  return getPerfume(numericId);
}

export async function generateMetadata({ params }: PageProps<"/parfum/[id]">): Promise<Metadata> {
  const perfume = await findPerfume((await params).id);
  if (!perfume) return { title: "Miniature introuvable" };

  const title = `${perfume.parfum} — ${perfume.parfumeur}`;
  const description = `Miniature ${perfume.parfum} de ${perfume.parfumeur} : photo, type, contenance et présence de la boîte.`;
  return {
    title,
    description,
    alternates: { canonical: `/parfum/${perfume.id}` },
    openGraph: {
      title,
      description,
      images: [{ url: perfume.image_file, width: 640, height: 480 }],
    },
  };
}

export default async function PerfumePage({ params }: PageProps<"/parfum/[id]">) {
  const perfume = await findPerfume((await params).id);
  if (!perfume) notFound();

  // Les noms de parfumeurs ne servent qu'à l'édition : inutile de les envoyer aux visiteurs.
  const parfumeurs = (await isAdmin()) ? (await listParfumeurs()).map(({ name }) => name) : [];

  return <PerfumeDetail perfume={perfume} parfumeurs={parfumeurs} />;
}
