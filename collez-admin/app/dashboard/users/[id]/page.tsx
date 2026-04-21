import Link from "next/link";
import { notFound } from "next/navigation";
import { requireFounderUser } from "@/src/lib/auth";
import { getSupabaseAdminClient } from "@/src/lib/supabase/admin";

type Params = Promise<{ id: string }>;

export default async function UserDetailsPage(props: { params: Params }) {
  await requireFounderUser();
  const supabaseAdmin = getSupabaseAdminClient();
  const { id } = await props.params;

  const [{ data: user }, { data: xpHistory }, { data: badges }] = await Promise.all([
    supabaseAdmin
      .from("users")
      .select("id,full_name,username,email,xp,streak_count,rank_tier,is_banned,is_graduated,featured")
      .eq("id", id)
      .single(),
    supabaseAdmin
      .from("xp_transactions")
      .select("amount,source,description,created_at")
      .eq("user_id", id)
      .order("created_at", { ascending: false })
      .limit(25),
    supabaseAdmin
      .from("badges")
      .select("badge_type,badge_name,earned_at")
      .eq("user_id", id)
      .order("earned_at", { ascending: false })
      .limit(50),
  ]);

  if (!user) {
    notFound();
  }

  return (
    <div>
      <div className="mb-4">
        <Link href="/dashboard/users" className="text-sm text-indigo-300 hover:text-indigo-200">
          ← Back to users
        </Link>
      </div>
      <h1 className="text-3xl font-semibold">{user.full_name}</h1>
      <p className="mt-2 text-sm text-slate-400">
        @{user.username} · {user.email}
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
          <p className="text-sm text-slate-400">XP</p>
          <p className="mt-2 text-2xl font-semibold">{user.xp ?? 0}</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
          <p className="text-sm text-slate-400">Streak</p>
          <p className="mt-2 text-2xl font-semibold">{user.streak_count ?? 0}</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
          <p className="text-sm text-slate-400">Rank Tier</p>
          <p className="mt-2 text-2xl font-semibold">{user.rank_tier ?? "fresher"}</p>
        </div>
      </div>

      <section className="mt-8 rounded-xl border border-slate-800 bg-slate-900 p-4">
        <h2 className="text-lg font-semibold">XP history</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {(xpHistory ?? []).map((item, index) => (
            <li key={`${item.created_at}-${index}`} className="rounded border border-slate-800 bg-slate-950 p-2">
              <span className="font-medium">+{item.amount}</span> · {item.source} ·{" "}
              {item.description || "No description"} · {new Date(item.created_at).toLocaleString()}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8 rounded-xl border border-slate-800 bg-slate-900 p-4">
        <h2 className="text-lg font-semibold">Badges</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {(badges ?? []).map((item, index) => (
            <li key={`${item.earned_at}-${index}`} className="rounded border border-slate-800 bg-slate-950 p-2">
              {item.badge_name} ({item.badge_type}) · {new Date(item.earned_at).toLocaleString()}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
