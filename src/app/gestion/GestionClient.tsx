"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { Download, LoaderCircle, Plus, Upload } from "lucide-react";
import toast from "react-hot-toast";

import { importCollection, type ImportSummary } from "@/app/actions/import";
import { deletePerfume } from "@/app/actions/perfumes";
import Dialog from "@/components/Dialog";
import PerfumeForm from "@/components/form/PerfumeForm";
import Pagination, { pageHref } from "@/components/Pagination";
import { formatCount, plural, type Perfume } from "@/lib/perfume";

import GestionRow, { ROW_GRID } from "./GestionRow";

type Filters = { parfum: string; parfumeur: string; description: string };

type Props = {
  perfumes: Perfume[];
  total: number;
  page: number;
  totalPages: number;
  filters: Filters;
  parfumeurs: string[];
};

const FILTERS: { key: keyof Filters; label: string }[] = [
  { key: "parfum", label: "Parfum" },
  { key: "parfumeur", label: "Parfumeur" },
  { key: "description", label: "Description" },
];

export default function GestionClient({
  perfumes,
  total,
  page,
  totalPages,
  filters,
  parfumeurs,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [searching, startSearch] = useTransition();
  const [search, setSearch] = useState(filters);

  const [adding, setAdding] = useState(false);
  const [toDelete, setToDelete] = useState<Perfume | null>(null);
  const [deleting, startDelete] = useTransition();
  const [preview, setPreview] = useState<string | null>(null);

  const importInput = useRef<HTMLInputElement>(null);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importSummary, setImportSummary] = useState<ImportSummary | null>(null);
  const [importing, startImport] = useTransition();

  // Recherche à la frappe, envoyée au serveur 300 ms après la dernière touche.
  useEffect(() => {
    if (FILTERS.every(({ key }) => search[key].trim() === filters[key])) return;
    const timer = setTimeout(() => {
      startSearch(() => router.replace(pageHref(pathname, search, 1), { scroll: false }));
    }, 300);
    return () => clearTimeout(timer);
  }, [search, filters, pathname, router]);

  function runImport(file: File, mode: "preview" | "apply") {
    const formData = new FormData();
    formData.set("file", file);
    formData.set("mode", mode);

    startImport(async () => {
      const result = await importCollection(formData);
      if (!result.ok) {
        toast.error(result.error, { duration: 8000 });
        setImportFile(null);
        return;
      }
      if (mode === "preview") {
        setImportFile(file);
        setImportSummary(result.summary);
        return;
      }
      toast.success("Import terminé");
      setImportFile(null);
    });
  }

  const pagination = (
    <Pagination page={page} totalPages={totalPages} pathname={pathname} params={filters} />
  );

  return (
    <div className="mx-auto max-w-screen-2xl px-4 pt-8 pb-16 md:px-8">
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-display text-5xl font-semibold italic">Gestion</h1>
          <p className="mt-1 text-texte-doux">
            {plural(total, "miniature")}
            {FILTERS.some(({ key }) => filters[key]) && " correspondant à la recherche"}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="btn btn-primary col-span-2"
          >
            <Plus aria-hidden size={18} />
            Ajouter une miniature
          </button>
          <a href="/api/export-xlsx" download className="btn btn-secondary">
            <Download aria-hidden size={18} />
            Exporter
          </a>
          <button
            type="button"
            onClick={() => importInput.current?.click()}
            disabled={importing}
            className="btn btn-secondary"
          >
            {importing ? (
              <LoaderCircle aria-hidden size={18} className="animate-spin" />
            ) : (
              <Upload aria-hidden size={18} />
            )}
            Importer
          </button>
          <input
            ref={importInput}
            type="file"
            accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            hidden
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (file) runImport(file, "preview");
            }}
          />
        </div>
      </div>

      <div role="search" className="panel mt-6 grid gap-2 p-3 sm:grid-cols-3 sm:gap-3 sm:p-4">
        {FILTERS.map(({ key, label }) => (
          <div key={key}>
            <label htmlFor={`filtre-${key}`} className="label max-sm:sr-only">
              {label}
            </label>
            <input
              id={`filtre-${key}`}
              type="search"
              value={search[key]}
              onChange={(event) =>
                setSearch((current) => ({ ...current, [key]: event.target.value }))
              }
              placeholder={`${label}…`}
              className="field"
            />
          </div>
        ))}
      </div>

      {pagination}

      <div
        className={`panel mt-6 overflow-hidden transition-opacity ${searching ? "opacity-60" : ""}`}
      >
        <div
          aria-hidden
          className={`${ROW_GRID} hidden border-b border-texte/10 bg-surface/60 px-4 py-3 text-xs font-semibold tracking-wider text-texte-doux uppercase`}
        >
          <span>Photo</span>
          <span>Parfum</span>
          <span>Parfumeur</span>
          <span>Type</span>
          <span>Boîte</span>
          <span>Contenance</span>
          <span>Description</span>
          <span>Actions</span>
        </div>

        {perfumes.length > 0 ? (
          <ul>
            {perfumes.map((perfume) => (
              // La clé suit le contenu : une ligne se réinitialise si la fiche change côté serveur.
              <GestionRow
                key={JSON.stringify(perfume)}
                perfume={perfume}
                onDelete={setToDelete}
                onPreview={setPreview}
              />
            ))}
          </ul>
        ) : (
          <p className="p-10 text-center text-texte-doux">
            Aucune miniature ne correspond à la recherche.
          </p>
        )}
      </div>

      {pagination}

      <datalist id="liste-parfumeurs">
        {parfumeurs.map((name) => (
          <option key={name} value={name} />
        ))}
      </datalist>

      <Dialog
        open={adding}
        onClose={() => setAdding(false)}
        title="Ajouter une miniature"
        className="max-w-2xl"
      >
        <PerfumeForm
          parfumeurs={parfumeurs}
          onDone={() => setAdding(false)}
          onCancel={() => setAdding(false)}
        />
      </Dialog>

      <Dialog
        open={toDelete !== null}
        onClose={() => setToDelete(null)}
        title="Supprimer cette miniature ?"
      >
        {toDelete && (
          <>
            <p className="text-texte-doux">
              « {toDelete.parfum} » de {toDelete.parfumeur} sera définitivement retirée de la
              collection.
            </p>
            <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => setToDelete(null)} className="btn btn-secondary">
                Annuler
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={() =>
                  startDelete(async () => {
                    const result = await deletePerfume(toDelete.id);
                    if (!result.ok) {
                      toast.error(result.error);
                      return;
                    }
                    toast.success("Miniature supprimée");
                    setToDelete(null);
                  })
                }
                className="btn btn-danger"
              >
                {deleting ? "Suppression…" : "Supprimer"}
              </button>
            </div>
          </>
        )}
      </Dialog>

      <Dialog
        open={importSummary !== null}
        onClose={() => {
          setImportSummary(null);
          setImportFile(null);
        }}
        title="Importer ce fichier ?"
      >
        {importSummary && (
          <ImportPreview
            summary={importSummary}
            pending={importing}
            onCancel={() => {
              setImportSummary(null);
              setImportFile(null);
            }}
            onConfirm={() => {
              if (importFile) runImport(importFile, "apply");
              setImportSummary(null);
            }}
          />
        )}
      </Dialog>

      <Dialog
        open={preview !== null}
        onClose={() => setPreview(null)}
        title="Photo"
        className="max-w-3xl"
      >
        {preview && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="" className="w-full rounded-2xl bg-white object-contain" />
        )}
      </Dialog>
    </div>
  );
}

