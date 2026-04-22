import { revalidatePath } from "next/cache";
import { requireFounderUser } from "@/src/lib/auth";
import { getSupabaseAdminClient } from "@/src/lib/supabase/admin";

type CoordinatorApplicationRow = {
  id: string;
  user_id: string;
  college_id: string;
  full_name: string;
  whatsapp_number: string;
  email: string;
  reason: string;
  college_id_photo_url: string;
  selfie_url: string;
  status: "pending" | "approved" | "rejected";
  admin_notes: string | null;
  created_at: string;
  users?: {
    id: string;
    full_name: string;
    username: string;
    email: string;
    xp: number;
    streak_count: number;
    avatar_url: string | null;
  } | null;
  colleges?: {
    id: string;
    name: string;
    city: string;
    state: string;
    is_approved: boolean;
  } | null;
};

function parseBucketPath(value: string) {
  // Mobile stores `bucket/path`. Older values might be full URLs.
  if (value.startsWith("http://") || value.startsWith("https://")) return null;
  const [bucket, ...rest] = value.split("/");
  const path = rest.join("/");
  if (!bucket || !path) return null;
  return { bucket, path };
}

async function signedUrlFor(value: string) {
  const parsed = parseBucketPath(value);
  if (!parsed) return value;
  const supabaseAdmin = getSupabaseAdminClient();
  const { data, error } = await supabaseAdmin.storage.from(parsed.bucket).createSignedUrl(parsed.path, 60 * 60);
  if (error) return null;
  return data.signedUrl;
}

async function fetchPendingApps() {
  const supabaseAdmin = getSupabaseAdminClient();

  const { data, error } = await supabaseAdmin
    .from("coordinator_applications")
    .select(
      "id,user_id,college_id,full_name,whatsapp_number,email,reason,college_id_photo_url,selfie_url,status,admin_notes,created_at,users(id,full_name,username,email,xp,streak_count,avatar_url),colleges(id,name,city,state,is_approved)"
    )
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) throw error;

  const rows = (data ?? []) as unknown as CoordinatorApplicationRow[];
  const withSigned = await Promise.all(
    rows.map(async (row) => ({
      ...row,
      college_id_photo_url: (await signedUrlFor(row.college_id_photo_url)) ?? "",
      selfie_url: (await signedUrlFor(row.selfie_url)) ?? "",
    }))
  );
  return withSigned;
}

