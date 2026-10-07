"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Pencil, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

import { deletePerfume } from "@/app/actions/perfumes";
import { useIsAdmin } from "@/components/AdminProvider";
import BackButton from "@/components/BackButton";
import Dialog from "@/components/Dialog";
import PerfumeForm from "@/components/form/PerfumeForm";
import Photo from "@/components/Photo";
import { typeLabel, type Perfume } from "@/lib/perfume";

type Props = { perfume: Perfume; parfumeurs: string[] };

export default function PerfumeDetail({ perfume, parfumeurs }: Props) {
  const isAdmin = useIsAdmin();
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, startDelete] = useTransition();

  const parfumeurHref = `/parfumeurs/${encodeURIComponent(perfume.parfumeur)}`;

  return (
    <div className="mx-auto max-w-6xl px-4 pt-4 pb-16 md:px-8 md:pt-8">
      <BackButton fallback={parfumeurHref} />

      {editing ? (
        <section className="panel mx-auto mt-4 max-w-3xl p-5 md:p-8">
          <h1 className="mb-6 font-display text-3xl font-semibold">Modifier la miniature</h1>
          <PerfumeForm
            perfume={perfume}
            parfumeurs={parfumeurs}
            onDone={() => setEditing(false)}
            onCancel={() => setEditing(false)}
          />
        </section>
      ) : (
        <article className="mt-4 grid items-start gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-14">
          <div className="panel overflow-hidden p-2 md:p-3">
            <Photo src={perfume.image_file} alt={perfume.parfum} priority className="rounded-2xl" />
          </div>

          <div className="lg:pt-4">
            <Link
              href={parfumeurHref}
              className="text-sm font-medium tracking-[0.25em] text-accent-fonce uppercase transition-colors hover:text-texte"
            >
              {perfume.parfumeur}
            </Link>
            <h1 className="mt-3 font-display text-5xl leading-none font-semibold break-words italic md:text-6xl xl:text-7xl">
              {perfume.parfum}
            </h1>

            <dl className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
              <Detail label="Boîte" value={perfume.boite || "Inconnue"} />
              <Detail
                label="Type"
                value={typeLabel(perfume.type)}
                hint={
                  perfume.type && typeLabel(perfume.type) !== perfume.type
                    ? perfume.type
                    : undefined
                }
                className="max-sm:order-first max-sm:col-span-2"
              />
              <Detail label="Contenance" value={perfume.contenance || "Inconnue"} />
            </dl>

            <section className="panel mt-3 p-5">
              <h2 className="text-xs font-medium tracking-[0.15em] text-texte-doux uppercase">
                Description
              </h2>
              <p className="mt-2 leading-relaxed whitespace-pre-wrap">
                {perfume.description || "Aucune description."}
              </p>
            </section>

            {isAdmin && (
              <div className="mt-8 flex flex-wrap gap-3">
                <button type="button" onClick={() => setEditing(true)} className="btn btn-primary">
                  <Pencil aria-hidden size={16} />
                  Modifier
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="btn btn-secondary"
                >
                  <Trash2 aria-hidden size={16} />
                  Supprimer
                </button>
              </div>
            )}
          </div>
        </article>
      )}

      <Dialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Supprimer cette miniature ?"
      >
        <p className="text-texte-doux">
          « {perfume.parfum} » de {perfume.parfumeur} sera définitivement retirée de la collection.
        </p>
        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => setConfirmDelete(false)}
            className="btn btn-secondary"
          >
            Annuler
          </button>
          <button
            type="button"
            disabled={deleting}
            onClick={() =>
              startDelete(async () => {
                const result = await deletePerfume(perfume.id, parfumeurHref);
                // En cas de succès, l'action redirige vers la page du parfumeur.
                if (!result.ok) toast.error(result.error);
              })
            }
            className="btn btn-danger"
          >
            {deleting ? "Suppression…" : "Supprimer"}
          </button>
        </div>
      </Dialog>
    </div>
  );
}

function Detail({
  label,
  value,
  hint,
  className = "",
}: {
  label: string;
  value: string;
  hint?: string;
  className?: string;
}) {
  return (
    <div className={`panel p-4 ${className}`}>
      <dt className="text-xs font-medium tracking-[0.15em] text-texte-doux uppercase">{label}</dt>
      <dd className="mt-1.5 text-lg leading-tight font-medium">
        {value}
        {hint && <span className="ml-1.5 text-sm font-normal text-texte-doux">({hint})</span>}
      </dd>
    </div>
  );
}
