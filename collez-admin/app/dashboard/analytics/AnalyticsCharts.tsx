"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type ActivityPoint = {
  date: string;
  dau: number;
  wau: number;
  mau: number;
};

type RetentionPoint = {
  stage: string;
  users: number;
  pct: number;
};

type HeatmapPoint = {
  state: string;
  city: string;
  users: number;
  intensity: number;
};

function FunnelBars({ rows }: { rows: RetentionPoint[] }) {
  return (
    <div className="mt-4 space-y-3">
      {rows.map((row) => (
        <div key={row.stage} className="rounded-lg border border-slate-800 bg-slate-950/60 p-3">
          <div className="flex items-center justify-between text-sm">
            <span>{row.stage}</span>
            <span className="text-slate-300">
              {row.users.toLocaleString()} ({row.pct.toFixed(1)}%)
            </span>
          </div>
          <div className="mt-2 h-2 rounded bg-slate-800">
            <div
              className="h-2 rounded bg-cyan-500"
              style={{ width: `${Math.max(4, Math.min(100, row.pct))}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function HeatmapGrid({ rows }: { rows: HeatmapPoint[] }) {
  return (
    <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {rows.map((row) => (
        <article
          key={`${row.state}-${row.city}`}
          className="rounded-lg border border-slate-800 p-3"
          style={{
            backgroundColor: `rgba(14, 165, 233, ${Math.max(0.12, row.intensity)})`,
          }}
        >
          <p className="text-sm font-medium">
            {row.city}, {row.state}
          </p>
          <p className="mt-1 text-xs text-slate-200">{row.users.toLocaleString()} active students</p>
        </article>
      ))}
    </div>
  );
}

export function AnalyticsCharts({
  activityRows,
  retentionRows,
  heatmapRows,
}: {
  activityRows: ActivityPoint[];
  retentionRows: RetentionPoint[];
  heatmapRows: HeatmapPoint[];
}) {
  return (
    <>
      <section className="mt-8 rounded-xl border border-slate-800 bg-slate-900 p-5">
        <h2 className="text-lg font-semibold">DAU / WAU / MAU (30d)</h2>
        <p className="mt-1 text-xs text-slate-400">Derived from streak activity logs and rolling windows.</p>
        <div className="mt-4 h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={activityRows}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 12 }} />
              <YAxis stroke="#94a3b8" allowDecimals={false} />
              <Tooltip
                contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155" }}
                labelStyle={{ color: "#e2e8f0" }}
              />
              <Legend />
              <Line type="monotone" dataKey="dau" stroke="#22d3ee" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="wau" stroke="#818cf8" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="mau" stroke="#34d399" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="mt-8 rounded-xl border border-slate-800 bg-slate-900 p-5">
        <h2 className="text-lg font-semibold">Retention Funnel</h2>
        <p className="mt-1 text-xs text-slate-400">
          Signup → Completed onboarding → Active in 7d → Active in 30d.
        </p>
        <FunnelBars rows={retentionRows} />
      </section>

      <section className="mt-8 rounded-xl border border-slate-800 bg-slate-900 p-5">
        <h2 className="text-lg font-semibold">College Growth Heatmap</h2>
        <p className="mt-1 text-xs text-slate-400">
          City-level growth hotspots ranked by student concentration.
        </p>
        <HeatmapGrid rows={heatmapRows} />
      </section>
    </>
  );
}
