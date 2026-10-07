import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import * as XLSX from "xlsx";
import { z } from "zod";

import type { Perfume } from "./perfume";
import { selectAll } from "./queries";

export const COLUMNS = [
  "id",
  "parfum",
  "parfumeur",
  "boite",
  "type",
  "contenance",
  "image_file",
  "description",
] as const satisfies readonly (keyof Perfume)[];

export function fetchAllPerfumes(db: SupabaseClient) {
  return selectAll<Perfume>(COLUMNS.join(","), db);
}

export function buildWorkbook(rows: Perfume[]) {
  const sheet = XLSX.utils.json_to_sheet(rows, { header: [...COLUMNS] });
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, "Miniatures");
  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx", compression: true }) as Buffer;
}

// Les valeurs sont gardées telles quelles (pas de trim) pour qu'un export
// réimporté sans retouche n'annonce aucune modification.
const text = z
  .union([z.string(), z.number(), z.null(), z.undefined()])
  .transform((value) => (value == null ? "" : String(value)));

const required = (column: string) =>
  text.refine((value) => value.trim().length > 0, `${column} vide`);

const rowSchema = z.object({
  id: z.coerce.number().int().positive(),
  parfum: required("parfum"),
  parfumeur: required("parfumeur"),
  boite: text
    .transform((value) => {
      const trimmed = value.trim();
      return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
    })
    .pipe(z.enum(["Oui", "Non"], { error: "boite doit valoir Oui ou Non" })),
  type: text,
  contenance: text,
  image_file: text,
  description: text,
});

/** Lit et valide tout le fichier ; renvoie une erreur lisible sans rien écrire si une ligne est invalide. */
export function parseWorkbook(
  buffer: ArrayBuffer,
): { ok: true; rows: Perfume[] } | { ok: false; error: string } {
  let records: Record<string, unknown>[];
  try {
    const workbook = XLSX.read(buffer, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    records = sheet ? XLSX.utils.sheet_to_json(sheet, { defval: "" }) : [];
  } catch {
    return { ok: false, error: "Ce fichier n'est pas un classeur Excel lisible." };
  }

  if (records.length === 0) return { ok: false, error: "Le fichier ne contient aucune miniature." };

  const missing = ["id", "parfum", "parfumeur"].filter((column) => !(column in records[0]));
  if (missing.length > 0) {
    return { ok: false, error: `Colonnes manquantes : ${missing.join(", ")}.` };
  }

  const rows: Perfume[] = [];
  const errors: string[] = [];
  const seen = new Set<number>();

  records.forEach((record, index) => {
    // +2 : ligne d'en-tête et numérotation Excel à partir de 1.
    const line = index + 2;
    const parsed = rowSchema.safeParse(record);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      errors.push(`ligne ${line} (${issue.path.join(".") || "?"}) : ${issue.message}`);
      return;
    }
    if (seen.has(parsed.data.id)) {
      errors.push(`ligne ${line} : id ${parsed.data.id} en double`);
      return;
    }
    seen.add(parsed.data.id);
    rows.push(parsed.data);
  });

  if (errors.length > 0) {
    const shown = errors.slice(0, 5).join(" ; ");
    const more = errors.length > 5 ? ` (et ${errors.length - 5} autres)` : "";
    return { ok: false, error: `Fichier refusé, rien n'a été modifié. ${shown}${more}.` };
  }

  return { ok: true, rows };
}

export function diffCollection(current: Perfume[], incoming: Perfume[]) {
  const currentById = new Map(current.map((row) => [row.id, row]));
  const incomingIds = new Set(incoming.map((row) => row.id));

  const added = incoming.filter((row) => !currentById.has(row.id));
  const changed = incoming.filter((row) => {
    const existing = currentById.get(row.id);
    return existing && COLUMNS.some((column) => (existing[column] ?? "") !== row[column]);
  });
  const removedIds = current.filter((row) => !incomingIds.has(row.id)).map((row) => row.id);

  return { added, changed, removedIds };
}
