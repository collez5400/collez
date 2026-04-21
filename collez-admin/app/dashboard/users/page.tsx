import Link from "next/link";
import { revalidatePath } from "next/cache";
import { requireFounderUser } from "@/src/lib/auth";
import { getSupabaseAdminClient } from "@/src/lib/supabase/admin";

type SearchParams = Promise<{ q?: string }>;

export default async function UsersPage(props: { searchParams: SearchParams }) {
  await requireFounderUser();
  const supabaseAdmin = getSupabaseAdminClient();
  const searchParams = await props.searchParams;
  const q = (searchParams.q ?? "").trim();

  let query = supabaseAdmin
    .from("users")
    .select("id,full_name,username,email,college_id,xp,streak_count,is_banned,is_graduated,featured,created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  if (q) {
    query = query.or(`full_name.ilike.%${q}%,username.ilike.%${q}%,email.ilike.%${q}%`);
  }

  const { data: users } = await query;

  async function toggleBan(formData: FormData) {
    "use server";
    const id = String(formData.get("id"));
    const isBanned = String(formData.get("isBanned")) === "true";
    await supabaseAdmin.from("users").update({ is_banned: !isBanned }).eq("id", id);
    revalidatePath("/dashboard/users");
  }

  async function toggleFeature(formData: FormData) {
    "use server";
    const id = String(formData.get("id"));
    const featured = String(formData.get("featured")) === "true";
    await supabaseAdmin.from("users").update({ featured: !featured }).eq("id", id);
    revalidatePath("/dashboard/users");
  }

  async function toggleGraduate(formData: FormData) {
    "use server";
    const id = String(formData.get("id"));
    const isGraduated = String(formData.get("isGraduated")) === "true";
    await supabaseAdmin.from("users").update({ is_graduated: !isGraduated }).eq("id", id);
    revalidatePath("/dashboard/users");
  }

  async function resetXp(formData: FormData) {
    "use server";
    const id = String(formData.get("id"));
    await supabaseAdmin.from("users").update({ xp: 0, daily_xp_earned: 0 }).eq("id", id);
    await supabaseAdmin.from("xp_transactions").delete().eq("user_id", id);
    revalidatePath("/dashboard/users");
    revalidatePath(`/dashboard/users/${id}`);
  }

  async function editProfile(formData: FormData) {
    "use server";
    const id = String(formData.get("id"));
    const fullName = String(formData.get("fullName"));
    const username = String(formData.get("username"));
    await supabaseAdmin.from("users").update({ full_name: fullName, username }).eq("id", id);
    revalidatePath("/dashboard/users");
    revalidatePath(`/dashboard/users/${id}`);
  }

  return (
    <div>
      <h1 className="text-3xl font-semibold">Users</h1>
      <p className="mt-2 text-sm text-slate-400">Search users and run moderation or account actions.</p>

      <form className="mt-6">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search by name, username, or email"
          className="w-full max-w-lg rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
        />
      </form>

      <div className="mt-6 overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full min-w-[1200px] bg-slate-900 text-sm">
          <thead className="bg-slate-800/80 text-left text-slate-300">
            <tr>
              <th className="px-3 py-2">User</th>
              <th className="px-3 py-2">XP</th>
              <th className="px-3 py-2">Streak</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Edit Profile</th>
              <th className="px-3 py-2">Actions</th>
              <th className="px-3 py-2">Detail</th>
            </tr>
          </thead>
          <tbody>
            {(users ?? []).map((user) => (
              <tr key={user.id} className="border-t border-slate-800 align-top">
                <td className="px-3 py-3">
                  <p className="font-medium">{user.full_name}</p>
                  <p className="text-slate-400">@{user.username}</p>
                  <p className="text-xs text-slate-500">{user.email}</p>
                </td>
                <td className="px-3 py-3">{user.xp ?? 0}</td>
                <td className="px-3 py-3">{user.streak_count ?? 0}</td>
                <td className="px-3 py-3 text-xs">
                  <p>{user.is_banned ? "Banned" : "Active"}</p>
                  <p>{user.is_graduated ? "Graduated" : "Current"}</p>
                  <p>{user.featured ? "Featured" : "Regular"}</p>
                </td>
                <td className="px-3 py-3">
                  <form action={editProfile} className="flex flex-col gap-2">
                    <input type="hidden" name="id" value={user.id} />
                    <input
                      name="fullName"
                      defaultValue={user.full_name ?? ""}
                      className="rounded border border-slate-700 bg-slate-950 px-2 py-1 text-xs"
                    />
                    <input
                      name="username"
                      defaultValue={user.username ?? ""}
                      className="rounded border border-slate-700 bg-slate-950 px-2 py-1 text-xs"
                    />
                    <button type="submit" className="rounded bg-indigo-600 px-2 py-1 text-xs">
                      Save
                    </button>
                  </form>
                </td>
                <td className="space-y-2 px-3 py-3">
                  <form action={toggleBan}>
                    <input type="hidden" name="id" value={user.id} />
                    <input type="hidden" name="isBanned" value={String(user.is_banned)} />
                    <button type="submit" className="rounded border border-slate-700 px-2 py-1 text-xs">
                      {user.is_banned ? "Unban" : "Ban"}
                    </button>
                  </form>
                  <form action={toggleGraduate}>
                    <input type="hidden" name="id" value={user.id} />
                    <input type="hidden" name="isGraduated" value={String(user.is_graduated)} />
                    <button type="submit" className="rounded border border-slate-700 px-2 py-1 text-xs">
                      {user.is_graduated ? "Restore" : "Graduate"}
                    </button>
                  </form>
                  <form action={toggleFeature}>
                    <input type="hidden" name="id" value={user.id} />
                    <input type="hidden" name="featured" value={String(user.featured)} />
                    <button type="submit" className="rounded border border-slate-700 px-2 py-1 text-xs">
                      {user.featured ? "Unfeature" : "Feature"}
                    </button>
                  </form>
                  <form action={resetXp}>
                    <input type="hidden" name="id" value={user.id} />
                    <button type="submit" className="rounded border border-rose-700 px-2 py-1 text-xs text-rose-300">
                      Reset XP
                    </button>
                  </form>
                </td>
                <td className="px-3 py-3">
                  <Link href={`/dashboard/users/${user.id}`} className="text-indigo-300 hover:text-indigo-200">
                    Open
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
