"use client";

import Image from "next/image";
import Link from "next/link";

type MiniatureCardProps = {
  id: number;
  brand: string;
  name: string;
  image: string;
  boite: string;
  contenance: string;
  type: string;
  currentPage?: number;
  selectedLetter?: string;
  origin?: string;
  parfumeurName?: string;
  searchParams?: string;
};

export default function MiniatureCard({
  id,
  brand,
  name,
  image,
  currentPage,
  selectedLetter,
  origin,
  parfumeurName,
  searchParams,
}: MiniatureCardProps) {
  const optimizedImage = image
    ? image.startsWith("http")
      ? `${image}?width=300&format=webp&quality=70`
      : `/images/${image}`
    : "/placeholder.png";
  return (
    <>
      {/* CARTE */}
      <Link
        href={
          origin === "parfumeur"
            ? `/parfum/${id}?origin=parfumeur&parfumeur=${encodeURIComponent(parfumeurName || "")}`
            : currentPage
              ? `/parfum/${id}?page=${currentPage}&letter=${selectedLetter}&origin=home`
              : `/parfum/${id}?origin=recherche&return=/recherche?${searchParams}`
        }
        className="bg-[var(--surface)] hover:-translate-y-1 rounded-2xl p-3 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer border border-black/5 block"
      >
        <Image
          src={optimizedImage}
          alt={name}
          width={400}
          height={500}
          className="rounded-xl mb-3 w-full aspect-[4/5] object-cover"
        />

        <h3 className="font-medium text-sm truncate text-[var(--texte)]">
          {name}
        </h3>

        <p className="text-xs text-[var(--texte)]/70 truncate">{brand}</p>
      </Link>
    </>
  );
}
