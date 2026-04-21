import { getSupabaseAdminClient } from "@/src/lib/supabase/admin";
import { requireFounderUser } from "@/src/lib/auth";

async function fetchOverviewStats() {
  const supabaseAdmin = getSupabaseAdminClient();
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - 7);

  const [
    { count: totalUsers },
    { count: newToday },
    { count: newWeek },
    { count: activeEvents },
    { count: pendingColleges },
    { count: pendingCoordinatorApps },
    { count: pendingReports },
    { data: xpRows },
    { data: dauRows },
  ] =
    await Promise.all([
      supabaseAdmin.from("users").select("*", { count: "exact", head: true }),
      supabaseAdmin
        .from("users")
        .select("*", { count: "exact", head: true })
        .gte("created_at", todayStart.toISOString()),
      supabaseAdmin
        .from("users")
        .select("*", { count: "exact", head: true })
        .gte("created_at", weekStart.toISOString()),
      supabaseAdmin.from("events").select("*", { count: "exact", head: true }).eq("status", "live"),
      supabaseAdmin.from("colleges").select("*", { count: "exact", head: true }).eq("is_approved", false),
      supabaseAdmin
        .from("coordinator_applications")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending"),
      supabaseAdmin.from("user_reports").select("*", { count: "exact", head: true }).eq("status", "pending"),
      supabaseAdmin.from("users").select("xp"),
      supabaseAdmin
        .from("streak_logs")
        .select("user_id, logged_date")
        .eq("logged_date", todayStart.toISOString().split("T")[0]),
    ]);

  const totalXp = (xpRows ?? []).reduce((sum, row) => sum + (row.xp ?? 0), 0);
  const dau = new Set((dauRows ?? []).map((row) => row.user_id)).size;

  return {
    totalUsers: totalUsers ?? 0,
    newToday: newToday ?? 0,
    newWeek: newWeek ?? 0,
    dau,
    totalXp,
    activeEvents: activeEvents ?? 0,
    pendingColleges: pendingColleges ?? 0,
    pendingCoordinatorApps: pendingCoordinatorApps ?? 0,
    pendingReports: pendingReports ?? 0,
  };
}

export default async function DashboardPage() {
  await requireFounderUser();

  const stats = await fetchOverviewStats();

  return (
    <div>
      <h1 className="text-3xl font-semibold">Dashboard Overview</h1>
      <p className="mt-2 text-sm text-slate-400">Live operational snapshot of COLLEZ platform.</p>
      <main className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <article className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <p className="text-sm text-slate-400">Total users</p>
          <p className="mt-2 text-3xl font-semibold">{stats.totalUsers}</p>
        </article>
        <article className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <p className="text-sm text-slate-400">New users today</p>
          <p className="mt-2 text-3xl font-semibold">{stats.newToday}</p>
        </article>
        <article className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <p className="text-sm text-slate-400">New users this week</p>
          <p className="mt-2 text-3xl font-semibold">{stats.newWeek}</p>
        </article>
        <article className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <p className="text-sm text-slate-400">Daily active users</p>
          <p className="mt-2 text-3xl font-semibold">{stats.dau}</p>
        </article>
        <article className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <p className="text-sm text-slate-400">Total XP distributed</p>
          <p className="mt-2 text-3xl font-semibold">{stats.totalXp.toLocaleString()}</p>
        </article>
        <article className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <p className="text-sm text-slate-400">Active events</p>
          <p className="mt-2 text-3xl font-semibold">{stats.activeEvents}</p>
        </article>
      </main>

      <section className="mt-8 rounded-xl border border-slate-800 bg-slate-900 p-5">
        <h2 className="text-lg font-semibold">Pending actions</h2>
        <ul className="mt-3 space-y-2 text-sm text-slate-300">
          <li>College approvals: {stats.pendingColleges}</li>
          <li>Coordinator applications: {stats.pendingCoordinatorApps}</li>
          <li>User reports: {stats.pendingReports}</li>
        </ul>
      </section>
      <main className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <article className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <p className="text-sm text-slate-400">Pending colleges</p>
          <p className="mt-2 text-3xl font-semibold">{stats.pendingColleges}</p>
        </article>
        <article className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <p className="text-sm text-slate-400">Pending coordinator apps</p>
          <p className="mt-2 text-3xl font-semibold">{stats.pendingCoordinatorApps}</p>
        </article>
        <article className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <p className="text-sm text-slate-400">Pending reports</p>
          <p className="mt-2 text-3xl font-semibold">{stats.pendingReports}</p>
        </article>
      </main>
    </div>
  );
}
