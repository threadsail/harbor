import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { getAppSession } from "@/utils/auth/session";

export const metadata = {
  title: "Buy & bid | Harbor",
  description:
    "Access private device galleries from schools and enterprises and submit bids as a verified recycling vendor.",
};

export default async function BuyPage() {
  const session = await getAppSession();
  if (session?.role === "buyer") redirect("/dashboard/buyer");
  if (session?.role === "seller") redirect("/dashboard/seller");

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
        For recycling vendors
      </p>
      <h1 className="font-display mt-3 text-4xl tracking-tight text-[var(--ink)] sm:text-5xl">
        Bid on invitation-only lots
      </h1>
      <p className="mt-5 text-lg leading-relaxed text-[var(--muted)]">
        There is no public catalog of every device on Harbor. Sellers share
        private gallery links with you. Sign in to open a link, review the
        inventory, and place your bid.
      </p>

      <ol className="mt-12 space-y-8">
        {[
          {
            title: "Create a buyer account",
            body: "Register as a recycling or refurbishment vendor so sellers can trust your bids.",
          },
          {
            title: "Open a shared gallery link",
            body: "Sellers send you a Harbor URL. Without the link—and a login—you cannot see the lot.",
          },
          {
            title: "Inspect the gallery",
            body: "Review device types, quantities, condition notes, and photos before you commit.",
          },
          {
            title: "Submit your bid",
            body: "Place a competitive offer. The seller chooses the winning vendor and arranges pickup.",
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
          href="/auth?mode=signup&intent=buy"
          className="inline-flex rounded-md bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-dark)]"
        >
          Create buyer account
        </Link>
        <Link
          href="/auth?intent=buy"
          className="inline-flex rounded-md border border-[var(--border)] bg-white px-6 py-3 text-sm font-semibold text-[var(--ink)] transition hover:bg-[var(--mist)]"
        >
          Sign in to bid
        </Link>
        <Link
          href="/auth?intent=buy"
          className="inline-flex text-sm font-semibold text-[var(--accent)] hover:underline"
        >
          Use buyer test login →
        </Link>
      </div>
    </div>
  );
}
