import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-12 text-slate-100">
      <main className="w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 p-10 shadow-2xl">
        <p className="text-sm uppercase tracking-[0.2em] text-slate-400">
          COLLEZ Admin
        </p>
        <h1 className="mt-3 text-3xl font-semibold">Control Center</h1>
        <p className="mt-4 text-slate-300">
          Founder-only dashboard for managing users, colleges, and content.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/dashboard"
            className="rounded-lg bg-indigo-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-400"
          >
            Open Dashboard
          </Link>
          <Link
            href="/sign-in"
            className="rounded-lg border border-slate-700 px-5 py-2.5 text-sm font-medium text-slate-200 hover:border-slate-500"
          >
            Sign In
          </Link>
        </div>
      </main>
    </div>
  );
}
