import { revalidatePath } from "next/cache";
import { requireFounderUser } from "@/src/lib/auth";
import { getSupabaseAdminClient } from "@/src/lib/supabase/admin";
import { getServerEnv } from "@/src/lib/env";

function safeParseConfig(configText: string) {
  try {
    const parsed = JSON.parse(configText);
    return typeof parsed === "object" && parsed ? parsed : null;
  } catch {
    return null;
  }
}

export default async function EventsPage() {
  await requireFounderUser();
  const supabaseAdmin = getSupabaseAdminClient();

  const { data: events } = await supabaseAdmin
    .from("events")
    .select("id,title,event_type,status,start_time,end_time,xp_reward,badge_name,created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  async function createEvent(formData: FormData) {
    "use server";
    const title = String(formData.get("title") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();
    const eventType = String(formData.get("eventType") ?? "trivia").trim();
    const status = String(formData.get("status") ?? "upcoming");
    const startTime = String(formData.get("startTime") ?? "");
    const endTime = String(formData.get("endTime") ?? "");
    const xpReward = Number(formData.get("xpReward") ?? 0);
    const badgeName = String(formData.get("badgeName") ?? "").trim();
    const configText = String(formData.get("config") ?? "");

    const config = safeParseConfig(configText);
    if (!title || !startTime || !endTime || !config) return;

    await supabaseAdmin.from("events").insert({
      title,
      description: description || null,
      event_type: eventType,
      status,
      start_time: startTime,
      end_time: endTime,
      xp_reward: xpReward || 0,
      badge_name: badgeName || null,
      config,
    });

    revalidatePath("/dashboard/events");
    revalidatePath("/dashboard");
  }

  async function updateStatus(formData: FormData) {
    "use server";
    const id = String(formData.get("id") ?? "");
    const status = String(formData.get("status") ?? "");
    if (!id || !status) return;

    await supabaseAdmin.from("events").update({ status }).eq("id", id);

    if (status === "live") {
      const serverEnv = getServerEnv();
      await supabaseAdmin.functions.invoke("notify-event-live", {
        body: { eventId: id },
        headers: { "x-cron-secret": serverEnv.cronSecret },
      });
    }
    revalidatePath("/dashboard/events");
    revalidatePath("/dashboard");
  }

  return (
    <div>
      <h1 className="text-3xl font-semibold">Events</h1>
      <p className="mt-2 text-sm text-slate-400">Create trivia events and control status transitions.</p>

      <section className="mt-8 rounded-xl border border-slate-800 bg-slate-900 p-4">
        <h2 className="text-lg font-semibold">Create event</h2>
        <form action={createEvent} className="mt-4 grid gap-3 md:grid-cols-2">
          <input name="title" required placeholder="Trivia title" className="rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm" />
          <select name="eventType" className="rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm">
            <option value="trivia">trivia</option>
            <option value="treasure_hunt">treasure_hunt</option>
          </select>
          <select name="status" className="rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm">
            <option value="upcoming">upcoming</option>
            <option value="live">live</option>
            <option value="ended">ended</option>
          </select>
          <textarea
            name="description"
            placeholder="Description"
            className="min-h-20 rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm md:col-span-2"
          />
          <input name="startTime" type="datetime-local" required className="rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm" />
          <input name="endTime" type="datetime-local" required className="rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm" />
          <input name="xpReward" type="number" min="0" defaultValue={55} className="rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm" />
          <input name="badgeName" placeholder="Badge name (optional)" className="rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm" />
          <textarea
            name="config"
            required
            className="min-h-56 rounded border border-slate-700 bg-slate-950 px-3 py-2 font-mono text-xs md:col-span-2"
            defaultValue={`{
  "clues": [
    {
      "id": "clue1",
      "type": "puzzle",
      "puzzle_type": "word_scramble",
      "puzzle_data": { "scrambled": "ZLOLEC", "answer": "COLLEZ" },
      "hint": "Unscramble the word"
    },
    {
      "id": "clue2",
      "type": "navigate",
      "target_screen": "leaderboard",
      "hidden_element_id": "diwali_lamp",
      "hint": "Find the hidden lamp icon on rankings"
    },
    {
      "id": "clue3",
      "type": "question",
      "question": "What is the COLLEZ app name?",
      "answer": "COLLEZ",
      "case_sensitive": false
    },
    {
      "id": "clue4",
      "type": "puzzle",
      "puzzle_type": "math",
      "puzzle_data": { "equation": "12 + 8", "answer": "20" }
    },
    {
      "id": "clue5",
      "type": "action",
      "action": "tap_rank_badge_3x",
      "hint": "Tap your rank badge three times"
    }
  ],
  "total_clues": 5,
  "completion_xp": 40,
  "badge_name": "Treasure Hunter"
}

/*
  Trivia template:
{
  "questions": [
    {
      "id": "q1",
      "text": "Who wrote India's national anthem?",
      "options": ["Rabindranath Tagore", "Bankim Chandra", "Sarojini Naidu", "Iqbal"],
      "correct_index": 0,
      "time_limit_seconds": 15
    }
  ],
  "total_questions": 1,
  "xp_per_correct": 5,
  "participation_xp": 5,
  "passing_score": 1,
  "badge_name": "Trivia Scholar"
}
*/
`}
          />
          <button className="rounded bg-indigo-600 px-3 py-2 text-sm md:col-span-2">Create event</button>
        </form>
      </section>

      <section className="mt-8 rounded-xl border border-slate-800 bg-slate-900 p-4">
        <h2 className="text-lg font-semibold">Existing events</h2>
        <div className="mt-4 space-y-3">
          {(events ?? []).map((event) => (
            <div key={event.id} className="rounded border border-slate-800 bg-slate-950 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold">{event.title}</p>
                  <p className="text-xs text-slate-400">
                    {event.event_type} · {event.status} · XP {event.xp_reward}
                  </p>
                </div>
                <form action={updateStatus} className="flex items-center gap-2">
                  <input type="hidden" name="id" value={event.id} />
                  <select name="status" defaultValue={event.status} className="rounded border border-slate-700 bg-slate-900 px-2 py-1 text-xs">
                    <option value="upcoming">upcoming</option>
                    <option value="live">live</option>
                    <option value="ended">ended</option>
                  </select>
                  <button className="rounded border border-slate-700 px-2 py-1 text-xs">Update</button>
                </form>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
