import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

let cachedClient: ReturnType<typeof createClient<Database>> | null = null;

export function getSupabaseServer() {
  if (cachedClient) {
    return cachedClient;
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error("[supabaseServer] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  cachedClient = createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return cachedClient;
}
