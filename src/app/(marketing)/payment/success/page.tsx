"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { finalizePaidSale } from "@/lib/bids-store";
import { formatUsd } from "@/lib/fees";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const saleId = searchParams.get("sale_id");
  const sessionId = searchParams.get("session_id");
  const [message, setMessage] = useState("Confirming payment…");
  const [detail, setDetail] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  useEffect(() => {
    if (!saleId) {
      setMessage("Missing sale reference.");
      return;
    }
    const result = finalizePaidSale(saleId, "paid", sessionId ?? undefined);
    if (!result.ok) {
      setMessage(result.error);
      return;
    }
    setOk(true);
    setMessage("Payment successful.");
    setDetail(
      `${result.message} Stripe session ${sessionId ?? "n/a"}. Total ${formatUsd(result.sale.amount)}.`
    );
    window.dispatchEvent(new Event("harbor-inventory-updated"));
  }, [saleId, sessionId]);

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-16 sm:px-6">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
        Stripe payment
      </p>
      <h1 className="font-display mt-2 text-3xl text-[var(--ink)]">
        {ok ? "Payment complete" : "Processing"}
      </h1>
      <p className="mt-4 text-[var(--muted)]">{message}</p>
      {detail && <p className="mt-2 text-sm text-[var(--muted)]">{detail}</p>}
      <p className="mt-6 text-sm text-[var(--muted)]">
        Harbor collects a 5% hosting fee from each sale. The remainder is the
        seller payout.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/dashboard/buyer"
          className="rounded-md bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--accent-dark)]"
        >
          Buyer admin
        </Link>
        <Link
          href="/dashboard/seller"
          className="rounded-md border border-[var(--border)] px-4 py-2.5 text-sm font-semibold text-[var(--ink)] hover:bg-[var(--mist)]"
        >
          Seller admin
        </Link>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-lg px-4 py-16 text-[var(--muted)]">
          Confirming payment…
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
