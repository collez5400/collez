import type { ReactNode } from "react";
import Link from "next/link";
import { requireFounderUser } from "@/src/lib/auth";

export const dynamic = "force-dynamic";

const navItems = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/users", label: "Users" },
  { href: "/dashboard/colleges", label: "Colleges" },
  { href: "/dashboard/quotes", label: "Quotes" },
  { href: "/dashboard/events", label: "Events" },
  { href: "/dashboard/coordinators", label: "Coordinators" },
  { href: "/dashboard/bonus", label: "Bonus XP" },
];

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { user } = await requireFounderUser();

  const signOut = async () => {
    "use server";
    const { supabase } = await requireFounderUser();
    await supabase.auth.signOut();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-900/80">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">COLLEZ ADMIN</p>
            <p className="text-sm text-slate-300">{user.email}</p>
          </div>
          <nav className="flex flex-wrap gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-md border border-slate-700 px-3 py-1.5 text-sm hover:border-slate-500"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <form action={signOut}>
            <button
              type="submit"
              className="rounded-md border border-rose-700 px-3 py-1.5 text-sm text-rose-300 hover:border-rose-500"
            >
              Sign Out
            </button>
          </form>
        </div>
      </header>
      <div className="mx-auto w-full max-w-7xl px-6 py-6">{children}</div>
    </div>
  );
}
