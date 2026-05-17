"use client";

import { useState } from "react";

import Header from "./Header";
import Spacer from "./Spacer";

import Link from "next/link";

export default function ParfumeursClient({ perfumes }: { perfumes: any[] }) {
  const [selectedLetter, setSelectedLetter] = useState("A");

  const groupedParfumeurs = perfumes.reduce(
    (acc, perfume) => {
      const name = perfume.parfumeur;

      if (!acc[name]) {
        acc[name] = 0;
      }

      acc[name]++;

      return acc;
    },
    {} as Record<string, number>,
  );

  const sortedParfumeurs = Object.entries(groupedParfumeurs) as [
    string,
    number,
  ][];

  sortedParfumeurs.sort((a, b) => a[0].localeCompare(b[0]));

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  const filteredParfumeurs = sortedParfumeurs.filter(([name]) =>
    name.toUpperCase().startsWith(selectedLetter),
  );

  return (
    <main className="min-h-screen bg-transparent text-[var(--texte)] flex flex-col">
      <Header />

      <Spacer />
      <Spacer />

      <section className="p-10">
        {/* TITRE + ALPHABET */}
        <section className="mb-12">
          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
            <h1 className="text-5xl font-light whitespace-nowrap text-[var(--texte)]">
              Parfumeurs
            </h1>

            <div className="flex flex-wrap gap-2 xl:justify-end">
              {alphabet.map((letter) => (
                <button
                  key={letter}
                  onClick={() => setSelectedLetter(letter)}
                  className={`px-4 py-2 rounded-xl border border-black/5 transition-all whitespace-nowrap cursor-pointer ${
                    selectedLetter === letter
                      ? "bg-[var(--texte)] text-[var(--fond)]"
                      : "bg-[var(--surface)] text-[var(--texte)] hover:bg-[var(--accent)] hover:text-[var(--texte)]"
                  }`}
                >
                  {letter}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* LISTE */}
        <section>
          <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-4">
            {filteredParfumeurs.map(([name, count]) => (
              <Link
                key={name}
                href={`/parfumeurs/${encodeURIComponent(name)}`}
                className="bg-[var(--surface)] rounded-2xl p-5 shadow-sm hover:shadow-xl transition-all duration-300 border border-black/5 hover:border-[var(--accent)]"
              >
                <h2 className="font-semibold text-lg text-[var(--texte)]">
                  {name}
                </h2>

                <p className="text-sm text-[var(--texte)]/70 mt-2">
                  {count} miniatures
                </p>
              </Link>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
