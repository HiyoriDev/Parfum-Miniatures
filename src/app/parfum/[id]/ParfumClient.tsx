"use client";

import { useState } from "react";

import Header from "../../../components/Header";

import { supabase } from "../../../../lib/supabase";

import Image from "next/image";

import toast from "react-hot-toast";

import { useRouter } from "next/navigation";

import { useRef } from "react";

export default function ParfumClient({
  perfume,
  isAdmin,
  currentLetter,
  currentPage,
  origin,
  originParfumeur,
}: any) {
  const [editMode, setEditMode] = useState(false);

  const [parfum, setParfum] = useState(perfume?.parfum || "");

  const [parfumeur, setParfumeur] = useState(perfume?.parfumeur || "");

  const [boite, setBoite] = useState(perfume?.boite || "");

  const [type, setType] = useState(perfume?.type || "");

  const [contenance, setContenance] = useState(perfume?.contenance || "");

  const [image, setImage] = useState(perfume?.image_file || "");

  const router = useRouter();

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  return (
    <main className="min-h-screen bg-transparent text-[var(--texte)]">
      <Header />

      <div className="h-24" />

      <section className="px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* IMAGE */}
          <div className="bg-[var(--surface)] rounded-[32px] p-8 shadow-sm border border-black/5">
            <Image
              src={image?.startsWith("http") ? image : `/images/${image}`}
              alt={parfum}
              width={1200}
              height={1400}
              className="w-full rounded-3xl object-contain"
            />

            {editMode && (
              <div className="mt-6">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];

                    if (!file) return;

                    try {
                      const filename = `${Date.now()}-${file.name}`;

                      const { error } = await supabase.storage
                        .from("images")
                        .upload(filename, file);

                      if (error) {
                        console.log(error);

                        toast.error("Erreur upload");

                        return;
                      }

                      const { data: publicUrlData } = supabase.storage
                        .from("images")
                        .getPublicUrl(filename);

                      setImage(publicUrlData.publicUrl);

                      toast.success("Image uploadée ✨");
                    } catch {
                      toast.error("Erreur upload");
                    }
                  }}
                />

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-3 rounded-2xl bg-[var(--texte)] text-[var(--fond)] hover:bg-[var(--accent)] transition-all cursor-pointer"
                >
                  Modifier l’image
                </button>
              </div>
            )}
          </div>

          {/* INFOS */}
          <div>
            {/* PARFUMEUR */}
            {editMode ? (
              <input
                value={parfumeur}
                onChange={(e) => setParfumeur(e.target.value)}
                className="uppercase tracking-[0.3em] text-sm text-[var(--texte)]/50 mb-4 bg-transparent outline-none border-b border-black/10 w-full"
              />
            ) : (
              <p className="uppercase tracking-[0.3em] text-sm text-[var(--texte)]/50 mb-4">
                {parfumeur}
              </p>
            )}

            {/* TITRE */}
            {editMode ? (
              <input
                value={parfum}
                onChange={(e) => setParfum(e.target.value)}
                className="text-7xl font-bold italic font-serif leading-none mb-10 bg-transparent outline-none border-b border-black/10 w-full"
              />
            ) : (
              <h1 className="text-7xl font-bold italic font-serif leading-none mb-10">
                {parfum}
              </h1>
            )}

            {/* CARDS */}
            <div className="space-y-4 max-w-3xl">
              {/* BOITE */}
              <div className="bg-[var(--surface)] rounded-2xl p-5 border border-black/5">
                <p className="text-sm text-[var(--texte)]/50 mb-2">Boîte</p>

                {editMode ? (
                  <div className="flex bg-[var(--fond)] rounded-xl p-1 gap-1 w-fit">
                    <button
                      onClick={() => setBoite("Oui")}
                      className={`px-4 py-2 rounded-lg text-sm transition-all cursor-pointer ${
                        boite === "Oui"
                          ? "bg-[var(--texte)] text-[var(--fond)]"
                          : "hover:bg-black/5"
                      }`}
                    >
                      Oui
                    </button>

                    <button
                      onClick={() => setBoite("Non")}
                      className={`px-4 py-2 rounded-lg text-sm transition-all cursor-pointer ${
                        boite === "Non"
                          ? "bg-[var(--texte)] text-[var(--fond)]"
                          : "hover:bg-black/5"
                      }`}
                    >
                      Non
                    </button>
                  </div>
                ) : (
                  <p className="text-xl">{boite}</p>
                )}
              </div>

              {/* TYPE */}
              <div className="bg-[var(--surface)] rounded-2xl p-5 border border-black/5">
                <p className="text-sm text-[var(--texte)]/50 mb-2">Type</p>

                {editMode ? (
                  <input
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="text-xl bg-transparent outline-none border-b border-black/10 w-full"
                  />
                ) : (
                  <p className="text-xl">{type}</p>
                )}
              </div>

              {/* CONTENANCE */}
              <div className="bg-[var(--surface)] rounded-2xl p-5 border border-black/5">
                <p className="text-sm text-[var(--texte)]/50 mb-2">
                  Contenance
                </p>

                {editMode ? (
                  <input
                    value={contenance}
                    onChange={(e) => setContenance(e.target.value)}
                    className="text-xl bg-transparent outline-none border-b border-black/10 w-full"
                  />
                ) : (
                  <p className="text-xl">{contenance}</p>
                )}
              </div>
            </div>

            {/* ACTIONS */}
            <div className="flex gap-4 mt-10 flex-wrap">
              {isAdmin && !editMode ? (
                <button
                  onClick={() => setEditMode(true)}
                  className="px-8 py-4 rounded-2xl bg-[var(--texte)] text-[var(--fond)] hover:bg-[var(--accent)] transition-all cursor-pointer"
                >
                  Modifier
                </button>
              ) : isAdmin ? (
                <>
                  <button
                    onClick={async () => {
                      try {
                        const { error } = await supabase
                          .from("perfumes")
                          .update({
                            parfum,

                            parfumeur,

                            boite,

                            type,

                            contenance,

                            image_file: image,
                          })
                          .eq("id", perfume.id);

                        if (!error) {
                          toast.success("Sauvegardé ✨");

                          setEditMode(false);
                        } else {
                          toast.error("Erreur save");
                        }
                      } catch {
                        toast.error("Erreur save");
                      }
                    }}
                    className="px-8 py-4 rounded-2xl bg-[var(--texte)] text-[var(--fond)] hover:bg-[var(--accent)] transition-all cursor-pointer"
                  >
                    Sauvegarder
                  </button>

                  <button
                    onClick={() => {
                      setParfum(perfume.parfum);

                      setParfumeur(perfume.parfumeur);

                      setBoite(perfume.boite);

                      setType(perfume.type);

                      setContenance(perfume.contenance);

                      setImage(perfume.image_file);

                      setEditMode(false);
                    }}
                    className="px-8 py-4 rounded-2xl bg-[var(--texte)] text-[var(--fond)] hover:bg-[var(--accent)] transition-all cursor-pointer"
                  >
                    Annuler
                  </button>
                </>
              ) : null}

              <button
                onClick={() => {
                  if (origin === "parfumeur") {
                    router.push(
                      `/parfumeurs/${encodeURIComponent(originParfumeur)}`,
                    );

                    return;
                  }

                  if (origin === "recherche") {
                    router.push("/recherche");

                    return;
                  }

                  router.push(`/?page=${currentPage}&letter=${currentLetter}`);
                }}
                className="px-8 py-4 rounded-2xl bg-[var(--texte)] text-[var(--fond)] hover:bg-[var(--accent)] transition-all cursor-pointer"
              >
                Retour
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
