import "server-only";

import { randomUUID } from "node:crypto";

import { env } from "./env";
import { supabaseAdmin } from "./supabase";

const BUCKET = "images";
const MAX_BYTES = 3 * 1024 * 1024;

/** Envoie une photo (déjà redimensionnée en JPEG par le navigateur) et renvoie son URL publique. */
export async function uploadPhoto(file: File) {
  if (file.type !== "image/jpeg") throw new Error("Format d'image inattendu");
  if (file.size === 0 || file.size > MAX_BYTES) throw new Error("Image trop lourde");

  const path = `${Date.now()}-${randomUUID().slice(0, 8)}.jpg`;
  const { error } = await supabaseAdmin()
    .storage.from(BUCKET)
    .upload(path, file, { contentType: "image/jpeg", cacheControl: "31536000", upsert: false });
  if (error) throw new Error(`Envoi de l'image impossible : ${error.message}`);

  return supabaseAdmin().storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

function storagePath(url: string) {
  const prefix = `${env.supabaseUrl}/storage/v1/object/public/${BUCKET}/`;
  return url.startsWith(prefix) ? decodeURIComponent(url.slice(prefix.length)) : null;
}

/**
 * Supprime une photo du stockage si plus aucune miniature ne l'utilise
 * (certaines photos sont partagées entre plusieurs fiches).
 * Un échec ici ne doit pas faire échouer l'action : au pire, un fichier orphelin reste.
 */
export async function removePhotoIfUnused(url: string | null | undefined) {
  const path = url ? storagePath(url) : null;
  if (!path) return;

  const db = supabaseAdmin();
  const { count, error } = await db
    .from("perfumes")
    .select("id", { count: "exact", head: true })
    .eq("image_file", url);
  if (error || (count ?? 0) > 0) return;

  const { error: removeError } = await db.storage.from(BUCKET).remove([path]);
  if (removeError) console.error("Suppression de la photo impossible", path, removeError.message);
}
