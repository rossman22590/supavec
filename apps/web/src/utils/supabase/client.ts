import type { Database } from "@/types/supabase";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createBrowserClient } from "@supabase/ssr";

export function createClient(): SupabaseClient<Database> {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
