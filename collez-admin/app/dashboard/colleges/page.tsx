import { revalidatePath } from "next/cache";
import { requireFounderUser } from "@/src/lib/auth";
import { getSupabaseAdminClient } from "@/src/lib/supabase/admin";

export default async function CollegesPage() {
  await requireFounderUser();
  const supabaseAdmin = getSupabaseAdminClient();

  const [{ data: pending }, { data: approved }] = await Promise.all([
    supabaseAdmin
      .from("colleges")
      .select("id,name,city,state,is_approved,is_disabled,student_count,total_xp,created_at")
      .eq("is_approved", false)
      .order("created_at", { ascending: false }),
    supabaseAdmin
      .from("colleges")
      .select("id,name,city,state,is_approved,is_disabled,student_count,total_xp,created_at")
      .eq("is_approved", true)
      .order("student_count", { ascending: false })
      .limit(150),
  ]);

  async function approveCollege(formData: FormData) {
    "use server";
    const id = String(formData.get("id"));
    await supabaseAdmin.from("colleges").update({ is_approved: true }).eq("id", id);
    revalidatePath("/dashboard/colleges");
  }

  async function rejectCollege(formData: FormData) {
    "use server";
    const id = String(formData.get("id"));
    await supabaseAdmin.from("colleges").delete().eq("id", id);
    revalidatePath("/dashboard/colleges");
  }

  async function renameCollege(formData: FormData) {
    "use server";
    const id = String(formData.get("id"));
    const name = String(formData.get("name"));
    await supabaseAdmin.from("colleges").update({ name }).eq("id", id);
    revalidatePath("/dashboard/colleges");
  }

  async function toggleDisable(formData: FormData) {
    "use server";
    const id = String(formData.get("id"));
    const isDisabled = String(formData.get("isDisabled")) === "true";
    await supabaseAdmin.from("colleges").update({ is_disabled: !isDisabled }).eq("id", id);
    revalidatePath("/dashboard/colleges");
  }

  async function mergeCollege(formData: FormData) {
    "use server";
    const sourceId = String(formData.get("sourceId"));
    const targetId = String(formData.get("targetId"));
    if (!sourceId || !targetId || sourceId === targetId) return;

    await supabaseAdmin.from("users").update({ college_id: targetId }).eq("college_id", sourceId);
    await supabaseAdmin.from("coordinator_applications").update({ college_id: targetId }).eq("college_id", sourceId);
    await supabaseAdmin.from("colleges").delete().eq("id", sourceId);
    revalidatePath("/dashboard/colleges");
  }

  return (
    <div>
      <h1 className="text-3xl font-semibold">Colleges</h1>
      <p className="mt-2 text-sm text-slate-400">Approve, merge, rename, and disable colleges.</p>

      <section className="mt-8">
        <h2 className="text-xl font-semibold">Pending approvals</h2>
        <div className="mt-3 space-y-3">
          {(pending ?? []).map((college) => (
            <div key={college.id} className="rounded-xl border border-slate-800 bg-slate-900 p-4">
              <p className="font-medium">
                {college.name} · {college.city}, {college.state}
              </p>
              <div className="mt-3 flex gap-2">
                <form action={approveCollege}>
                  <input type="hidden" name="id" value={college.id} />
                  <button className="rounded bg-emerald-700 px-3 py-1.5 text-sm">Approve</button>
                </form>
                <form action={rejectCollege}>
                  <input type="hidden" name="id" value={college.id} />
                  <button className="rounded border border-rose-700 px-3 py-1.5 text-sm text-rose-300">
                    Reject
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold">Manage approved colleges</h2>
        <div className="mt-3 overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full min-w-[1100px] bg-slate-900 text-sm">
            <thead className="bg-slate-800/80 text-left text-slate-300">
              <tr>
                <th className="px-3 py-2">College</th>
                <th className="px-3 py-2">Students</th>
                <th className="px-3 py-2">Total XP</th>
                <th className="px-3 py-2">Rename</th>
                <th className="px-3 py-2">Disable</th>
                <th className="px-3 py-2">Merge</th>
              </tr>
            </thead>
            <tbody>
              {(approved ?? []).map((college) => (
                <tr key={college.id} className="border-t border-slate-800 align-top">
                  <td className="px-3 py-3">
                    {college.name}
                    <p className="text-xs text-slate-400">
                      {college.city}, {college.state}
                    </p>
                  </td>
                  <td className="px-3 py-3">{college.student_count ?? 0}</td>
                  <td className="px-3 py-3">{college.total_xp ?? 0}</td>
                  <td className="px-3 py-3">
                    <form action={renameCollege} className="flex gap-2">
                      <input type="hidden" name="id" value={college.id} />
                      <input
                        name="name"
                        defaultValue={college.name}
                        className="rounded border border-slate-700 bg-slate-950 px-2 py-1 text-xs"
                      />
                      <button className="rounded bg-indigo-600 px-2 py-1 text-xs">Save</button>
                    </form>
                  </td>
                  <td className="px-3 py-3">
                    <form action={toggleDisable}>
                      <input type="hidden" name="id" value={college.id} />
                      <input type="hidden" name="isDisabled" value={String(college.is_disabled)} />
                      <button className="rounded border border-slate-700 px-2 py-1 text-xs">
                        {college.is_disabled ? "Enable" : "Disable"}
                      </button>
                    </form>
                  </td>
                  <td className="px-3 py-3">
                    <form action={mergeCollege} className="flex items-center gap-2">
                      <input type="hidden" name="sourceId" value={college.id} />
                      <select
                        name="targetId"
                        className="rounded border border-slate-700 bg-slate-950 px-2 py-1 text-xs"
                        defaultValue=""
                      >
                        <option value="" disabled>
                          Merge into...
                        </option>
                        {(approved ?? [])
                          .filter((candidate) => candidate.id !== college.id)
                          .map((candidate) => (
                            <option key={candidate.id} value={candidate.id}>
                              {candidate.name}
                            </option>
                          ))}
                      </select>
                      <button className="rounded border border-slate-700 px-2 py-1 text-xs">Merge</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
