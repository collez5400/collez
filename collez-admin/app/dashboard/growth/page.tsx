import { requireFounderUser } from "@/src/lib/auth";
import { getSupabaseAdminClient } from "@/src/lib/supabase/admin";

type FeaturedUser = {
  id: string;
  full_name: string;
  username: string;
  email: string;
  xp: number;
  streak_count: number;
  college_id: string | null;
  colleges?: { name: string } | null;
};

type MonthlyLeaderboardRow = {
  id: string;
  full_name: string;
  username: string;
  monthly_xp: number;
  college_name: string | null;
};

export default async function GrowthToolsPage() {
  await requireFounderUser();
  const supabaseAdmin = getSupabaseAdminClient();

  const [{ data: featuredUsers }, { data: consentUsers }, { data: monthlyRows }] = await Promise.all([
    supabaseAdmin
      .from("users")
      .select("id,full_name,username,email,xp,streak_count,college_id,colleges(name)")
      .eq("featured", true)
      .order("xp", { ascending: false })
      .limit(100),
    supabaseAdmin
      .from("users")
      .select("email,full_name,username,college_id,colleges(name)")
      .eq("marketing_consent", true)
      .order("created_at", { ascending: false })
      .limit(5000),
    supabaseAdmin
      .from("mv_monthly_leaderboard")
      .select("id,full_name,username,monthly_xp,college_name")
      .order("monthly_xp", { ascending: false })
      .limit(50),
  ]);

  const featured = (featuredUsers ?? []) as unknown as FeaturedUser[];
  const monthlyLeaderboard = (monthlyRows ?? []) as unknown as MonthlyLeaderboardRow[];
  const csvRows = [
    ["email", "full_name", "username", "college_name"],
    ...((consentUsers ?? []) as Array<Record<string, unknown>>).map((row) => [
      String(row.email ?? ""),
      String(row.full_name ?? ""),
      String(row.username ?? ""),
      String((row.colleges as { name?: string } | null)?.name ?? ""),
    ]),
  ];
  const csv = csvRows
    .map((r) =>
      r
        .map((cell) => `"${String(cell).replaceAll('"', '""')}"`)
        .join(",")
    )
    .join("\n");

  return (
    <div>
      <h1 className="text-3xl font-semibold">Growth Tools</h1>
      <p className="mt-2 text-sm text-slate-400">
        Featured student exports, consent-based email exports, and monthly leaderboard insights.
      </p>

      <section className="mt-8 rounded-xl border border-slate-800 bg-slate-900 p-5">
        <h2 className="text-lg font-semibold">Featured Students</h2>
        <p className="mt-1 text-xs text-slate-400">Source: users marked as featured on Users page.</p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="text-left text-slate-400">
              <tr>
                <th className="py-2">Name</th>
                <th className="py-2">Username</th>
                <th className="py-2">College</th>
                <th className="py-2">XP</th>
                <th className="py-2">Streak</th>
              </tr>
            </thead>
            <tbody>
              {featured.map((user) => (
                <tr key={user.id} className="border-t border-slate-800">
                  <td className="py-2">{user.full_name}</td>
                  <td className="py-2">@{user.username}</td>
                  <td className="py-2">{(Array.isArray(user.colleges) ? user.colleges[0] : user.colleges)?.name ?? "—"}</td>
                  <td className="py-2">{user.xp ?? 0}</td>
                  <td className="py-2">{user.streak_count ?? 0}d</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-8 rounded-xl border border-slate-800 bg-slate-900 p-5">
        <h2 className="text-lg font-semibold">Email Export (Consent-Only)</h2>
        <p className="mt-1 text-xs text-slate-400">
          Includes users where <code>marketing_consent = true</code>.
        </p>
        <textarea
          readOnly
          value={csv}
          className="mt-4 min-h-48 w-full rounded border border-slate-700 bg-slate-950 p-3 font-mono text-xs"
        />
      </section>

      <section className="mt-8 rounded-xl border border-slate-800 bg-slate-900 p-5">
        <h2 className="text-lg font-semibold">Monthly Leaderboard</h2>
        <p className="mt-1 text-xs text-slate-400">
          Auto-reset behavior is driven by month-bounded aggregation in <code>mv_monthly_leaderboard</code>.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="text-left text-slate-400">
              <tr>
                <th className="py-2">#</th>
                <th className="py-2">User</th>
                <th className="py-2">College</th>
                <th className="py-2">Monthly XP</th>
              </tr>
            </thead>
            <tbody>
              {monthlyLeaderboard.map((row, idx) => (
                <tr key={row.id} className="border-t border-slate-800">
                  <td className="py-2">{idx + 1}</td>
                  <td className="py-2">{row.full_name} <span className="text-slate-400">@{row.username}</span></td>
                  <td className="py-2">{row.college_name ?? "—"}</td>
                  <td className="py-2">{row.monthly_xp ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
