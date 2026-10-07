"use server";

import { revalidatePath } from "next/cache";

import { diffCollection, fetchAllPerfumes, parseWorkbook } from "@/lib/collection-file";
import { requireAdmin } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabase";

export type ImportSummary = { added: number; changed: number; removed: number; total: number };
export type ImportResult = { ok: true; summary: ImportSummary } | { ok: false; error: string };

// Vercel refuse les requêtes de plus de 4,5 Mo ; un export complet fait environ 1,2 Mo.
const MAX_FILE_BYTES = 4 * 1024 * 1024;
const CHUNK = 500;

/**
 * mode "preview" : valide le fichier et calcule les changements, sans rien écrire.
 * mode "apply"   : applique ces changements (ajouts/modifications puis suppressions).
 * Rien n'est écrit tant que tout le fichier n'est pas valide, et les suppressions
 * n'ont lieu qu'après la réussite de tous les ajouts et modifications.
 */
export async function importCollection(formData: FormData): Promise<ImportResult> {
  try {
    await requireAdmin();

    const file = formData.get("file");
    if (!(file instanceof File) || file.size === 0) return { ok: false, error: "Aucun fichier." };
    if (file.size > MAX_FILE_BYTES) return { ok: false, error: "Fichier trop lourd (4 Mo max)." };

    const parsed = parseWorkbook(await file.arrayBuffer());
    if (!parsed.ok) return parsed;

    const db = supabaseAdmin();
    const { added, changed, removedIds } = diffCollection(await fetchAllPerfumes(db), parsed.rows);
    const summary = {
      added: added.length,
      changed: changed.length,
      removed: removedIds.length,
      total: parsed.rows.length,
    };

    if (formData.get("mode") !== "apply") return { ok: true, summary };

    const upserts = [...added, ...changed];
    for (let i = 0; i < upserts.length; i += CHUNK) {
      const { error } = await db
        .from("perfumes")
        .upsert(upserts.slice(i, i + CHUNK), { onConflict: "id" });
      if (error) throw new Error(`Import interrompu (aucune suppression faite) : ${error.message}`);
    }

    // Les photos des fiches retirées sont conservées dans le stockage : si le
    // fichier importé était incomplet, un nouvel import les retrouvera.
    for (let i = 0; i < removedIds.length; i += CHUNK) {
      const { error } = await db
        .from("perfumes")
        .delete()
        .in("id", removedIds.slice(i, i + CHUNK));
      if (error) throw new Error(`Suppressions interrompues : ${error.message}`);
    }

    revalidatePath("/", "layout");
    return { ok: true, summary };
  } catch (error) {
    console.error(error);
    return { ok: false, error: error instanceof Error ? error.message : "Erreur inattendue." };
  }
}
