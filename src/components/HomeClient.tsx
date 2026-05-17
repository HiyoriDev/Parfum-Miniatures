"use client";

import Header from "./Header";
import Footer from "./Footer";
import Spacer from "./Spacer";

import { useMemo, useState } from "react";

import { useRouter, useSearchParams } from "next/navigation";

import MiniatureCard from "./MiniatureCard";

type Perfume = {
  id: number;
  parfum: string;
  parfumeur: string;
  boite: string;
  type: string;
  contenance: string;
  image_file: string;
};

export default function HomeClient({ perfumes }: { perfumes: Perfume[] }) {
  const ITEMS_PER_PAGE = 30;

  const searchParams = useSearchParams();

  const router = useRouter();

  const currentPage = Number(searchParams.get("page") || "1");

  const selectedLetter = searchParams.get("letter") || "Tous";

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  const filteredPerfumes = useMemo(() => {
    let filtered = [...perfumes];

    filtered.sort((a, b) => b.id - a.id);

    if (selectedLetter !== "Tous") {
      filtered = filtered.filter((perfume) =>
        perfume.parfum?.toUpperCase().startsWith(selectedLetter),
      );
    }

    return filtered;
  }, [perfumes, selectedLetter]);

  const totalPages = Math.ceil(filteredPerfumes.length / ITEMS_PER_PAGE);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

  const currentPerfumes = filteredPerfumes.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  const changeLetter = (letter: string) => {
    router.push(`/?page=1&letter=${letter}`);
  };

  return (
    <main className="min-h-screen bg-transparent text-[var(--texte)] flex flex-col">
      <Header />

      <Spacer />
      <Spacer />

      {/* HERO */}
      <section className="pt-4 pb-8 px-10 text-center">
        <h1 className="text-7xl font-bold italic text-[var(--texte)] mb-10 tracking-wide">
          Miniatures de Parfum
        </h1>

        <h2 className="text-4xl font-light text-[var(--texte)] leading-tight">
          Collection de {perfumes.length} miniatures avec leurs photos
        </h2>
      </section>

      {/* ALPHABET */}
      <section className="px-10 pb-4">
        <div className="flex flex-wrap justify-center gap-2">
          <button
            onClick={() => changeLetter("Tous")}
            className={`px-4 py-2 rounded-xl border border-black/5 transition-all cursor-pointer ${
              selectedLetter === "Tous"
                ? "bg-[var(--texte)] text-[var(--fond)]"
                : "bg-[var(--surface)] text-[var(--texte)] hover:bg-[var(--accent)] hover:text-[var(--texte)]"
            }`}
          >
            Tous
          </button>

          {alphabet.map((letter) => (
            <button
              key={letter}
              onClick={() => changeLetter(letter)}
              className={`px-4 py-2 rounded-xl border border-black/5 transition-all cursor-pointer ${
                selectedLetter === letter
                  ? "bg-[var(--texte)] text-[var(--fond)]"
                  : "bg-[var(--surface)] text-[var(--texte)] hover:bg-[var(--accent)] hover:text-[var(--texte)]"
              }`}
            >
              {letter}
            </button>
          ))}
        </div>
      </section>

      {/* GALERIE */}
      <section className="mt-4 px-4 md:px-8 pb-20">
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-10 gap-6">
          {currentPerfumes.map((perfume) => (
            <MiniatureCard
              id={perfume.id}
              key={perfume.id}
              brand={perfume.parfumeur}
              name={perfume.parfum}
              image={perfume.image_file}
              boite={perfume.boite}
              contenance={perfume.contenance}
              type={perfume.type}
              currentPage={currentPage}
              selectedLetter={selectedLetter}
            />
          ))}
        </div>
        {/* PAGINATION */}
        <div className="flex justify-center items-center gap-2 mt-12 flex-wrap">
          {/* PRECEDENT */}
          <button
            onClick={() =>
              router.push(
                `/?page=${Math.max(currentPage - 1, 1)}&letter=${selectedLetter}`,
              )
            }
            className="px-4 py-2 rounded-xl bg-[var(--surface)] text-[var(--texte)] border border-black/5 hover:bg-[var(--accent)] transition-all cursor-pointer"
          >
            ←
          </button>

          {/* PAGE 1 */}
          <button
            onClick={() => router.push(`/?page=1&letter=${selectedLetter}`)}
            className={`px-4 py-2 rounded-xl border border-black/5 transition-all cursor-pointer ${
              currentPage === 1
                ? "bg-[var(--texte)] text-[var(--fond)]"
                : "bg-[var(--surface)] text-[var(--texte)] hover:bg-[var(--accent)]"
            }`}
          >
            1
          </button>

          {/* ... gauche */}
          {currentPage > 4 && (
            <span className="px-2 text-[var(--texte)]/60">...</span>
          )}

          {/* PAGES AUTOUR */}
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(
              (page) =>
                page !== 1 &&
                page !== totalPages &&
                page >= currentPage - 2 &&
                page <= currentPage + 2,
            )
            .map((page) => (
              <button
                key={page}
                onClick={() =>
                  router.push(`/?page=${page}&letter=${selectedLetter}`)
                }
                className={`px-4 py-2 rounded-xl border border-black/5 transition-all cursor-pointer ${
                  currentPage === page
                    ? "bg-[var(--texte)] text-[var(--fond)]"
                    : "bg-[var(--surface)] text-[var(--texte)] hover:bg-[var(--accent)]"
                }`}
              >
                {page}
              </button>
            ))}

          {/* ... droite */}
          {currentPage < totalPages - 3 && (
            <span className="px-2 text-[var(--texte)]/60">...</span>
          )}

          {/* DERNIERE PAGE */}
          {totalPages > 1 && (
            <button
              onClick={() =>
                router.push(`/?page=${totalPages}&letter=${selectedLetter}`)
              }
              className={`px-4 py-2 rounded-xl border border-black/5 transition-all cursor-pointer ${
                currentPage === totalPages
                  ? "bg-[var(--texte)] text-[var(--fond)]"
                  : "bg-[var(--surface)] text-[var(--texte)] hover:bg-[var(--accent)]"
              }`}
            >
              {totalPages}
            </button>
          )}

          {/* SUIVANT */}
          <button
            onClick={() =>
              router.push(
                `/?page=${Math.min(currentPage + 1, totalPages)}&letter=${selectedLetter}`,
              )
            }
            className="px-4 py-2 rounded-xl bg-[var(--surface)] text-[var(--texte)] border border-black/5 hover:bg-[var(--accent)] transition-all cursor-pointer"
          >
            →
          </button>
        </div>
      </section>

      <Footer />
    </main>
  );
}
