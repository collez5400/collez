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

  async function approve(formData: FormData) {
    "use server";
    const applicationId = String(formData.get("applicationId"));
    const userId = String(formData.get("userId"));

    await supabaseAdmin
      .from("coordinator_applications")
      .update({ status: "approved", reviewed_at: new Date().toISOString(), admin_notes: null })
      .eq("id", applicationId);

    await supabaseAdmin.from("users").update({ is_coordinator: true }).eq("id", userId);

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
    </div>
  );
}

