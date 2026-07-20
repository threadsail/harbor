import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { getAppSession } from "@/utils/auth/session";

export const metadata = {
  title: "Sell devices | Harbor",
  description:
    "List surplus school or corporate devices and share a private gallery link with recycling vendors.",
};

export default async function SellPage() {
  const session = await getAppSession();
  if (session?.role === "seller") redirect("/dashboard/seller");
  if (session?.role === "buyer") redirect("/dashboard/buyer");

  // Keep Supabase check for users who might only have supabase session edge cases
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    if (data?.user) redirect("/dashboard");
  } catch {
    // continue as signed out
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
        For schools &amp; companies
      </p>
      <h1 className="font-display mt-3 text-4xl tracking-tight text-[var(--ink)] sm:text-5xl">
        Sell surplus devices privately
      </h1>
      <p className="mt-5 text-lg leading-relaxed text-[var(--muted)]">
        Sign in to build a gallery of retired equipment, then share a single
        link with the recycling vendors you trust. Your lots are never listed
        on a public marketplace.
      </p>

      <ol className="mt-12 space-y-8">
        {[
          {
            title: "Create a seller account",
            body: "Verify your district or company so buyers know the source is legitimate.",
          },
          {
            title: "Catalog devices",
            body: "Add photos, quantities, models, and condition for each lot you want to move.",
          },
          {
            title: "Share your gallery link",
            body: "Invite vendors by URL. Only signed-in buyers with the link can view and bid.",
          },
          {
            title: "Review bids & close",
            body: "Compare offers, accept a winner, and coordinate pickup from your dashboard.",
          },
        ].map((step, i) => (
          <li key={step.title} className="flex gap-4">
            <span className="font-display text-2xl text-[var(--accent)]">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div>
              <h2 className="text-lg font-semibold text-[var(--ink)]">
                {step.title}
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-[var(--muted)]">
                {step.body}
              </p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-12 flex flex-wrap gap-3">
        <Link
          href="/auth?mode=signup&intent=sell"
          className="inline-flex rounded-md bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-dark)]"
        >
          Create seller account
        </Link>
        <Link
          href="/auth?intent=sell"
          className="inline-flex rounded-md border border-[var(--border)] bg-white px-6 py-3 text-sm font-semibold text-[var(--ink)] transition hover:bg-[var(--mist)]"
        >
          Sign in to sell
        </Link>
        <Link
          href="/auth?intent=sell"
          className="inline-flex text-sm font-semibold text-[var(--accent)] hover:underline"
        >
          Use seller test login →
        </Link>
      </div>
    </div>
  );
}
