"use client";

import { useRef, useState, useEffect } from "react";

import toast from "react-hot-toast";

import Header from "../../components/Header";

import Footer from "../../components/Footer";

import { supabase } from "../../../lib/supabase";

export default function GestionClient() {
  const [perfumes, setPerfumes] = useState<any[]>([]);

  const [page, setPage] = useState(1);

  const [searchParfum, setSearchParfum] = useState("");

  const [searchParfumeur, setSearchParfumeur] = useState("");

  const [openAdd, setOpenAdd] = useState(false);

  const [newParfum, setNewParfum] = useState("");

  const [newParfumeur, setNewParfumeur] = useState("");

  const [newBoite, setNewBoite] = useState("");

  const [newType, setNewType] = useState("");

  const [newContenance, setNewContenance] = useState("");

  const [newImage, setNewImage] = useState("");

  const [deleteMiniature, setDeleteMiniature] = useState<any>(null);

  const [previewImage, setPreviewImage] = useState("");

  const addImageInputRef = useRef<HTMLInputElement | null>(null);

  const perPage = 50;

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

  const fileInputRefs = useRef<{
    [key: number]: HTMLInputElement | null;
  }>({});

  const filteredPerfumes = [...perfumes]

    .sort((a, b) => b.id - a.id)

    .filter((perfume) => {
      const parfumMatch = perfume.parfum
        ?.toLowerCase()
        .includes(searchParfum.toLowerCase());

      const parfumeurMatch = perfume.parfumeur
        ?.toLowerCase()
        .includes(searchParfumeur.toLowerCase());

      return parfumMatch && parfumeurMatch;
    });

  const totalPages = Math.ceil(filteredPerfumes.length / perPage);

  const start = (page - 1) * perPage;

  const currentPerfumes = filteredPerfumes.slice(start, start + perPage);

  const importInputRef = useRef<HTMLInputElement | null>(null);

  return (
    <main className="min-h-screen bg-transparent text-[var(--texte)]">
      <Header />

      {/* ESPACE HEADER */}
      <div className="h-24" />

      {/* TITRE */}
      <section className="px-8 pt-8 pb-6">
        <h1 className="text-5xl font-light">Gestion</h1>

        <p className="mt-3 text-[var(--texte)]/60">
          {perfumes.length} miniatures
        </p>
      </section>

      {/* TABLEAU */}
      <section className="px-8 pb-20 overflow-x-auto">
        <div className="flex items-center gap-4 mb-6">
          {/* PAGINATION */}
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            className="w-14 h-14 cursor-pointer rounded-2xl bg-[var(--surface)] hover:bg-[var(--accent)] transition-all text-xl"
          >
            ←
          </button>

          <button
            onClick={() => setPage(1)}
            className={`w-14 h-14 cursor-pointer rounded-2xl transition-all ${
              page === 1
                ? "bg-[var(--texte)] text-[var(--fond)]"
                : "bg-[var(--surface)] hover:bg-[var(--accent)]"
            }`}
          >
            1
          </button>

          {page > 4 && <span className="opacity-50">...</span>}

          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(
              (p) =>
                p !== 1 && p !== totalPages && p >= page - 2 && p <= page + 2,
            )
            .map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-14 h-14 cursor-pointer rounded-2xl transition-all ${
                  page === p
                    ? "bg-[var(--texte)] text-[var(--fond)]"
                    : "bg-[var(--surface)] hover:bg-[var(--accent)]"
                }`}
              >
                {p}
              </button>
            ))}

          {page < totalPages - 3 && <span className="opacity-50">...</span>}

          <button
            onClick={() => setPage(totalPages)}
            className={`w-14 h-14 cursor-pointer rounded-2xl transition-all ${
              page === totalPages
                ? "bg-[var(--texte)] text-[var(--fond)]"
                : "bg-[var(--surface)] hover:bg-[var(--accent)]"
            }`}
          >
            {totalPages}
          </button>

          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            className="w-14 h-14 cursor-pointer rounded-2xl bg-[var(--surface)] hover:bg-[var(--accent)] transition-all text-xl"
          >
            →
          </button>

          {/* DROITE */}
          <div className="ml-auto flex gap-4">
            {/* EXPORT */}
            <button
              onClick={() => {
                window.open("/api/export-xlsx", "_blank");

                toast.success("Téléchargement réussi ✨");
              }}
              className="px-6 h-14 rounded-2xl bg-[var(--texte)] text-[var(--fond)] hover:bg-[var(--accent)] transition-all cursor-pointer flex items-center gap-2"
            >
              Export XLSX
            </button>

            {/* IMPORT */}
            <button
              onClick={() => importInputRef.current?.click()}
              className="px-6 h-14 rounded-2xl bg-[var(--texte)] text-[var(--fond)] hover:bg-[var(--accent)] transition-all cursor-pointer flex items-center gap-2"
            >
              Import XLSX
            </button>

            <input
              type="file"
              accept=".xlsx"
              className="hidden"
              ref={importInputRef}
              onChange={async (e) => {
                const file = e.target.files?.[0];

                if (!file) return;

                const formData = new FormData();

                formData.append("file", file);

                try {
                  const response = await fetch("/api/import-xlsx", {
                    method: "POST",

                    body: formData,
                  });

                  const data = await response.json();

                  if (data.success) {
                    toast.success("Mise à jour réussie ✨");

                    window.location.reload();
                  } else {
                    toast.error("Fichier XLSX invalide ❌");
                  }
                } catch {
                  toast.error("Fichier XLSX invalide ❌");
                }
              }}
            />

            {/* AJOUT */}
            <button
              onClick={() => setOpenAdd(true)}
              className="px-8 h-14 rounded-2xl bg-[var(--texte)] text-[var(--fond)] text-lg cursor-pointer transition-all hover:bg-[var(--accent)] hover:text-[var(--texte)] hover:scale-[1.02] active:scale-[0.98]"
            >
              Ajouter une Miniature
            </button>
          </div>
        </div>

        <div className="min-w-[1600px] rounded-3xl overflow-hidden border border-black/5 shadow-sm">
          {/* HEADER */}
          <div className="grid grid-cols-[70px_220px_400px_400px_160px_140px_160px_260px] bg-[var(--surface)] border-b border-black/5">
            <div className="p-4 font-semibold border-r border-black/5">ID</div>
            <div className="p-4 font-semibold border-r border-black/5">
              Image
            </div>

            {/* PARFUM */}
            <div className="p-4 font-semibold border-r border-black/5 flex items-center gap-4">
              <p className="shrink-0">Parfum</p>

              <input
                value={searchParfum}
                onChange={(e) => setSearchParfum(e.target.value)}
                placeholder="Recherche..."
                className="flex-1 px-3 py-2 rounded-xl bg-[var(--fond)] border border-black/5 outline-none text-sm"
              />
            </div>

            {/* PARFUMEUR */}
            <div className="p-4 font-semibold border-r border-black/5 flex items-center gap-4">
              <p className="shrink-0">Parfumeur</p>

              <input
                value={searchParfumeur}
                onChange={(e) => setSearchParfumeur(e.target.value)}
                placeholder="Recherche..."
                className="flex-1 px-3 py-2 rounded-xl bg-[var(--fond)] border border-black/5 outline-none text-sm"
              />
            </div>

            <div className="p-4 font-semibold border-r border-black/5">
              Boîte
            </div>

            <div className="p-4 font-semibold border-r border-black/5">
              Type
            </div>

            <div className="p-4 font-semibold border-r border-black/5">
              Contenance
            </div>

            <div className="p-4 font-semibold">Actions</div>
          </div>

          {/* LIGNES */}
          {currentPerfumes.map((perfume, index) => (
            <div
              key={perfume.id}
              className="grid grid-cols-[70px_220px_400px_400px_160px_140px_160px_260px] bg-[var(--fond)] border-b border-black/5 transition-all"
            >
              {/* ID */}
              <div className="p-4 flex items-center justify-center border-r border-black/5">
                {perfume.id}
              </div>
              {/* IMAGE */}
              <div className="p-3 flex items-center gap-3 border-r border-black/5">
                <img
                  src={
                    perfume.image_file?.startsWith("http")
                      ? perfume.image_file
                      : `/images/${perfume.image_file}`
                  }
                  onClick={() => setPreviewImage(perfume.image_file)}
                  className="w-20 h-20 object-cover rounded-xl border border-black/5 cursor-pointer hover:scale-105 transition-all"
                />

                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={(el) => {
                    fileInputRefs.current[perfume.id] = el;
                  }}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];

                    if (!file) return;

                    try {
                      if (perfume.image_file?.includes("/storage/")) {
                        const oldFile = perfume.image_file.split("/").pop();

                        if (oldFile) {
                          await supabase.storage
                            .from("images")
                            .remove([oldFile]);
                        }
                      }
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

                      const imageUrl = publicUrlData.publicUrl;

                      const updated = [...perfumes];

                      const realIndex = updated.findIndex(
                        (p) => p.id === perfume.id,
                      );

                      updated[realIndex] = {
                        ...perfume,

                        image_file: imageUrl,
                      };

                      setPerfumes(updated);

                      toast.success("Image uploadée ✨");
                    } catch {
                      toast.error("Erreur upload");
                    }
                  }}
                />

                <button
                  onClick={() => fileInputRefs.current[perfume.id]?.click()}
                  className="px-3 py-2 cursor-pointer rounded-xl bg-[var(--surface)] hover:bg-[var(--accent)] transition-all text-sm"
                >
                  Modifier
                </button>
              </div>

              {/* PARFUM */}
              <div className="p-4 flex items-center border-r border-black/5">
                <input
                  value={perfume.parfum}
                  onChange={(e) => {
                    const updated = [...perfumes];

                    const realIndex = updated.findIndex(
                      (p) => p.id === perfume.id,
                    );

                    updated[realIndex] = {
                      ...perfume,

                      parfum: e.target.value,
                    };

                    setPerfumes(updated);
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--surface)] border border-transparent focus:border-[var(--accent)] outline-none transition-all"
                />
              </div>

              {/* PARFUMEUR */}
              <div className="p-4 flex items-center border-r border-black/5">
                <input
                  value={perfume.parfumeur}
                  onChange={(e) => {
                    const updated = [...perfumes];

                    const realIndex = updated.findIndex(
                      (p) => p.id === perfume.id,
                    );

                    updated[realIndex] = {
                      ...perfume,

                      parfumeur: e.target.value,
                    };

                    setPerfumes(updated);
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--surface)] border border-transparent focus:border-[var(--accent)] outline-none transition-all"
                />
              </div>

              {/* BOITE */}
              <div className="p-4 flex items-center border-r border-black/5">
                <div className="flex bg-[var(--surface)] rounded-xl p-1 gap-1">
                  <button
                    onClick={() => {
                      const updated = [...perfumes];

                      const realIndex = updated.findIndex(
                        (p) => p.id === perfume.id,
                      );

                      updated[realIndex] = {
                        ...perfume,

                        boite: "Oui",
                      };

                      setPerfumes(updated);
                    }}
                    className={`px-4 py-2 rounded-lg text-sm transition-all cursor-pointer ${
                      perfume.boite === "Oui"
                        ? "bg-[var(--texte)] text-[var(--fond)]"
                        : "hover:bg-black/5"
                    }`}
                  >
                    Oui
                  </button>

                  <button
                    onClick={() => {
                      const updated = [...perfumes];

                      const realIndex = updated.findIndex(
                        (p) => p.id === perfume.id,
                      );

                      updated[realIndex] = {
                        ...perfume,

                        boite: "Non",
                      };

                      setPerfumes(updated);
                    }}
                    className={`px-4 py-2 rounded-lg text-sm transition-all cursor-pointer ${
                      perfume.boite === "Non"
                        ? "bg-[var(--texte)] text-[var(--fond)]"
                        : "hover:bg-black/5"
                    }`}
                  >
                    Non
                  </button>
                </div>
              </div>

              {/* TYPE */}
              <div className="p-4 flex items-center border-r border-black/5">
                <input
                  value={perfume.type}
                  onChange={(e) => {
                    const updated = [...perfumes];

                    const realIndex = updated.findIndex(
                      (p) => p.id === perfume.id,
                    );

                    updated[realIndex] = {
                      ...perfume,

                      type: e.target.value,
                    };

                    setPerfumes(updated);
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--surface)] border border-transparent focus:border-[var(--accent)] outline-none transition-all"
                />
              </div>

              {/* CONTENANCE */}
              <div className="p-4 flex items-center border-r border-black/5">
                <input
                  value={perfume.contenance}
                  onChange={(e) => {
                    const updated = [...perfumes];

                    const realIndex = updated.findIndex(
                      (p) => p.id === perfume.id,
                    );

                    updated[realIndex] = {
                      ...perfume,

                      contenance: e.target.value,
                    };

                    setPerfumes(updated);
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--surface)] border border-transparent focus:border-[var(--accent)] outline-none transition-all"
                />
              </div>

              <div className="p-4 flex items-center gap-3">
                {/* SAVE */}
                <button
                  onClick={async () => {
                    try {
                      const { error } = await supabase
                        .from("perfumes")
                        .update({
                          parfum: perfume.parfum,

                          parfumeur: perfume.parfumeur,

                          boite: perfume.boite,

                          type: perfume.type,

                          contenance: perfume.contenance,

                          image_file: perfume.image_file,
                        })
                        .eq("id", perfume.id);

                      if (!error) {
                        toast.success("Sauvegarde réussie ✨");
                      } else {
                        toast.error("Erreur sauvegarde");
                      }
                    } catch {
                      toast.error("Erreur sauvegarde");
                    }
                  }}
                  className="px-5 cursor-pointer py-2 rounded-xl bg-[var(--texte)] text-[var(--fond)] hover:bg-[var(--accent)] transition-all"
                >
                  Sauvegarder
                </button>

                {/* DELETE */}
                <button
                  onClick={() => {
                    setDeleteMiniature(perfume);
                  }}
                  className="px-4 py-2 cursor-pointer rounded-xl bg-red-500 text-white hover:opacity-80 transition-all"
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* MODAL AJOUT */}
      {openAdd && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="w-full max-w-2xl rounded-[32px] bg-[var(--surface)] p-8 shadow-2xl">
            <h2 className="text-4xl font-light mb-8">Ajouter une miniature</h2>

            {/* IMAGE */}
            <div className="mb-6">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={addImageInputRef}
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

                    setNewImage(publicUrlData.publicUrl);

                    toast.success("Image uploadée ✨");
                  } catch {
                    toast.error("Erreur upload");
                  }
                }}
              />

              <button
                onClick={() => addImageInputRef.current?.click()}
                className="px-5 py-3 cursor-pointer rounded-2xl bg-[var(--texte)] text-[var(--fond)] hover:bg-[var(--accent)] transition-all"
              >
                {newImage ? "Changer image" : "Ajouter image"}
              </button>
            </div>

            {/* CHAMPS */}
            <div className="grid grid-cols-2 gap-4">
              <input
                value={newParfum}
                onChange={(e) => setNewParfum(e.target.value)}
                placeholder="Parfum"
                className="p-4 rounded-2xl bg-[var(--fond)] border border-black/5 outline-none"
              />

              <input
                value={newParfumeur}
                onChange={(e) => setNewParfumeur(e.target.value)}
                placeholder="Parfumeur"
                className="p-4 rounded-2xl bg-[var(--fond)] border border-black/5 outline-none"
              />

              <input
                value={newBoite}
                onChange={(e) => setNewBoite(e.target.value)}
                placeholder="Boîte"
                className="p-4 rounded-2xl bg-[var(--fond)] border border-black/5 outline-none"
              />

              <input
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                placeholder="Type"
                className="p-4 rounded-2xl bg-[var(--fond)] border border-black/5 outline-none"
              />
            </div>

            <input
              value={newContenance}
              onChange={(e) => setNewContenance(e.target.value)}
              placeholder="Contenance"
              className="mt-4 w-full p-4 rounded-2xl bg-[var(--fond)] border border-black/5 outline-none"
            />

            {/* ACTIONS */}
            <div className="flex justify-end gap-4 mt-8">
              <button
                onClick={() => {
                  setOpenAdd(false);

                  setNewParfum("");

                  setNewParfumeur("");

                  setNewBoite("");

                  setNewType("");

                  setNewContenance("");

                  setNewImage("");
                }}
                className="px-6 py-3 cursor-pointer rounded-2xl bg-[var(--surface)] hover:bg-black/5 transition-all"
              >
                Annuler
              </button>

              <button
                onClick={async () => {
                  try {
                    const newId = Math.max(...perfumes.map((p) => p.id)) + 1;

                    const { data, error } = await supabase
                      .from("perfumes")
                      .insert([
                        {
                          id: newId,

                          parfum: newParfum,

                          parfumeur: newParfumeur,

                          boite: newBoite,

                          type: newType,

                          contenance: newContenance,

                          image_file: newImage,
                        },
                      ])
                      .select()
                      .single();

                    if (!error && data) {
                      setPerfumes([data, ...perfumes]);

                      toast.success("Miniature ajoutée ✨");

                      setOpenAdd(false);

                      setNewParfum("");

                      setNewParfumeur("");

                      setNewBoite("");

                      setNewType("");

                      setNewContenance("");

                      setNewImage("");
                    } else {
                      toast.error("Erreur ajout");
                    }
                  } catch {
                    toast.error("Erreur ajout");
                  }
                }}
                className="px-6 py-3 rounded-2xl cursor-pointer bg-[var(--texte)] text-[var(--fond)] hover:bg-[var(--accent)] transition-all"
              >
                Sauvegarder
              </button>
            </div>
          </div>
        </div>
      )}
      {/* MODAL DELETE */}
      {deleteMiniature && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="w-full max-w-md rounded-[32px] bg-[var(--surface)] p-8 shadow-2xl">
            <h2 className="text-3xl font-light text-center mb-10">
              Confirmer la suppression
            </h2>

            <div className="flex justify-center gap-4">
              {/* ANNULER */}
              <button
                onClick={() => setDeleteMiniature(null)}
                className="px-6 py-3 cursor-pointer rounded-2xl bg-[var(--texte)] text-[var(--fond)] hover:bg-[var(--accent)] transition-all"
              >
                Annuler
              </button>

              {/* DELETE */}
              <button
                onClick={async () => {
                  try {
                    if (deleteMiniature.image_file?.includes("/storage/")) {
                      const oldFile = deleteMiniature.image_file
                        .split("/")
                        .pop();

                      if (oldFile) {
                        await supabase.storage.from("images").remove([oldFile]);
                      }
                    }
                    const { error } = await supabase
                      .from("perfumes")
                      .delete()
                      .eq("id", deleteMiniature.id);

                    if (!error) {
                      setPerfumes(
                        perfumes.filter((p) => p.id !== deleteMiniature.id),
                      );

                      setDeleteMiniature(null);

                      toast.success("Miniature supprimée 🗑️");
                    } else {
                      toast.error("Erreur suppression");
                    }
                  } catch {
                    toast.error("Erreur suppression");
                  }
                }}
                className="px-6 py-3 cursor-pointer rounded-2xl bg-red-500 text-white hover:opacity-80 transition-all"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
      {/* PREVIEW IMAGE */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage("")}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-8"
        >
          <img
            src={
              previewImage?.startsWith("http")
                ? previewImage
                : `/images/${previewImage}`
            }
            className="max-w-[90vw] max-h-[90vh] rounded-3xl shadow-2xl object-contain"
          />
        </div>
      )}
      <Footer />
    </main>
  );
}
