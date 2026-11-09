import "server-only";
import { createClient } from "@supabase/supabase-js";

const noStore: typeof fetch = (input, init) => fetch(input, { ...init, cache: "no-store" });

/** Cliente del servidor (clave de servicio). Nunca se usa en el navegador. */
export function db() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Faltan SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false }, global: { fetch: noStore } });
}
