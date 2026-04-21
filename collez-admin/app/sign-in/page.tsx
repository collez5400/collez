import { Suspense } from "react";
import { SignInClient } from "@/app/sign-in/SignInClient";

function SignInFallback() {
  return (
    <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
      <h1 className="text-2xl font-semibold">Sign in to COLLEZ Admin</h1>
      <p className="mt-2 text-sm text-slate-300">Preparing authentication...</p>
    </div>
  );
}

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-12 text-slate-100">
      <Suspense fallback={<SignInFallback />}>
        <SignInClient />
      </Suspense>
    </div>
  );
}
