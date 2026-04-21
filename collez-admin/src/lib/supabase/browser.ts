"use client";

import { createBrowserClient } from "@supabase/ssr";
import { getPublicEnv } from "@/src/lib/env";

export function createSupabaseBrowserClient() {
  const publicEnv = getPublicEnv();
  return createBrowserClient(publicEnv.supabaseUrl, publicEnv.supabaseAnonKey);
}