function ImportPreview({
  summary,
  pending,
  onCancel,
  onConfirm,
}: {
  summary: ImportSummary;
  pending: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const nothingToDo = summary.added + summary.changed + summary.removed === 0;

  return (
    <>
      <p className="text-texte-doux">
        Le fichier contient {plural(summary.total, "ligne")}. Rien n&apos;est encore modifié.
      </p>
      <ul className="mt-5 grid grid-cols-3 gap-2 text-center">
        {[
          ["Ajouts", summary.added],
          ["Modifications", summary.changed],
          ["Suppressions", summary.removed],
        ].map(([label, value]) => (
          <li key={label} className="rounded-2xl bg-fond p-3">
            <p className="text-2xl font-semibold tabular-nums">{formatCount(Number(value))}</p>
            <p className="text-xs text-texte-doux">{label}</p>
          </li>
        ))}
      </ul>

      {summary.removed > 0 && (
        <p role="alert" className="mt-5 rounded-2xl bg-red-700/10 p-4 text-sm text-red-900">
          {plural(summary.removed, "miniature")} absente{summary.removed > 1 ? "s" : ""} du fichier{" "}
          {summary.removed > 1 ? "seront supprimées" : "sera supprimée"} de la collection.
        </p>
      )}

      <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button type="button" onClick={onCancel} className="btn btn-secondary">
          {nothingToDo ? "Fermer" : "Annuler"}
        </button>
        {!nothingToDo && (
          <button
            type="button"
            onClick={onConfirm}
            disabled={pending}
            className={`btn ${summary.removed > 0 ? "btn-danger" : "btn-primary"}`}
          >
            Appliquer l&apos;import
          </button>
        )}
      </div>
    </>
  );
}
