"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import type { Perfume } from "@/lib/perfume";
import { requireAdmin } from "@/lib/session";
import { removePhotoIfUnused, uploadPhoto } from "@/lib/storage";
import { supabaseAdmin } from "@/lib/supabase";

export type ActionResult<T = undefined> = { ok: true; data: T } | { ok: false; error: string };

const fieldsSchema = z.object({
  parfum: z.string().trim().min(1, "Le nom du parfum est obligatoire.").max(200),
  parfumeur: z.string().trim().min(1, "Le parfumeur est obligatoire.").max(200),
  boite: z.enum(["Oui", "Non"], { error: "Indique si la boîte est présente." }),
  type: z.string().trim().max(20),
  contenance: z.string().trim().max(50),
  description: z.string().trim().max(5000),
});

const idSchema = z.number().int().positive();

function readFields(formData: FormData) {
  const raw = Object.fromEntries(
    Object.keys(fieldsSchema.shape).map((key) => [key, String(formData.get(key) ?? "")]),
  );
  return fieldsSchema.safeParse(raw);
}

function readPhoto(formData: FormData) {
  const photo = formData.get("photo");
  return photo instanceof File && photo.size > 0 ? photo : null;
}

async function run<T>(task: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    await requireAdmin();
    const data = await task();
    revalidatePath("/", "layout");
    return { ok: true, data };
  } catch (error) {
    console.error(error);
    return { ok: false, error: error instanceof Error ? error.message : "Erreur inattendue." };
  }
}

export async function createPerfume(formData: FormData) {
  return run(async () => {
    const fields = readFields(formData);
    if (!fields.success) throw new Error(fields.error.issues[0].message);

    const photo = readPhoto(formData);
    if (!photo) throw new Error("Ajoute une photo de la miniature.");
    const imageUrl = await uploadPhoto(photo);

    const db = supabaseAdmin();
    // Les identifiants sont attribués par le site (max + 1) ; on réessaie si
    // un autre ajout a pris le même numéro entre-temps.
    for (let attempt = 0; attempt < 3; attempt++) {
      const { data: last, error: lastError } = await db
        .from("perfumes")
        .select("id")
        .order("id", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (lastError) break;

      const { data, error } = await db
        .from("perfumes")
        .insert({ id: (last?.id ?? 0) + 1, ...fields.data, image_file: imageUrl })
        .select()
        .single();

      if (!error) return data as Perfume;
      if (error.code !== "23505") break;
    }

    await removePhotoIfUnused(imageUrl);
    throw new Error("L'ajout de la miniature a échoué.");
  });
}

export async function updatePerfume(id: number, formData: FormData) {
  return run(async () => {
    idSchema.parse(id);
    const fields = readFields(formData);
    if (!fields.success) throw new Error(fields.error.issues[0].message);

    const db = supabaseAdmin();
    const { data: current, error: readError } = await db
      .from("perfumes")
      .select("image_file")
      .eq("id", id)
      .maybeSingle();
    if (readError || !current) throw new Error("Miniature introuvable.");

    const photo = readPhoto(formData);
    const imageUrl = photo ? await uploadPhoto(photo) : current.image_file;

    const { data, error } = await db
      .from("perfumes")
      .update({ ...fields.data, image_file: imageUrl })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      if (photo) await removePhotoIfUnused(imageUrl);
      throw new Error("La sauvegarde a échoué.");
    }

    // L'ancienne photo n'est supprimée qu'une fois la fiche bien enregistrée.
    if (photo) await removePhotoIfUnused(current.image_file);
    return data as Perfume;
  });
}

/** `redirectTo` : page où aller après suppression (depuis la fiche, qui n'existe plus). */
export async function deletePerfume(id: number, redirectTo?: string) {
  const result = await run(async () => {
    idSchema.parse(id);
    const db = supabaseAdmin();
    const { data, error } = await db
      .from("perfumes")
      .delete()
      .eq("id", id)
      .select("image_file")
      .maybeSingle();
    if (error) throw new Error("La suppression a échoué.");
    if (!data) throw new Error("Miniature introuvable.");

    await removePhotoIfUnused(data.image_file);
    return undefined;
  });

  // Hors du try/catch de run() : redirect() fonctionne en levant une exception.
  // Chemin interne uniquement (refuse //exemple.com et /\exemple.com).
  if (result.ok && redirectTo && /^\/(?![/\\])/.test(redirectTo)) {
    redirect(redirectTo);
  }
  return result;
}
