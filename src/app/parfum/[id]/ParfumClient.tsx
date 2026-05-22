"use client";

import { useState } from "react";

import Header from "../../../components/Header";

import { supabase } from "../../../../lib/supabase";

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
  returnUrl,
}: any) {
  const [editMode, setEditMode] = useState(false);

  const [parfum, setParfum] = useState(perfume?.parfum || "");

  const [parfumeur, setParfumeur] = useState(perfume?.parfumeur || "");

  const [boite, setBoite] = useState(perfume?.boite || "");

  const [type, setType] = useState(perfume?.type || "");

  const [contenance, setContenance] = useState(perfume?.contenance || "");

  const [description, setDescription] = useState(perfume?.description || "");

  const [image, setImage] = useState(perfume?.image_file || "");

  const router = useRouter();

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const optimizedImage = image?.startsWith("http") ? image : `/images/${image}`;

  const typeLabels: Record<string, string> = {
    ADP: "Absolu de Parfum",
    APP: "Applicateur",
    LAR: "Lotion Après Rasage",
    ASL: "After Shave Lotion",
    ASB: "After Shave Balm",
    B: "Bain",
    BR: "Brillantine",
    BAR: "Baume Après Rasage",
    BP: "Boîte à poudre",
    C: "Cologne",
    CA: "Jeu de cartes",
    CC: "Cologne Concentrate",
    CP: "Cologne Parfumée",
    D: "Dentifrice",
    E: "Eau",
    EE: "Eau d'Extrait",
    EDC: "Eau de Cologne",
    EDCF: "????",
    EDF: "Eau de Fraicheur",
    EDT: "Eau de Toilette",
    EDP: "Eau de Parfum",
    EDPC: "Eau de Parfum Concentrée",
    EDPE: "Eau de Parfum Extrême",
    EDPF: "Eau de Parfum Florale",
    EDPI: "Eau de Parfum Intense",
    EDPL: "Eau de Parfum Légère",
    EDPP: "Eau de Parfum Poudrée",
    EDPS: "Eau de Parfum Spray",
    EDS: "Eau de Sport",
    EDTC: "Eau de Toilette Concentrée",
    EDTF: "Eau de Toilette Fraiche",
    EDTI: "Eau de Toilette Intense",
    EDTL: "Eau de Toilette Légère",
    EDTS: "Eau de Toilette Spray",
    EDTV: "Eau de Toilette Vitalisante",
    EF: "Eau Florale",
    EP: "Eau Parfumée",
    ESP: "Esprit de Parfum",
    EXT: "Extrait",
    EXP: "Extrait de Parfum",
    FDP: "Fleur de Parfum",
    F: "Friction",
    GD: "Gel Douche",
    H: "Huile",
    L: "Lotion",
    LAIT: "Lait",
    P: "Parfum",
    PC: "Parfum Crème",
    PDT: "Parfum de Toilette",
    PSL: "Pre Shave Lotion",
    S: "Savon",
    SHP: "Shampooing",
    T: "Talc",
    V: "Voile",
    XDP: "Extrême de Parfum",
  };

  const perfumeTypes = Object.keys(typeLabels);

  return (
    <main className="min-h-screen bg-transparent text-[var(--texte)]">
      <Header />

      <div className="h-24" />

      <section className="px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* IMAGE */}
          <div className="bg-[var(--surface)] rounded-[32px] p-8 shadow-sm border border-black/5">
            <img
              src={optimizedImage}
              alt={parfum}
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
                      const imageBitmap = await createImageBitmap(file);

                      const canvas = document.createElement("canvas");

                      canvas.width = 640;
                      canvas.height = 480;

                      const ctx = canvas.getContext("2d");

                      if (!ctx) {
                        toast.error("Erreur canvas");
                        return;
                      }

                      ctx.fillStyle = "#ffffff";
                      ctx.fillRect(0, 0, 640, 480);

                      /* RATIO */

                      const scale = Math.min(
                        640 / imageBitmap.width,
                        480 / imageBitmap.height,
                      );

                      const width = imageBitmap.width * scale;

                      const height = imageBitmap.height * scale;

                      const x = (640 - width) / 2;

                      const y = (480 - height) / 2;

                      ctx.drawImage(imageBitmap, x, y, width, height);

                      const blob = await new Promise<Blob | null>((resolve) => {
                        canvas.toBlob(resolve, "image/jpeg", 0.8);
                      });

                      if (!blob) {
                        toast.error("Erreur image");
                        return;
                      }

                      const filename = `${Date.now()}.jpg`;

                      const optimizedFile = new File([blob], filename, {
                        type: "image/jpeg",
                      });

                      const { error } = await supabase.storage
                        .from("images")
                        .upload(filename, optimizedFile);

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
              {/* LIGNE */}
              <div className="grid grid-cols-[180px_320px_180px] gap-4">
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
                    <p className="text-xl">{boite || "Inconnu"}</p>
                  )}
                </div>

                {/* TYPE */}
                <div className="bg-[var(--surface)] rounded-2xl p-5 border border-black/5">
                  <p className="text-sm text-[var(--texte)]/50 mb-2">Type</p>

                  {editMode ? (
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="text-xl bg-[var(--surface)] outline-none border-b border-black/10 w-full"
                    >
                      {perfumeTypes.map((perfumeType) => (
                        <option key={perfumeType} value={perfumeType}>
                          {perfumeType}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-xl">
                      {typeLabels[type] || type || "Inconnu"}
                    </p>
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
                    <p className="text-xl">{contenance || "Inconnu"}</p>
                  )}
                </div>
              </div>

              {/* DESCRIPTION */}
              <div className="bg-[var(--surface)] rounded-2xl p-5 border border-black/5 w-[712px]">
                <p className="text-sm text-[var(--texte)]/50 mb-2">
                  Description
                </p>

                {editMode ? (
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Description..."
                    className="w-full min-h-[140px] bg-transparent outline-none resize-none"
                  />
                ) : (
                  <p className="text-lg whitespace-pre-wrap">
                    {description || "Aucune description"}
                  </p>
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

                            description,

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

                      setDescription(perfume.description);

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
                    router.push(returnUrl || "/recherche");

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
