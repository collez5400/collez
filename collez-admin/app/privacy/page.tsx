export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-3xl px-6 py-14">
        <h1 className="text-3xl font-bold">Privacy Policy</h1>
        <p className="mt-6 text-slate-300">
          COLLEZ stores profile and leaderboard-related information in Supabase. Local features (timetable, tasks, notes,
          PDFs) are stored on your device.
        </p>
        <p className="mt-4 text-slate-300">
          We don’t sell personal information. We may process basic usage data to improve reliability and detect abuse.
        </p>
        <p className="mt-4 text-slate-300">
          You can request account deletion by contacting support. Some data may be retained for security and fraud
          prevention.
        </p>
      </div>
    </main>
  );
}

