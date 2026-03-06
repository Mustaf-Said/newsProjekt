import { createBrowserClient } from "@supabase/ssr";

// TEMP: DEVELOPMENT SITE PROTECTION – remove before production launch
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
