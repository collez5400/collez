import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/src/lib/supabase/server";
import { getServerEnv } from "@/src/lib/env";

export async function requireFounderUser() {
  const serverEnv = getServerEnv();
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  if (user.email?.toLowerCase() !== serverEnv.founderEmail.toLowerCase()) {
    redirect("/unauthorized");
  }

  return { supabase, user };
}
