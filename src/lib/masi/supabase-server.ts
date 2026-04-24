import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cached: SupabaseClient | null = null;

export function getMasiSupabase(): SupabaseClient {
  if (cached) return cached;

  const url = process.env.MASI_SUPABASE_URL;
  const serviceRoleKey = process.env.MASI_SUPABASE_SERVICE_ROLE_KEY;

  if (!url) throw new Error("MASI_SUPABASE_URL is not set");
  if (!serviceRoleKey) throw new Error("MASI_SUPABASE_SERVICE_ROLE_KEY is not set");

  cached = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  return cached;
}
