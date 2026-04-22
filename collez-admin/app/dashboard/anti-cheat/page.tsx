import { revalidatePath } from "next/cache";
import { requireFounderUser } from "@/src/lib/auth";
import { getSupabaseAdminClient } from "@/src/lib/supabase/admin";

type AntiCheatFlag = {
  id: string;
  user_id: string;
  flag_type: string;
  severity: "low" | "medium" | "high";
  reason: string;
  status: "pending" | "reviewed" | "actioned";
  created_at: string;
  users?: {
    full_name: string;
    username: string;
    email: string;
    xp: number;
    streak_count: number;
  } | null;
};

export default async function AntiCheatPage() {
  await requireFounderUser();
  const supabaseAdmin = getSupabaseAdminClient();

  const { data } = await supabaseAdmin
    .from("anti_cheat_flags")
    .select("id,user_id,flag_type,severity,reason,status,created_at,users(full_name,username,email,xp,streak_count)")
    .order("created_at", { ascending: false })
    .limit(300);
  const flags = (data ?? []) as unknown as AntiCheatFlag[];

  async function updateStatus(formData: FormData) {
    "use server";
    const id = String(formData.get("id") ?? "");
    const status = String(formData.get("status") ?? "");
    if (!id || !["pending", "reviewed", "actioned"].includes(status)) return;
    await supabaseAdmin
      .from("anti_cheat_flags")
      .update({ status, reviewed_at: new Date().toISOString(), reviewed_by: "founder" })
      .eq("id", id);
    revalidatePath("/dashboard/anti-cheat");
    revalidatePath("/dashboard");
  }

  return (
    <div>
      <h1 className="text-3xl font-semibold">Anti-Cheat Review Queue</h1>
      <p className="mt-2 text-sm text-slate-400">Review velocity/pattern-based suspicious activity flags.</p>

      <div className="mt-6 overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full min-w-[1080px] bg-slate-900 text-sm">
          <thead className="bg-slate-800/80 text-left text-slate-300">
            <tr>
              <th className="px-3 py-2">User</th>
              <th className="px-3 py-2">Flag</th>
              <th className="px-3 py-2">Severity</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Created</th>
              <th className="px-3 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {flags.map((row) => (
              <tr key={row.id} className="border-t border-slate-800 align-top">
                <td className="px-3 py-3">
                  <p className="font-medium">{row.users?.full_name ?? "Unknown"}</p>
                  <p className="text-slate-400">@{row.users?.username ?? "unknown"}</p>
                  <p className="text-xs text-slate-500">{row.users?.email ?? ""}</p>
                </td>
                <td className="px-3 py-3">
                  <p className="font-medium">{row.flag_type}</p>
                  <p className="text-xs text-slate-400">{row.reason}</p>
                </td>
                <td className="px-3 py-3">
                  <span
                    className={`rounded px-2 py-0.5 text-xs ${
                      row.severity === "high"
                        ? "bg-rose-900/40 text-rose-300"
                        : row.severity === "medium"
                          ? "bg-amber-900/40 text-amber-300"
                          : "bg-slate-700 text-slate-200"
                    }`}
                  >
                    {row.severity}
                  </span>
                </td>
                <td className="px-3 py-3 text-xs">{row.status}</td>
                <td className="px-3 py-3 text-xs text-slate-400">{new Date(row.created_at).toLocaleString()}</td>
                <td className="px-3 py-3">
                  <form action={updateStatus} className="flex items-center gap-2">
                    <input type="hidden" name="id" value={row.id} />
                    <select name="status" defaultValue={row.status} className="rounded border border-slate-700 bg-slate-950 px-2 py-1 text-xs">
                      <option value="pending">pending</option>
                      <option value="reviewed">reviewed</option>
                      <option value="actioned">actioned</option>
                    </select>
                    <button className="rounded border border-slate-700 px-2 py-1 text-xs">Save</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
