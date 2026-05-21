import { supabase } from "../../../../lib/supabase";

import Header from "../../../components/Header";
import Spacer from "../../../components/Spacer";
import MiniatureCard from "../../../components/MiniatureCard";

import Link from "next/link";

export default async function ParfumeurPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;

  const decodedName = decodeURIComponent(name);

  const { data: filteredPerfumes } = await supabase
    .from("perfumes")
    .select("*")
    .eq("parfumeur", decodedName)
    .order("parfum", { ascending: true });

  const perfumes = filteredPerfumes || [];

  return (
    <main className="min-h-screen bg-transparent text-[var(--texte)] flex flex-col">
      <Header />

      <Spacer />
      <Spacer />

      <section className="p-10">
        {/* HEADER */}
        <section className="mb-12">
          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
            <div className="flex flex-col gap-8">
              <div>
                <Link
                  href="/parfumeurs"
                  className="inline-block px-9 py-3.5 rounded-2xl bg-[var(--texte)] text-[var(--fond)] text-[18px] transition-all hover:bg-[var(--accent)] hover:text-[var(--texte)] hover:scale-[1.02] active:scale-[0.98]"
                >
                  ← Retour aux parfumeurs
                </Link>
              </div>

              <div>
                <h1 className="text-5xl font-light break-words text-[var(--texte)]">
                  {decodedName}
                </h1>

                <p className="mt-4 text-[var(--texte)]/60 text-lg">
                  {perfumes.length} miniatures
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* LISTE */}
        <section>
          <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-10 gap-4">
            {perfumes.map((perfume) => (
              <MiniatureCard
                id={perfume.id}
                key={perfume.id}
                brand={perfume.parfumeur}
                name={perfume.parfum}
                image={perfume.image_file!}
                boite={perfume.boite}
                contenance={perfume.contenance}
                type={perfume.type}
                origin="parfumeur"
                parfumeurName={decodedName}
              />
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
