"use client";

import { useEffect, useState } from "react";

import { useRouter, useSearchParams } from "next/navigation";

import toast from "react-hot-toast";

import Header from "../../components/Header";

import { useRef } from "react";

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

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const [editMode, setEditMode] = useState(false);

  /* TEMP ADMIN */
  const isAdmin = true;

  const selectedPerfume =
    selectedIndex !== null ? results[selectedIndex] : null;

  /* EDIT STATES */
  const [editParfum, setEditParfum] = useState("");

  const [editParfumeur, setEditParfumeur] = useState("");

  const [editBoite, setEditBoite] = useState("");

  const [editType, setEditType] = useState("");

  const [editContenance, setEditContenance] = useState("");

  useEffect(() => {
    setParfum(searchParams.get("parfum") || "");

    setParfumeur(searchParams.get("parfumeur") || "");
  }, [searchParams.toString()]);

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

  /* RECHERCHE AUTO */
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

    if (filtered.length === 0) {
      toast.error("Aucune miniature trouvée 😢");
    }
  }, [searchParams.toString(), perfumes]);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

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

  /* OPEN POPUP */
  const openPopup = (index: number) => {
    const perfume = results[index];

    setEditParfum(perfume.parfum || "");

    setEditParfumeur(perfume.parfumeur || "");

    setEditBoite(perfume.boite || "");

    setEditType(perfume.type || "");

    setEditContenance(perfume.contenance || "");

    setEditMode(false);

    setSelectedIndex(index);
  };

  /* CLAVIER */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIndex === null) return;

      if (e.key === "Escape") {
        setSelectedIndex(null);
      }

      if (e.key === "ArrowRight") {
        openPopup(((selectedIndex ?? 0) + 1) % results.length);
      }

      if (e.key === "ArrowLeft") {
        openPopup(((selectedIndex ?? 0) - 1 + results.length) % results.length);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedIndex, results]);

  /* SEARCH */
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
    <main
      className="min-h-screen text-[var(--texte)] flex flex-col relative overflow-hidden"
      style={{
        backgroundImage:
          "linear-gradient(rgba(237,231,220,0.18), rgba(237,231,220,0.18)), url('/background.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <Header />

      <section className="h-24 select-none">.</section>

      {/* HERO */}
      <section className="px-10 pt-10 pb-16 text-center">
        <h1 className="text-7xl font-light mb-14 tracking-tight text-[var(--texte)]">
          Recherche
        </h1>

        {/* FORM */}
        <section className="flex justify-center mt-10">
          <div className="w-full max-w-[460px] bg-[var(--surface)]/80 backdrop-blur-xl rounded-[38px] p-8 border border-white/20 shadow-[0_10px_40px_rgba(0,0,0,0.08)]">
            {/* PARFUM */}
            <div className="mb-7 text-left">
              <label className="block mb-3 text-sm uppercase tracking-[0.25em] text-[var(--texte)]/60">
                Nom du parfum
              </label>

              <input
                type="text"
                value={parfum}
                onChange={(e) => setParfum(e.target.value)}
                className="w-full h-14 px-5 rounded-2xl bg-[var(--fond)] border border-black/5 outline-none focus:border-[var(--accent)] transition-all"
              />
            </div>

            {/* PARFUMEUR */}
            <div className="mb-10 text-left">
              <label className="block mb-3 text-sm uppercase tracking-[0.25em] text-[var(--texte)]/60">
                Nom du parfumeur
              </label>

              <input
                type="text"
                value={parfumeur}
                onChange={(e) => setParfumeur(e.target.value)}
                className="w-full h-14 px-5 rounded-2xl bg-[var(--fond)] border border-black/5 outline-none focus:border-[var(--accent)] transition-all"
              />
            </div>

            {/* BUTTON */}
            <button
              onClick={handleSearch}
              className="w-full h-14 rounded-2xl bg-[var(--texte)] text-[var(--fond)] text-lg cursor-pointer transition-all duration-300 hover:bg-[var(--accent)] hover:text-[var(--texte)]"
            >
              Rechercher
            </button>
          </div>
        </section>
      </section>

      {/* RESULTS */}
      <section className="flex-1 px-5 md:px-10 pb-24">
        {results.length > 0 && (
          <>
            <p className="text-[var(--texte)]/50 mb-10 text-sm tracking-[0.2em] uppercase">
              {results.length} résultats
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-6">
              {results.map((perfume, index) => (
                <div
                  key={perfume.id}
                  onClick={() => openPopup(index)}
                  className="group cursor-pointer"
                >
                  <div className="bg-[var(--surface)] rounded-[28px] p-3 border border-white/20 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
                    <img
                      src={
                        perfume.image_file?.startsWith("http")
                          ? `${perfume.image_file}?width=400&format=webp&quality=80`
                          : `/images/${perfume.image_file}`
                      }
                      alt={perfume.parfum}
                      className="rounded-[22px] w-full aspect-[4/5] object-cover"
                    />

                    <div className="pt-4 px-1 space-y-1">
                      {/* LIGNE 1 */}
                      <p className="text-sm font-semibold text-[var(--texte)] truncate">
                        {perfume.parfum}
                      </p>

                      {/* LIGNE 2 */}
                      <p className="text-xs text-[var(--texte)]/70 truncate">
                        {perfume.parfumeur}
                      </p>

                      {/* LIGNE 3 */}
                      <p className="text-xs text-[var(--texte)]/60 truncate">
                        <span className="font-semibold">
                          {typeLabels[perfume.type] ||
                            perfume.type ||
                            "Inconnu"}
                        </span>

                        <span className="font-normal">
                          {" "}
                          - {perfume.contenance || "?"}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      {/* POPUP */}
      {selectedPerfume && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-6"
          onClick={() => setSelectedIndex(null)}
          style={{
            backgroundImage:
              "linear-gradient(rgba(20,20,20,0.55), rgba(20,20,20,0.55)), url('/background.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* BLUR */}
          <div className="absolute inset-0 backdrop-blur-md" />

          {/* LEFT */}
          <button
            onClick={(e) => {
              e.stopPropagation();

              openPopup(
                ((selectedIndex ?? 0) - 1 + results.length) % results.length,
              );
            }}
            className="absolute left-6 md:left-10 top-1/2 -translate-y-1/2 z-20 w-24 h-24 rounded-full bg-[var(--texte)] text-[var(--fond)] text-6xl shadow-[0_10px_30px_rgba(0,0,0,0.25)] hover:scale-110 hover:bg-[var(--accent)] hover:text-[var(--texte)] transition-all duration-300 cursor-pointer"
          >
            ←
          </button>

          {/* RIGHT */}
          <button
            onClick={(e) => {
              e.stopPropagation();

              openPopup(((selectedIndex ?? 0) + 1) % results.length);
            }}
            className="absolute right-6 md:right-10 top-1/2 -translate-y-1/2 z-20 w-24 h-24 rounded-full bg-[var(--texte)] text-[var(--fond)] text-6xl shadow-[0_10px_30px_rgba(0,0,0,0.25)] hover:scale-110 hover:bg-[var(--accent)] hover:text-[var(--texte)] transition-all duration-300 cursor-pointer"
          >
            →
          </button>

          {/* MODAL */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative z-10 w-[70vw] h-[88vh] overflow-hidden rounded-[42px] shadow-[0_30px_90px_rgba(0,0,0,0.35)] grid md:grid-cols-[1.20fr_0.90fr]"
            style={{
              background:
                "linear-gradient(135deg, var(--fond) 0%, #e3d6c2 100%)",
            }}
          >
            {/* CLOSE */}
            <button
              onClick={() => setSelectedIndex(null)}
              className="absolute top-7 right-7 z-20 w-16 h-16 rounded-full bg-[var(--texte)] border border-black/10 text-[var(--fond)] text-4xl hover:rotate-90 hover:bg-[var(--accent)] hover:text-[var(--texte)] transition-all duration-500 cursor-pointer"
            >
              ✕
            </button>

            {/* IMAGE */}
            <div className="relative flex items-center justify-center h-full min-h-[88vh] p-4">
              {/* COUNTER */}
              <div className="absolute top-8 left-8 bg-[var(--surface)]/90 backdrop-blur-xl px-6 py-3 rounded-full text-sm tracking-[0.2em] text-[var(--texte)] shadow-lg border border-white/20">
                {(selectedIndex ?? 0) + 1} / {results.length}
              </div>

              {/* GLOW */}
              <div className="absolute w-[600px] h-[600px] rounded-full bg-[var(--accent)]/15 blur-3xl" />

              <img
                src={
                  selectedPerfume.image_file?.startsWith("http")
                    ? `${selectedPerfume.image_file}?width=2000&format=webp&quality=100`
                    : `/images/${selectedPerfume.image_file}`
                }
                alt={selectedPerfume.parfum}
                className="relative z-10 w-full h-[82vh] object-contain drop-shadow-[0_25px_40px_rgba(0,0,0,0.22)]"
              />
              {/* EDIT IMAGE */}
              {isAdmin && editMode && (
                <div className="absolute bottom-8 left-8 z-20">
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

                        const scale = Math.min(
                          640 / imageBitmap.width,
                          480 / imageBitmap.height,
                        );

                        const width = imageBitmap.width * scale;

                        const height = imageBitmap.height * scale;

                        const x = (640 - width) / 2;

                        const y = (480 - height) / 2;

                        ctx.drawImage(imageBitmap, x, y, width, height);

                        const blob = await new Promise<Blob | null>(
                          (resolve) => {
                            canvas.toBlob(resolve, "image/jpeg", 0.82);
                          },
                        );

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
                          toast.error("Erreur upload");

                          return;
                        }

                        const { data: publicUrlData } = supabase.storage
                          .from("images")
                          .getPublicUrl(filename);

                        const imageUrl = publicUrlData.publicUrl;

                        const updated = [...results];

                        updated[selectedIndex ?? 0] = {
                          ...updated[selectedIndex ?? 0],
                          image_file: imageUrl,
                        };

                        setResults(updated);

                        toast.success("Image mise à jour ✨");
                      } catch {
                        toast.error("Erreur upload");
                      }
                    }}
                  />

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-6 py-3 rounded-2xl bg-[var(--texte)] text-[var(--fond)] hover:bg-[var(--accent)] hover:text-[var(--texte)] transition-all duration-300 cursor-pointer shadow-xl"
                  >
                    Modifier l’image
                  </button>
                </div>
              )}
            </div>

            {/* INFOS */}
            <div className="p-14 md:p-16 flex flex-col justify-center bg-[rgba(255,255,255,0.22)] backdrop-blur-xl border-l border-white/20">
              {/* TITLE */}
              <div className="mb-12">
                {editMode ? (
                  <input
                    value={editParfumeur}
                    onChange={(e) => setEditParfumeur(e.target.value)}
                    className="uppercase tracking-[0.3em] text-[var(--accent)] text-sm mb-5 bg-transparent outline-none border-b border-[var(--accent)]/20 w-full"
                  />
                ) : (
                  <p className="uppercase tracking-[0.3em] text-[var(--accent)] text-sm mb-5">
                    {selectedPerfume.parfumeur || "Parfumeur inconnu"}
                  </p>
                )}

                {editMode ? (
                  <input
                    value={editParfum}
                    onChange={(e) => setEditParfum(e.target.value)}
                    className="w-full bg-transparent text-7xl leading-[0.95] font-light tracking-tight text-[var(--texte)] outline-none border-b border-[var(--accent)]/20 pb-4"
                  />
                ) : (
                  <h2 className="text-7xl leading-[0.95] font-light tracking-tight text-[var(--texte)]">
                    {selectedPerfume.parfum}
                  </h2>
                )}

                <div className="w-24 h-[4px] bg-[var(--accent)] rounded-full mt-8 shadow-lg" />
              </div>

              {/* CARDS */}
              <div className="space-y-5">
                {/* LIGNE */}
                <div className="grid grid-cols-3 gap-4">
                  {/* BOITE */}
                  <div className="bg-[var(--surface)]/55 rounded-3xl p-5 border border-white/20">
                    <p className="text-sm text-[var(--texte)]/50 mb-2">Boîte</p>

                    {editMode ? (
                      <div className="flex bg-[var(--fond)] rounded-xl p-1 gap-1 w-fit">
                        <button
                          onClick={() => setEditBoite("Oui")}
                          className={`px-3 py-2 rounded-lg text-sm transition-all duration-300 cursor-pointer ${
                            editBoite === "Oui"
                              ? "bg-[var(--texte)] text-[var(--fond)]"
                              : "hover:bg-[var(--accent)]/20"
                          }`}
                        >
                          Oui
                        </button>

                        <button
                          onClick={() => setEditBoite("Non")}
                          className={`px-3 py-2 rounded-lg text-sm transition-all duration-300 cursor-pointer ${
                            editBoite === "Non"
                              ? "bg-[var(--texte)] text-[var(--fond)]"
                              : "hover:bg-[var(--accent)]/20"
                          }`}
                        >
                          Non
                        </button>
                      </div>
                    ) : (
                      <p className="text-xl font-medium">
                        {selectedPerfume.boite || "Inconnu"}
                      </p>
                    )}
                  </div>

                  {/* TYPE */}
                  <div className="bg-[var(--surface)]/55 rounded-3xl p-5 border border-white/20">
                    <p className="text-sm text-[var(--texte)]/50 mb-2">Type</p>

                    {editMode ? (
                      <select
                        value={editType}
                        onChange={(e) => setEditType(e.target.value)}
                        className="text-xl bg-transparent outline-none w-full"
                      >
                        {Object.keys(typeLabels).map((perfumeType) => (
                          <option key={perfumeType} value={perfumeType}>
                            {perfumeType}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-xl font-medium leading-tight">
                        {typeLabels[selectedPerfume.type] ||
                          selectedPerfume.type ||
                          "Inconnu"}
                      </p>
                    )}
                  </div>

                  {/* CONTENANCE */}
                  <div className="bg-[var(--surface)]/55 rounded-3xl p-5 border border-white/20">
                    <p className="text-sm text-[var(--texte)]/50 mb-2">
                      Contenance
                    </p>

                    {editMode ? (
                      <input
                        value={editContenance}
                        onChange={(e) => setEditContenance(e.target.value)}
                        className="w-full bg-transparent outline-none border-b border-[var(--accent)]/20 text-xl"
                      />
                    ) : (
                      <p className="text-xl font-medium">
                        {selectedPerfume.contenance || "Inconnu"}
                      </p>
                    )}
                  </div>
                </div>

                {/* DESCRIPTION */}
                <div className="bg-[var(--surface)]/55 rounded-3xl p-6 border border-white/20">
                  <p className="text-sm text-[var(--texte)]/50 mb-3">
                    Description
                  </p>

                  {editMode ? (
                    <textarea
                      value={selectedPerfume.description || ""}
                      onChange={(e) => {
                        const updated = [...results];

                        updated[selectedIndex ?? 0].description =
                          e.target.value;

                        setResults(updated);
                      }}
                      placeholder="Description..."
                      className="w-full min-h-[120px] bg-transparent outline-none resize-none text-lg"
                    />
                  ) : (
                    <p className="text-lg whitespace-pre-wrap">
                      {selectedPerfume.description || "Aucune description"}
                    </p>
                  )}
                </div>
              </div>
              {/* ACTIONS BOTTOM */}
              <div className="flex gap-4 mt-10 pt-6">
                <button
                  onClick={() => setSelectedIndex(null)}
                  className="px-8 py-4 rounded-2xl bg-[var(--texte)] text-[var(--fond)] hover:bg-[var(--accent)] hover:text-[var(--texte)] transition-all duration-300 cursor-pointer"
                >
                  Retour
                </button>

                {isAdmin && !editMode && (
                  <button
                    onClick={() => setEditMode(true)}
                    className="px-8 py-4 rounded-2xl bg-[var(--texte)] text-[var(--fond)] hover:bg-[var(--accent)] hover:text-[var(--texte)] transition-all duration-300 cursor-pointer"
                  >
                    Modifier
                  </button>
                )}

                {isAdmin && editMode && (
                  <>
                    <button
                      onClick={async () => {
                        const { error } = await supabase
                          .from("perfumes")
                          .update({
                            parfum: editParfum,
                            parfumeur: editParfumeur,
                            boite: editBoite,
                            type: editType,
                            contenance: editContenance,
                            description:
                              results[selectedIndex ?? 0].description,
                            image_file: results[selectedIndex ?? 0].image_file,
                          })
                          .eq("id", selectedPerfume.id);

                        if (!error) {
                          toast.success("Sauvegarde réussie ✨");

                          const updated = [...results];

                          updated[selectedIndex ?? 0] = {
                            ...updated[selectedIndex ?? 0],
                            parfum: editParfum,
                            parfumeur: editParfumeur,
                            boite: editBoite,
                            type: editType,
                            contenance: editContenance,
                          };

                          setResults(updated);

                          setEditMode(false);
                        } else {
                          toast.error("Erreur save");
                        }
                      }}
                      className="px-8 py-4 rounded-2xl bg-[var(--texte)] text-[var(--fond)] hover:bg-[var(--accent)] hover:text-[var(--texte)] transition-all duration-300 cursor-pointer"
                    >
                      Sauvegarder
                    </button>

                    <button
                      onClick={() => {
                        setEditMode(false);

                        setEditParfum(selectedPerfume.parfum);

                        setEditParfumeur(selectedPerfume.parfumeur);

                        setEditBoite(selectedPerfume.boite);

                        setEditType(selectedPerfume.type);

                        setEditContenance(selectedPerfume.contenance);
                      }}
                      className="px-8 py-4 rounded-2xl bg-[var(--texte)] text-[var(--fond)] hover:bg-[var(--accent)] hover:text-[var(--texte)] transition-all duration-300 cursor-pointer"
                    >
                      Annuler
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
