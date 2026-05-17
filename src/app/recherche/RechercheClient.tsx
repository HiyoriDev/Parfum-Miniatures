"use client";

import { useEffect, useState } from "react";

import { useRouter, useSearchParams } from "next/navigation";

import toast from "react-hot-toast";

import Header from "../../components/Header";

import MiniatureCard from "../../components/MiniatureCard";

import { supabase } from "../../../lib/supabase";

export default function RecherchePage() {
  const router = useRouter();

  const searchParams = useSearchParams();

  const [parfum, setParfum] = useState(searchParams.get("parfum") || "");

  const [parfumeur, setParfumeur] = useState(
    searchParams.get("parfumeur") || "",
  );

  const [results, setResults] = useState<any[]>([]);

  const [perfumes, setPerfumes] = useState<any[]>([]);

  useEffect(() => {
    const fetchPerfumes = async () => {
      const { data } = await supabase
        .from("perfumes")
        .select("*")
        .range(0, 10000);

      setPerfumes(data || []);
    };

    fetchPerfumes();
  }, []);

  /* RECHERCHE AUTO URL */
  useEffect(() => {
    const parfumValue = searchParams.get("parfum")?.toLowerCase().trim() || "";

    const parfumeurValue =
      searchParams.get("parfumeur")?.toLowerCase().trim() || "";

    if (parfumValue === "" && parfumeurValue === "") {
      setResults([]);

      return;
    }

    const filtered = perfumes.filter((perfume) => {
      const matchParfum =
        parfumValue === "" ||
        perfume.parfum?.toLowerCase().includes(parfumValue);

      const matchParfumeur =
        parfumeurValue === "" ||
        perfume.parfumeur?.toLowerCase().includes(parfumeurValue);

      return matchParfum && matchParfumeur;
    });

    setResults(filtered);
  }, [searchParams]);

  /* RECHERCHE */
  const handleSearch = () => {
    const parfumValue = parfum.trim();

    const parfumeurValue = parfumeur.trim();

    if (parfumValue === "" && parfumeurValue === "") {
      toast.error("Veuillez remplir un champ 😄");

      return;
    }

    const params = new URLSearchParams();

    if (parfumValue) {
      params.set("parfum", parfumValue);
    }

    if (parfumeurValue) {
      params.set("parfumeur", parfumeurValue);
    }

    router.push(`/recherche?${params.toString()}`);
  };

  return (
    <main className="min-h-screen bg-transparent text-[var(--texte)] flex flex-col">
      <Header />

      {/* ESPACE HEADER */}
      <section className="h-24 select-none">.</section>

      {/* HERO */}
      <section className="px-10 pt-10 pb-16 text-center">
        <h1 className="text-5xl font-light mb-14 text-[var(--texte)]">
          Recherche
        </h1>

        {/* FORMULAIRE */}
        <section className="flex justify-center mt-10">
          <div className="w-full max-w-[420px] bg-[var(--surface)] rounded-[32px] p-8 border border-black/5 shadow-sm">
            {/* PARFUM */}
            <div className="mb-7">
              <label className="block mb-3 text-lg font-medium text-[var(--texte)]">
                Nom du parfum
              </label>

              <input
                type="text"
                value={parfum}
                onChange={(e) => setParfum(e.target.value)}
                className="w-full h-12 px-4 rounded-2xl border border-black/10 bg-[var(--fond)] text-[var(--texte)] outline-none focus:border-[var(--accent)] transition-all"
              />
            </div>

            {/* PARFUMEUR */}
            <div className="mb-10">
              <label className="block mb-3 text-lg font-medium text-[var(--texte)]">
                Nom du parfumeur
              </label>

              <input
                type="text"
                value={parfumeur}
                onChange={(e) => setParfumeur(e.target.value)}
                className="w-full h-12 px-4 rounded-2xl border border-black/10 bg-[var(--fond)] text-[var(--texte)] outline-none focus:border-[var(--accent)] transition-all"
              />
            </div>

            {/* BOUTON */}
            <div className="flex justify-center">
              <button
                onClick={handleSearch}
                className="px-8 py-3 rounded-2xl bg-[var(--texte)] text-[var(--fond)] text-lg cursor-pointer transition-all hover:bg-[var(--accent)] hover:text-[var(--texte)] hover:scale-[1.02] active:scale-[0.98]"
              >
                Rechercher
              </button>
            </div>
          </div>
        </section>
      </section>

      {/* RESULTATS */}
      <section className="flex-1 px-4 md:px-8 pb-20">
        {results.length > 0 && (
          <>
            <p className="text-[var(--texte)]/60 mb-8">
              {results.length} résultats
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-10 gap-6">
              {results.map((perfume) => (
                <MiniatureCard
                  id={perfume.id}
                  key={perfume.id}
                  brand={perfume.parfumeur}
                  name={perfume.parfum}
                  image={perfume.image_file!}
                  boite={perfume.boite}
                  contenance={perfume.contenance}
                  type={perfume.type}
                />
              ))}
            </div>
          </>
        )}
      </section>
    </main>
  );
}
