import { revalidatePath } from "next/cache";
import { requireFounderUser } from "@/src/lib/auth";
import { getSupabaseAdminClient } from "@/src/lib/supabase/admin";

type SearchParams = Promise<{ q?: string }>;

export default async function BonusXpPage(props: { searchParams: SearchParams }) {
  await requireFounderUser();
  const supabaseAdmin = getSupabaseAdminClient();
  const searchParams = await props.searchParams;
  const q = (searchParams.q ?? "").trim();

  let usersQuery = supabaseAdmin
    .from("users")
    .select("id,full_name,username,email,xp")
    .order("xp", { ascending: false })
    .limit(50);

  if (q) {
    usersQuery = usersQuery.or(`full_name.ilike.%${q}%,username.ilike.%${q}%,email.ilike.%${q}%`);
  }

  const [{ data: users }, { data: recentBonuses }] = await Promise.all([
    usersQuery,
    supabaseAdmin
      .from("xp_transactions")
      .select("id,user_id,amount,description,created_at")
      .eq("source", "bonus")
      .order("created_at", { ascending: false })
      .limit(30),
  ]);

  const recentUserIds = Array.from(new Set((recentBonuses ?? []).map((item) => item.user_id)));
  const { data: bonusUsers } = recentUserIds.length
    ? await supabaseAdmin.from("users").select("id,full_name,username").in("id", recentUserIds)
    : { data: [] as { id: string; full_name: string; username: string }[] };
  const bonusUsersById = new Map((bonusUsers ?? []).map((item) => [item.id, item]));

  async function awardBonus(formData: FormData) {
    "use server";
    const selected = formData.getAll("userIds").map(String).filter(Boolean);
    const amount = Number(formData.get("amount"));
    const reason = String(formData.get("reason") ?? "");
    if (!selected.length || Number.isNaN(amount) || amount <= 0) return;

    const { data: existingUsers } = await supabaseAdmin.from("users").select("id,xp").in("id", selected);
    if (!existingUsers?.length) return;

    const updates = existingUsers.map((user) => ({
      id: user.id,
      xp: (user.xp ?? 0) + amount,
    }));

    await supabaseAdmin.from("users").upsert(updates, { onConflict: "id" });
    await supabaseAdmin.from("xp_transactions").insert(
      selected.map((userId) => ({
        user_id: userId,
        amount,
        source: "bonus",
        description: reason || "Admin bonus XP",
      })),
    );

    revalidatePath("/dashboard/bonus");
    revalidatePath("/dashboard/users");
    revalidatePath("/dashboard");
  }

  return (
    <div>
      <h1 className="text-3xl font-semibold">Bonus XP</h1>
      <p className="mt-2 text-sm text-slate-400">Assign bonus XP to one or many users.</p>

      <form className="mt-6">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search users by name, username, or email"
          className="w-full max-w-lg rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
        />
      </form>

      <form action={awardBonus} className="mt-6 rounded-xl border border-slate-800 bg-slate-900 p-4">
        <h2 className="text-lg font-semibold">Select users</h2>
        <div className="mt-3 grid max-h-80 gap-2 overflow-auto rounded border border-slate-800 bg-slate-950 p-3">
          {(users ?? []).map((user) => (
            <label key={user.id} className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="userIds" value={user.id} />
              <span>
                {user.full_name} (@{user.username}) · {user.email} · XP {user.xp ?? 0}
              </span>
            </label>
          ))}
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <input
            name="amount"
            type="number"
            min={1}
            required
            placeholder="XP amount"
            className="rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
          />
          <input
            name="reason"
            required
            placeholder="Reason (e.g. Sunday session reward)"
            className="rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
          />
        </div>
        <button className="mt-4 rounded bg-indigo-600 px-3 py-2 text-sm">Award Bonus XP</button>
      </form>

      <section className="mt-8 rounded-xl border border-slate-800 bg-slate-900 p-4">
        <h2 className="text-lg font-semibold">Recent bonus transactions</h2>
        <div className="mt-3 space-y-2 text-sm">
          {(recentBonuses ?? []).map((item) => (
            <div key={item.id} className="rounded border border-slate-800 bg-slate-950 p-2">
              +{item.amount} to {bonusUsersById.get(item.user_id)?.full_name ?? "User"} (@
              {bonusUsersById.get(item.user_id)?.username ?? "unknown"}) · {item.description} ·{" "}
              {new Date(item.created_at).toLocaleString()}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
