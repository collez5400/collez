import { createClient } from "@supabase/supabase-js";
import { getServerEnv } from "@/src/lib/env";

export function getSupabaseAdminClient() {
  const serverEnv = getServerEnv();
  return createClient(serverEnv.supabaseUrl, serverEnv.supabaseServiceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
