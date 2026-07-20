import Link from "next/link";

export default function PaymentCancelPage() {
  return (
    <div className="mx-auto w-full max-w-lg px-4 py-16 sm:px-6">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
        Stripe payment
      </p>
      <h1 className="font-display mt-2 text-3xl text-[var(--ink)]">
        Payment canceled
      </h1>
      <p className="mt-4 text-[var(--muted)]">
        No charge was made. The bid is still awaiting payment—you can try Stripe
        checkout again from the seller admin, or the seller can reject the bid.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/dashboard/seller"
          className="rounded-md bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--accent-dark)]"
        >
          Back to seller admin
        </Link>
        <Link
          href="/dashboard/buyer"
          className="rounded-md border border-[var(--border)] px-4 py-2.5 text-sm font-semibold text-[var(--ink)] hover:bg-[var(--mist)]"
        >
          Buyer admin
        </Link>
      </div>
    </div>
  );
}
