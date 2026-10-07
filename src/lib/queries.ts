import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { cache } from "react";

import type { Letter, Perfume, PerfumeSummary } from "./perfume";
import { supabasePublic } from "./supabase";

const SUMMARY_COLUMNS = "id,parfum,parfumeur,boite,type,contenance,image_file";

export const PAGE_SIZE = 36;

type PageResult<T> = { items: T[]; total: number };

type QueryResponse = PromiseLike<{
  data: unknown[] | null;
  count: number | null;
  error: { code?: string; message: string } | null;
}>;

async function paged<T>(
  page: number,
  perPage: number,
  run: (from: number, to: number) => QueryResponse,
): Promise<PageResult<T>> {
  const from = (page - 1) * perPage;
  const { data, count, error } = await run(from, from + perPage - 1);

  if (error) {
    // PGRST103 : page demandée au-delà de la dernière. On renvoie quand même
    // le total pour que la page puisse rediriger vers la dernière page valide.
    if (error.code === "PGRST103") {
      const retry = await run(0, 0);
      if (!retry.error) return { items: [], total: retry.count ?? 0 };
    }
    throw new Error(error.message);
  }

  return { items: (data ?? []) as T[], total: count ?? 0 };
}

/** Échappe les jokers de ILIKE pour une recherche « contient ». */
function contains(term: string) {
  return `%${term.replace(/[\\%_]/g, (char) => `\\${char}`)}%`;
}

// Les noms commençant par une lettre accentuée (Ô, Œ, É…) sont rangés sous
// leur lettre de base, comme le fait déjà le tri de la base.
const ACCENTED: Partial<Record<Letter, string>> = {
  A: "ÀÂÄÁÆ",
  C: "Ç",
  E: "ÉÈÊË",
  I: "ÎÏÍ",
  N: "Ñ",
  O: "ÔÖÓŒ",
  U: "ÙÛÜÚ",
  Y: "Ÿ",
};

function startsWithFilter(column: string, letter: Letter) {
  if (letter === "#") {
    return [..."0123456789"].map((digit) => `${column}.like.${digit}%`).join(",");
  }
  return [letter, ...(ACCENTED[letter] ?? "")].map((char) => `${column}.ilike.${char}%`).join(",");
}

/**
 * Lit une ou plusieurs colonnes de toute la table, par tranches de 1 000 lignes
 * (limite par défaut de l'API Supabase) demandées en parallèle.
 */
export async function selectAll<T>(columns: string, db: SupabaseClient = supabasePublic()) {
  const CHUNK = 1000;
  const { count, error } = await db.from("perfumes").select("id", { count: "exact", head: true });
  if (error) throw new Error(error.message);

  const chunks = await Promise.all(
    Array.from({ length: Math.ceil((count ?? 0) / CHUNK) }, (_, index) =>
      db
        .from("perfumes")
        .select(columns)
        .order("id")
        .range(index * CHUNK, (index + 1) * CHUNK - 1),
    ),
  );

  return chunks.flatMap((chunk) => {
    if (chunk.error) throw new Error(chunk.error.message);
    return chunk.data as T[];
  });
}

export async function getCollectionStats() {
  const db = supabasePublic();
  const [all, withBox] = await Promise.all([
    db.from("perfumes").select("id", { count: "exact", head: true }),
    db.from("perfumes").select("id", { count: "exact", head: true }).eq("boite", "Oui"),
  ]);
  if (all.error) throw new Error(all.error.message);
  if (withBox.error) throw new Error(withBox.error.message);
  return { total: all.count ?? 0, withBox: withBox.count ?? 0 };
}

/** Accueil : les plus récentes d'abord, ou par ordre alphabétique pour une lettre. */
export function listPerfumes({ letter, page }: { letter: Letter | null; page: number }) {
  return paged<PerfumeSummary>(page, PAGE_SIZE, (from, to) => {
    const query = supabasePublic().from("perfumes").select(SUMMARY_COLUMNS, { count: "exact" });
    if (!letter) {
      return query.order("id", { ascending: false }).range(from, to);
    }
    return query.or(startsWithFilter("parfum", letter)).order("parfum").order("id").range(from, to);
  });
}

export const getPerfume = cache(async (id: number) => {
  const { data, error } = await supabasePublic()
    .from("perfumes")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data as Perfume | null;
});

export function listByParfumeur(parfumeur: string, page: number) {
  return paged<PerfumeSummary>(page, PAGE_SIZE, (from, to) =>
    supabasePublic()
      .from("perfumes")
      .select(SUMMARY_COLUMNS, { count: "exact" })
      .eq("parfumeur", parfumeur)
      .order("parfum")
      .order("id")
      .range(from, to),
  );
}

/** Tous les parfumeurs avec leur nombre de miniatures, triés par nom. */
export const listParfumeurs = cache(async () => {
  const counts = new Map<string, number>();
  for (const { parfumeur } of await selectAll<{ parfumeur: string }>("parfumeur")) {
    if (parfumeur) counts.set(parfumeur, (counts.get(parfumeur) ?? 0) + 1);
  }

  const collator = new Intl.Collator("fr", { sensitivity: "base", numeric: true });
  return [...counts]
    .map(([name, total]) => ({ name, total }))
    .sort((a, b) => collator.compare(a.name, b.name));
});

export function searchPerfumes({
  parfum,
  parfumeur,
  page,
}: {
  parfum: string;
  parfumeur: string;
  page: number;
}) {
  return paged<Perfume>(page, PAGE_SIZE, (from, to) => {
    let query = supabasePublic().from("perfumes").select("*", { count: "exact" });
    if (parfum) query = query.ilike("parfum", contains(parfum));
    if (parfumeur) query = query.ilike("parfumeur", contains(parfumeur));
    return query.order("parfum").order("id").range(from, to);
  });
}

export const ADMIN_PAGE_SIZE = 50;

export function listForAdmin({
  parfum,
  parfumeur,
  description,
  page,
}: {
  parfum: string;
  parfumeur: string;
  description: string;
  page: number;
}) {
  return paged<Perfume>(page, ADMIN_PAGE_SIZE, (from, to) => {
    let query = supabasePublic().from("perfumes").select("*", { count: "exact" });
    if (parfum) query = query.ilike("parfum", contains(parfum));
    if (parfumeur) query = query.ilike("parfumeur", contains(parfumeur));
    if (description) query = query.ilike("description", contains(description));
    return query.order("id", { ascending: false }).range(from, to);
  });
}
