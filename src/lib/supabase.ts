import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { env } from "./env";

let publicClient: SupabaseClient | undefined;
let adminClient: SupabaseClient | undefined;

const options = { auth: { persistSession: false, autoRefreshToken: false } };

/** Lectures publiques (clé anon, soumise aux règles RLS). */
export function supabasePublic() {
  publicClient ??= createClient(env.supabaseUrl, env.supabaseAnonKey, options);
  return publicClient;
}

/**
 * Écritures réservées à l'admin (clé secrète, ignore les règles RLS).
 * À n'appeler qu'après `requireAdmin()` : ce client ne doit jamais atteindre le navigateur.
 */
export function supabaseAdmin() {
  adminClient ??= createClient(env.supabaseUrl, env.supabaseSecretKey, options);
  return adminClient;
}
