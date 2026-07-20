import { Suspense } from "react";
import AuthForm from "./AuthForm";

function AuthFallback() {
  return (
    <div className="mx-auto w-full max-w-md px-4 py-12 sm:px-6 sm:py-16">
      <div className="mb-8 text-center">
        <p className="font-display text-3xl text-[var(--ink)]">Harbor</p>
        <p className="mt-2 text-sm text-[var(--muted)]">Loading…</p>
      </div>
      <div className="border border-[var(--border)] bg-white p-8 shadow-sm">
        <div className="mb-6 flex gap-2 rounded-md bg-[var(--mist)] p-1">
          <div className="h-10 flex-1 rounded-md bg-white" />
          <div className="h-10 flex-1 rounded-md" />
        </div>
        <div className="space-y-4">
          <div className="h-10 rounded-md bg-[var(--mist)]" />
          <div className="h-10 rounded-md bg-[var(--mist)]" />
          <div className="h-10 rounded-md bg-[var(--accent)]/80" />
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<AuthFallback />}>
      <AuthForm />
    </Suspense>
  );
}
