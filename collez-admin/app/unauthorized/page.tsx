import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-12 text-slate-100">
      <div className="w-full max-w-md rounded-2xl border border-rose-800/50 bg-slate-900 p-8 shadow-2xl">
        <h1 className="text-2xl font-semibold text-rose-300">Access denied</h1>
        <p className="mt-3 text-sm text-slate-300">
          This dashboard is restricted to the founder email only.
        </p>
        <Link
          href="/sign-in"
          className="mt-6 inline-flex rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 hover:border-slate-500"
        >
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