export default async function CoordinatorsPage() {
  await requireFounderUser();
  const supabaseAdmin = getSupabaseAdminClient();

  const pending = await fetchPendingApps();
  const { data: coordinators } = await supabaseAdmin
    .from("users")
    .select("id,full_name,username,email,xp,streak_count,coordinator_type,coordinator_region,colleges(name,city,state)")
    .eq("is_coordinator", true)
    .order("xp", { ascending: false })
    .limit(300);

  async function approve(formData: FormData) {
    "use server";
    const applicationId = String(formData.get("applicationId"));
    const userId = String(formData.get("userId"));

    await supabaseAdmin
      .from("coordinator_applications")
      .update({ status: "approved", reviewed_at: new Date().toISOString(), admin_notes: null })
      .eq("id", applicationId);

    await supabaseAdmin
      .from("users")
      .update({ is_coordinator: true, coordinator_type: "college", coordinator_region: null })
      .eq("id", userId);

    await supabaseAdmin.from("badges").insert({
      user_id: userId,
      badge_type: "coordinator",
      badge_name: "Official College Coordinator",
      earned_at: new Date().toISOString(),
    });

    revalidatePath("/dashboard/coordinators");
    revalidatePath("/dashboard");
  }

  async function reject(formData: FormData) {
    "use server";
    const applicationId = String(formData.get("applicationId"));
    const reason = String(formData.get("reason") ?? "").trim();

    await supabaseAdmin
      .from("coordinator_applications")
      .update({
        status: "rejected",
        reviewed_at: new Date().toISOString(),
        admin_notes: reason || "Rejected",
      })
      .eq("id", applicationId);

    revalidatePath("/dashboard/coordinators");
    revalidatePath("/dashboard");
  }

  async function promoteCoordinator(formData: FormData) {
    "use server";
    const userId = String(formData.get("userId") ?? "");
    const targetType = String(formData.get("targetType") ?? "");
    const targetRegion = String(formData.get("targetRegion") ?? "").trim();
    if (!userId || !["college", "city", "state"].includes(targetType)) return;
    if ((targetType === "city" || targetType === "state") && !targetRegion) return;

    await supabaseAdmin
      .from("users")
      .update({
        is_coordinator: true,
        coordinator_type: targetType,
        coordinator_region: targetType === "college" ? null : targetRegion,
      })
      .eq("id", userId);

    revalidatePath("/dashboard/coordinators");
    revalidatePath("/dashboard/users");
  }

  return (
    <div>
      <h1 className="text-3xl font-semibold">Coordinator Applications</h1>
      <p className="mt-2 text-sm text-slate-400">Review pending coordinator applications.</p>

      <section className="mt-8 space-y-4">
        {pending.length === 0 ? (
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 text-sm text-slate-300">
            No pending applications.
          </div>
        ) : (
          pending.map((app) => (
            <div key={app.id} className="rounded-xl border border-slate-800 bg-slate-900 p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-lg font-semibold">{app.full_name}</p>
                  <p className="text-sm text-slate-300">{app.email}</p>
                  <p className="text-sm text-slate-300">WhatsApp: {app.whatsapp_number}</p>
                  <p className="mt-2 text-sm text-slate-200">{app.reason}</p>
                  <p className="mt-2 text-xs text-slate-400">
                    College: {app.colleges?.name ?? "—"} · {app.colleges?.city ?? ""} {app.colleges?.state ?? ""}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Stats: XP {app.users?.xp ?? 0} · Streak {app.users?.streak_count ?? 0}d · @{app.users?.username ?? "user"}
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400">College ID</p>
                    {app.college_id_photo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={app.college_id_photo_url}
                        alt="College ID"
                        className="mt-2 h-56 w-44 rounded-lg border border-slate-800 object-cover"
                      />
                    ) : (
                      <p className="mt-2 text-sm text-slate-400">Missing</p>
                    )}
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400">Selfie</p>
                    {app.selfie_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={app.selfie_url}
                        alt="Selfie"
                        className="mt-2 h-56 w-44 rounded-lg border border-slate-800 object-cover"
                      />
                    ) : (
                      <p className="mt-2 text-sm text-slate-400">Missing</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <form action={approve}>
                  <input type="hidden" name="applicationId" value={app.id} />
                  <input type="hidden" name="userId" value={app.user_id} />
                  <button className="rounded bg-emerald-700 px-3 py-1.5 text-sm">Approve</button>
                </form>

                <form action={reject} className="flex flex-wrap items-center gap-2">
                  <input type="hidden" name="applicationId" value={app.id} />
                  <input
                    name="reason"
                    placeholder="Rejection reason (optional)"
                    className="w-72 rounded border border-slate-700 bg-slate-950 px-2 py-1.5 text-xs"
                    defaultValue=""
                  />
                  <button className="rounded border border-rose-700 px-3 py-1.5 text-sm text-rose-300 hover:border-rose-500">
                    Reject
                  </button>
                </form>
              </div>
            </div>
          ))
        )}
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-xl font-semibold">Coordinator Role Management</h2>
        <p className="text-sm text-slate-400">Promote existing coordinators to city/state roles (admin-only).</p>
        {(coordinators ?? []).length === 0 ? (
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 text-sm text-slate-300">
            No coordinators found.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full min-w-[960px] bg-slate-900 text-sm">
              <thead className="bg-slate-800/80 text-left text-slate-300">
                <tr>
                  <th className="px-3 py-2">Coordinator</th>
                  <th className="px-3 py-2">College</th>
                  <th className="px-3 py-2">Current Role</th>
                  <th className="px-3 py-2">Promote / Update</th>
                </tr>
              </thead>
              <tbody>
                {(coordinators ?? []).map((row) => {
                  const college = Array.isArray(row.colleges) ? row.colleges[0] : row.colleges;
                  const role =
                    row.coordinator_type === "city"
                      ? `City • ${row.coordinator_region ?? "—"}`
                      : row.coordinator_type === "state"
                        ? `State • ${row.coordinator_region ?? "—"}`
                        : "College";
                  return (
                    <tr key={row.id} className="border-t border-slate-800 align-top">
                      <td className="px-3 py-3">
                        <p className="font-medium">{row.full_name}</p>
                        <p className="text-slate-400">@{row.username}</p>
                        <p className="text-xs text-slate-500">XP {row.xp ?? 0} · Streak {row.streak_count ?? 0}d</p>
                      </td>
                      <td className="px-3 py-3 text-xs text-slate-300">
                        <p>{college?.name ?? "—"}</p>
                        <p>{college?.city ?? ""} {college?.state ?? ""}</p>
                      </td>
                      <td className="px-3 py-3 text-sm">{role}</td>
                      <td className="px-3 py-3">
                        <form action={promoteCoordinator} className="flex flex-wrap items-center gap-2">
                          <input type="hidden" name="userId" value={row.id} />
                          <select
                            name="targetType"
                            defaultValue={row.coordinator_type ?? "college"}
                            className="rounded border border-slate-700 bg-slate-950 px-2 py-1 text-xs"
                          >
                            <option value="college">college</option>
                            <option value="city">city</option>
                            <option value="state">state</option>
                          </select>
                          <input
                            name="targetRegion"
                            defaultValue={row.coordinator_region ?? ""}
                            placeholder="Region for city/state"
                            className="w-48 rounded border border-slate-700 bg-slate-950 px-2 py-1 text-xs"
                          />
                          <button className="rounded border border-indigo-600 px-2 py-1 text-xs text-indigo-300">Save role</button>
                        </form>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

