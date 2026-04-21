import { revalidatePath } from "next/cache";
import { requireFounderUser } from "@/src/lib/auth";
import { getSupabaseAdminClient } from "@/src/lib/supabase/admin";

function parseCsvQuotes(csvContent: string) {
  return csvContent
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(1)
    .map((line) => {
      const [scheduled_date, text, author] = line.split(",").map((value) => value.trim());
      return { scheduled_date, text, author: author || null };
    })
    .filter((row) => row.scheduled_date && row.text);
}

export default async function QuotesPage() {
  await requireFounderUser();
  const supabaseAdmin = getSupabaseAdminClient();

  const { data: quotes } = await supabaseAdmin
    .from("quotes")
    .select("id,text,author,scheduled_date,is_active,created_at")
    .order("scheduled_date", { ascending: true })
    .limit(365);

  async function addQuote(formData: FormData) {
    "use server";
    const text = String(formData.get("text"));
    const author = String(formData.get("author") ?? "");
    const scheduledDate = String(formData.get("scheduledDate"));

    await supabaseAdmin.from("quotes").insert({
      text,
      author: author || null,
      scheduled_date: scheduledDate,
      is_active: true,
    });

    revalidatePath("/dashboard/quotes");
  }

  async function bulkUpload(formData: FormData) {
    "use server";
    const csvText = String(formData.get("csvText") ?? "");
    const entries = parseCsvQuotes(csvText);
    if (!entries.length) return;

    await supabaseAdmin.from("quotes").upsert(entries, { onConflict: "scheduled_date" });
    revalidatePath("/dashboard/quotes");
  }

  async function deleteQuote(formData: FormData) {
    "use server";
    const id = String(formData.get("id"));
    await supabaseAdmin.from("quotes").delete().eq("id", id);
    revalidatePath("/dashboard/quotes");
  }

  return (
    <div>
      <h1 className="text-3xl font-semibold">Quotes</h1>
      <p className="mt-2 text-sm text-slate-400">Schedule daily quotes and bulk upload from CSV.</p>

      <section className="mt-8 grid gap-4 lg:grid-cols-2">
        <form action={addQuote} className="rounded-xl border border-slate-800 bg-slate-900 p-4">
          <h2 className="text-lg font-semibold">Add single quote</h2>
          <div className="mt-3 space-y-3">
            <textarea
              name="text"
              required
              placeholder="Quote text"
              className="min-h-28 w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
            />
            <input
              name="author"
              placeholder="Author (optional)"
              className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
            />
            <input
              name="scheduledDate"
              type="date"
              required
              className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
            />
            <button className="rounded bg-indigo-600 px-3 py-2 text-sm">Save quote</button>
          </div>
        </form>

        <form action={bulkUpload} className="rounded-xl border border-slate-800 bg-slate-900 p-4">
          <h2 className="text-lg font-semibold">Bulk CSV upload</h2>
          <p className="mt-2 text-xs text-slate-400">
            Header format: <code>scheduled_date,text,author</code>
          </p>
          <textarea
            name="csvText"
            required
            placeholder={"scheduled_date,text,author\n2026-04-22,Discipline beats motivation,Unknown"}
            className="mt-3 min-h-36 w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-xs"
          />
          <button className="mt-3 rounded border border-slate-700 px-3 py-2 text-sm">Upload CSV</button>
        </form>
      </section>

      <section className="mt-10 rounded-xl border border-slate-800 bg-slate-900 p-4">
        <h2 className="text-lg font-semibold">Scheduled quote calendar</h2>
        <div className="mt-3 max-h-[520px] space-y-2 overflow-auto">
          {(quotes ?? []).map((quote) => (
            <div key={quote.id} className="rounded border border-slate-800 bg-slate-950 p-3">
              <p className="text-xs text-slate-400">{quote.scheduled_date}</p>
              <p className="mt-1 text-sm">{quote.text}</p>
              <p className="mt-1 text-xs text-slate-500">{quote.author ?? "Unknown"}</p>
              <form action={deleteQuote} className="mt-2">
                <input type="hidden" name="id" value={quote.id} />
                <button className="text-xs text-rose-300 hover:text-rose-200">Delete</button>
              </form>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
