"use client";

import { useState, useTransition } from "react";
import { ImagePlus, Save, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

import { updatePerfume } from "@/app/actions/perfumes";
import BoiteToggle from "@/components/form/BoiteToggle";
import TypeSelect from "@/components/form/TypeSelect";
import { usePhotoPicker } from "@/components/form/usePhotoPicker";
import type { Perfume } from "@/lib/perfume";

const FIELDS = ["parfum", "parfumeur", "boite", "type", "contenance", "description"] as const;
type Draft = Record<(typeof FIELDS)[number], string>;

const toDraft = (perfume: Perfume): Draft =>
  Object.fromEntries(FIELDS.map((field) => [field, perfume[field] ?? ""])) as Draft;

/**
 * Colonnes partagées par l'en-tête et les lignes du tableau (grand écran).
 * Chaque ligne est sa propre grille : les colonnes « Boîte » et « Actions »
 * ont donc une largeur fixe pour rester alignées avec l'en-tête.
 */
export const ROW_GRID =
  "lg:grid lg:items-center lg:gap-3 lg:grid-cols-[88px_minmax(0,1.2fr)_minmax(0,1.2fr)_minmax(0,1fr)_7.5rem_minmax(0,0.7fr)_minmax(0,1.6fr)_6.5rem] xl:grid-cols-[88px_minmax(0,1.2fr)_minmax(0,1.2fr)_minmax(0,1fr)_7.5rem_minmax(0,0.7fr)_minmax(0,1.6fr)_11rem]";

type Props = {
  perfume: Perfume;
  onDelete: (perfume: Perfume) => void;
  onPreview: (src: string) => void;
};

export default function GestionRow({ perfume, onDelete, onPreview }: Props) {
  const [draft, setDraft] = useState(() => toDraft(perfume));
  const [saved, setSaved] = useState(() => toDraft(perfume));
  const [pending, startTransition] = useTransition();
  const photo = usePhotoPicker();

  const dirty = photo.file !== null || FIELDS.some((field) => draft[field] !== saved[field]);
  const set = (field: keyof Draft) => (value: string) =>
    setDraft((current) => ({ ...current, [field]: value }));
  const id = (field: string) => `gestion-${perfume.id}-${field}`;

  function save() {
    const formData = new FormData();
    for (const field of FIELDS) formData.set(field, draft[field]);
    if (photo.file) formData.set("photo", photo.file);

    startTransition(async () => {
      const result = await updatePerfume(perfume.id, formData);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setSaved(toDraft(result.data));
      photo.reset();
      toast.success(`« ${result.data.parfum} » enregistrée`);
    });
  }

  return (
    <li
      className={`${ROW_GRID} grid grid-cols-[88px_minmax(0,1fr)] gap-x-4 gap-y-3 border-b border-texte/5 p-4 transition-colors last:border-0 lg:px-4 lg:py-3 ${
        dirty ? "bg-accent/10" : ""
      }`}
    >
      <div className="row-span-2 lg:row-span-1">
        <button
          type="button"
          onClick={() => onPreview(photo.previewUrl ?? perfume.image_file)}
          className="block w-full overflow-hidden rounded-xl border border-texte/10 bg-white"
          aria-label={`Agrandir la photo de ${perfume.parfum}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photo.previewUrl ?? perfume.image_file}
            alt=""
            loading="lazy"
            className="aspect-4/3 w-full object-cover"
          />
        </button>
        <input {...photo.inputProps} />
        <button
          type="button"
          onClick={photo.open}
          disabled={photo.preparing}
          className="mt-1.5 inline-flex w-full items-center justify-center gap-1 rounded-lg py-1 text-xs text-texte-doux hover:bg-texte/5 hover:text-texte"
        >
          <ImagePlus aria-hidden size={14} />
          {photo.preparing ? "…" : "Photo"}
        </button>
      </div>

      <Field label="Parfum" htmlFor={id("parfum")} className="col-start-2 lg:col-auto">
        <input
          id={id("parfum")}
          value={draft.parfum}
          onChange={(event) => set("parfum")(event.target.value)}
          className="field"
        />
      </Field>

      <Field label="Parfumeur" htmlFor={id("parfumeur")} className="col-start-2 lg:col-auto">
        <input
          id={id("parfumeur")}
          value={draft.parfumeur}
          onChange={(event) => set("parfumeur")(event.target.value)}
          list="liste-parfumeurs"
          autoComplete="off"
          className="field"
        />
      </Field>

      <div className="col-span-2 grid grid-cols-2 gap-3 sm:grid-cols-[1fr_auto_1fr] lg:contents">
        <Field label="Type" htmlFor={id("type")} className="max-sm:col-span-2">
          <TypeSelect
            id={id("type")}
            compact
            value={draft.type}
            onChange={(event) => set("type")(event.target.value)}
          />
        </Field>
        <Field label="Boîte">
          <BoiteToggle name={id("boite")} value={draft.boite} onChange={set("boite")} />
        </Field>
        <Field label="Contenance" htmlFor={id("contenance")}>
          <input
            id={id("contenance")}
            value={draft.contenance}
            onChange={(event) => set("contenance")(event.target.value)}
            className="field"
          />
        </Field>
      </div>

      <Field label="Description" htmlFor={id("description")} className="col-span-2 lg:col-auto">
        <textarea
          id={id("description")}
          value={draft.description}
          onChange={(event) => set("description")(event.target.value)}
          rows={2}
          className="field resize-y py-2.5 lg:min-h-11"
        />
      </Field>

      <div className="col-span-2 flex gap-2 max-lg:justify-end lg:col-auto">
        <button
          type="button"
          onClick={save}
          disabled={!dirty || pending}
          className="btn btn-primary px-4"
          title="Enregistrer les modifications"
        >
          <Save aria-hidden size={16} />
          <span className="lg:sr-only xl:not-sr-only">{pending ? "…" : "Enregistrer"}</span>
        </button>
        <button
          type="button"
          onClick={() => onDelete(perfume)}
          disabled={pending}
          className="btn btn-secondary px-3 text-red-800"
          aria-label={`Supprimer ${perfume.parfum}`}
          title="Supprimer"
        >
          <Trash2 aria-hidden size={16} />
        </button>
      </div>
    </li>
  );
}

function Field({
  label,
  htmlFor,
  className = "",
  children,
}: {
  label: string;
  htmlFor?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const Label = htmlFor ? "label" : "span";
  return (
    <div className={`min-w-0 ${className}`}>
      <Label htmlFor={htmlFor} className="label lg:sr-only">
        {label}
      </Label>
      {children}
    </div>
  );
}
