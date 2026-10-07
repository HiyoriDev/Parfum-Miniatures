"use client";

import { useId, useState, useTransition } from "react";
import { ImagePlus } from "lucide-react";
import toast from "react-hot-toast";

import { createPerfume, updatePerfume } from "@/app/actions/perfumes";
import type { Perfume } from "@/lib/perfume";

import BoiteToggle from "./BoiteToggle";
import TypeSelect from "./TypeSelect";
import { usePhotoPicker } from "./usePhotoPicker";

type Props = {
  /** Fiche à modifier ; absente pour un ajout. */
  perfume?: Perfume;
  /** Noms de parfumeurs existants, proposés à la saisie pour éviter les doublons d'orthographe. */
  parfumeurs?: string[];
  onDone: (perfume: Perfume) => void;
  onCancel: () => void;
};

export default function PerfumeForm({ perfume, parfumeurs = [], onDone, onCancel }: Props) {
  const [boite, setBoite] = useState(perfume?.boite || "Oui");
  const [type, setType] = useState(perfume?.type ?? "");
  const photo = usePhotoPicker();
  const datalistId = useId();

  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // onSubmit plutôt que <form action> : React vide le formulaire après une
  // action, ce qui effacerait la saisie en cas d'erreur de validation.
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    if (photo.file) formData.set("photo", photo.file);

    startTransition(async () => {
      const result = perfume
        ? await updatePerfume(perfume.id, formData)
        : await createPerfume(formData);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setError(null);
      toast.success(perfume ? "Modifications enregistrées" : "Miniature ajoutée");
      photo.reset();
      onDone(result.data);
    });
  }

  const shownPhoto = photo.previewUrl ?? perfume?.image_file;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="relative overflow-hidden rounded-2xl border border-texte/10 bg-white">
        {shownPhoto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={shownPhoto} alt="" className="aspect-4/3 w-full object-contain" />
        ) : (
          <div className="grid aspect-4/3 place-items-center text-sm text-texte-doux">
            Aucune photo
          </div>
        )}
        <input {...photo.inputProps} />
        <button
          type="button"
          onClick={photo.open}
          disabled={photo.preparing}
          className="btn btn-secondary absolute right-3 bottom-3 shadow-md"
        >
          <ImagePlus aria-hidden size={18} />
          {photo.preparing ? "Préparation…" : shownPhoto ? "Changer la photo" : "Ajouter une photo"}
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="form-parfum" className="label">
            Parfum
          </label>
          <input
            id="form-parfum"
            name="parfum"
            defaultValue={perfume?.parfum}
            required
            className="field"
          />
        </div>
        <div>
          <label htmlFor="form-parfumeur" className="label">
            Parfumeur
          </label>
          <input
            id="form-parfumeur"
            name="parfumeur"
            defaultValue={perfume?.parfumeur}
            required
            list={parfumeurs.length > 0 ? datalistId : undefined}
            autoComplete="off"
            className="field"
          />
          {parfumeurs.length > 0 && (
            <datalist id={datalistId}>
              {parfumeurs.map((name) => (
                <option key={name} value={name} />
              ))}
            </datalist>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-[auto_1fr_1fr]">
        <div>
          <span className="label">Boîte</span>
          <BoiteToggle value={boite} onChange={setBoite} />
        </div>
        <div>
          <label htmlFor="form-type" className="label">
            Type
          </label>
          <TypeSelect
            id="form-type"
            value={type}
            onChange={(event) => setType(event.target.value)}
          />
        </div>
        <div>
          <label htmlFor="form-contenance" className="label">
            Contenance
          </label>
          <input
            id="form-contenance"
            name="contenance"
            defaultValue={perfume?.contenance}
            placeholder="ex. 5ml"
            className="field"
          />
        </div>
      </div>

      <div>
        <label htmlFor="form-description" className="label">
          Description
        </label>
        <textarea
          id="form-description"
          name="description"
          defaultValue={perfume?.description ?? ""}
          rows={4}
          className="field resize-y py-3"
        />
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button type="button" onClick={onCancel} disabled={pending} className="btn btn-secondary">
          Annuler
        </button>
        <button type="submit" disabled={pending || photo.preparing} className="btn btn-primary">
          {pending ? "Enregistrement…" : "Enregistrer"}
        </button>
      </div>
    </form>
  );
}
