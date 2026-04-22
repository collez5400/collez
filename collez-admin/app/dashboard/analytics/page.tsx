import { requireFounderUser } from "@/src/lib/auth";
import { getSupabaseAdminClient } from "@/src/lib/supabase/admin";
import { AnalyticsCharts } from "./AnalyticsCharts";

type ActivityRow = {
  user_id: string;
  logged_date: string;
};

type UserRow = {
  id: string;
  created_at: string;
  onboarding_complete: boolean;
};

type CollegeRow = {
  id: string;
  city: string;
  state: string;
  is_approved: boolean;
};

function dateRange(days: number): string[] {
  const out: string[] = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

function compactDate(isoDate: string): string {
  return isoDate.slice(5);
}

export default async function AnalyticsPage() {
  await requireFounderUser();
  const supabaseAdmin = getSupabaseAdminClient();

  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - 35);

  const [{ data: activityRows }, { data: users }, { data: colleges }] = await Promise.all([
    supabaseAdmin
      .from("streak_logs")
      .select("user_id,logged_date")
      .gte("logged_date", fromDate.toISOString().slice(0, 10)),
    supabaseAdmin.from("users").select("id,created_at,onboarding_complete,college_id"),
    supabaseAdmin.from("colleges").select("id,city,state,is_approved").eq("is_approved", true),
  ]);

  const activity = (activityRows ?? []) as ActivityRow[];
  const userRows = (users ?? []) as UserRow[];
  const collegeRows = (colleges ?? []) as CollegeRow[];
  const collegeMap = new Map(collegeRows.map((c) => [c.id, c]));

  const activityByDate = new Map<string, Set<string>>();
  for (const row of activity) {
    const key = String(row.logged_date).slice(0, 10);
    if (!activityByDate.has(key)) activityByDate.set(key, new Set());
    activityByDate.get(key)?.add(row.user_id);
  }

  const days = dateRange(30);
  const chartRows = days.map((day) => {
    const dayIndex = days.indexOf(day);
    const dau = activityByDate.get(day)?.size ?? 0;

    const wauSet = new Set<string>();
    const mauSet = new Set<string>();
    for (let i = Math.max(0, dayIndex - 6); i <= dayIndex; i += 1) {
      const dateUsers = activityByDate.get(days[i]);
      dateUsers?.forEach((u) => wauSet.add(u));
    }
    for (let i = Math.max(0, dayIndex - 29); i <= dayIndex; i += 1) {
      const dateUsers = activityByDate.get(days[i]);
      dateUsers?.forEach((u) => mauSet.add(u));
    }

    return {
      date: compactDate(day),
      dau,
      wau: wauSet.size,
      mau: mauSet.size,
    };
  });

  const active7dStart = new Date();
  active7dStart.setDate(active7dStart.getDate() - 7);
  const active30dStart = new Date();
  active30dStart.setDate(active30dStart.getDate() - 30);

  const active7dUsers = new Set<string>();
  const active30dUsers = new Set<string>();
  for (const row of activity) {
    const ts = new Date(row.logged_date).getTime();
    if (ts >= active7dStart.getTime()) active7dUsers.add(row.user_id);
    if (ts >= active30dStart.getTime()) active30dUsers.add(row.user_id);
  }

  const totalUsers = userRows.length;
  const onboardingComplete = userRows.filter((u) => u.onboarding_complete).length;
  const retained7d = userRows.filter((u) => active7dUsers.has(u.id)).length;
  const retained30d = userRows.filter((u) => active30dUsers.has(u.id)).length;

  const funnelRows = [
    { stage: "Signed up", users: totalUsers },
    { stage: "Completed onboarding", users: onboardingComplete },
    { stage: "Active in last 7 days", users: retained7d },
    { stage: "Active in last 30 days", users: retained30d },
  ].map((row) => ({
    ...row,
    pct: totalUsers ? (row.users / totalUsers) * 100 : 0,
  }));

  const cityCounts = new Map<string, { state: string; city: string; users: number }>();
  for (const user of users ?? []) {
    const collegeId = (user as { college_id?: string | null }).college_id;
    if (!collegeId) continue;
    const college = collegeMap.get(collegeId);
    if (!college) continue;
    const key = `${college.state}::${college.city}`;
    const prev = cityCounts.get(key);
    cityCounts.set(key, {
      state: college.state,
      city: college.city,
      users: (prev?.users ?? 0) + 1,
    });
  }

  const maxCityUsers = Math.max(1, ...Array.from(cityCounts.values()).map((r) => r.users));
  const heatmapRows = Array.from(cityCounts.values())
    .sort((a, b) => b.users - a.users)
    .slice(0, 24)
    .map((row) => ({
      ...row,
      intensity: row.users / maxCityUsers,
    }));

  return (
    <div>
      <h1 className="text-3xl font-semibold">Analytics</h1>
      <p className="mt-2 text-sm text-slate-400">
        DAU/WAU/MAU trends, retention funnel visibility, and college-region growth distribution.
      </p>
      <AnalyticsCharts activityRows={chartRows} retentionRows={funnelRows} heatmapRows={heatmapRows} />
    </div>
  );
}
