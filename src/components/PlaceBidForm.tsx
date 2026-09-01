"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { parseBidAmount } from "@/lib/bids";
import { getInventoryLot, submitBid } from "@/lib/bids-store";

type PlaceBidFormProps = {
  lotId: string;
  lotTitle: string;
  fallbackAvailable: number;
  bidDeadline: string;
  buyerName: string;
  buyerEmail: string;
};

const inputClass =
  "mt-1.5 w-full rounded-md border border-[var(--border)] px-3 py-2.5 text-sm text-[var(--ink)] placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]";

export default function PlaceBidForm({
  lotId,
  lotTitle,
  fallbackAvailable,
  bidDeadline,
  buyerName,
  buyerEmail,
}: PlaceBidFormProps) {
  const router = useRouter();
  const [available, setAvailable] = useState(fallbackAvailable);
  const [quantity, setQuantity] = useState(String(fallbackAvailable));
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const lot = getInventoryLot(lotId);
    const units = lot?.quantity ?? fallbackAvailable;
    setAvailable(units);
    setQuantity(String(Math.max(units > 0 ? units : 1, 1)));
  }, [lotId, fallbackAvailable]);

  const isClosed = available <= 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setSubmitting(true);

    const qty = Number.parseInt(quantity, 10);
    const bidAmount = parseBidAmount(amount);

    if (!Number.isFinite(qty) || qty < 1) {
      setMessage({ type: "error", text: "Enter a valid quantity." });
      setSubmitting(false);
      return;
    }
    if (bidAmount == null) {
      setMessage({ type: "error", text: "Enter a valid bid amount." });
      setSubmitting(false);
      return;
    }

    const result = submitBid({
      lotId,
      lotTitle,
      buyerName,
      buyerEmail,
      quantity: qty,
      amount: bidAmount,
    });

    if (!result.ok) {
      setMessage({ type: "error", text: result.error });
      setSubmitting(false);
      return;
    }

    setMessage({
      type: "success",
      text: "Bid submitted. The seller will review it in their admin.",
    });
    setAmount("");
    setSubmitting(false);
    router.refresh();
  }

  if (isClosed) {
    return (
      <section className="mt-12 border border-[var(--border)] bg-white p-6 sm:p-8">
        <h2 className="text-lg font-semibold text-[var(--ink)]">Lot closed</h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          This lot has no remaining inventory and is no longer accepting bids.
        </p>
      </section>
    );
  }

  return (
    <section className="mt-12 border border-[var(--border)] bg-white p-6 sm:p-8">
      <h2 className="text-lg font-semibold text-[var(--ink)]">Place a bid</h2>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Enter how many units you want and your total offer for this lot. Up to{" "}
        {available.toLocaleString()} available. Deadline: {bidDeadline}.
      </p>

      {message && (
        <p
          className={`mt-4 rounded-md px-3 py-2 text-sm ${
            message.type === "error"
              ? "bg-red-50 text-red-700"
              : "bg-emerald-50 text-emerald-800"
          }`}
        >
          {message.text}
        </p>
      )}

      <form onSubmit={handleSubmit} className="mt-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="bid-quantity"
              className="block text-sm font-medium text-[var(--ink)]"
            >
              Quantity
            </label>
            <input
              id="bid-quantity"
              type="number"
              min={1}
              max={available}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className={inputClass}
              required
            />
            <p className="mt-1.5 text-xs text-[var(--muted)]">
              Max {available.toLocaleString()}
            </p>
          </div>
          <div>
            <label
              htmlFor="bid-amount"
              className="block text-sm font-medium text-[var(--ink)]"
            >
              Bid amount (USD)
            </label>
            <input
              id="bid-amount"
              type="text"
              inputMode="decimal"
              placeholder="e.g. 12,500"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={inputClass}
              required
            />
            <p className="mt-1.5 text-xs text-[var(--muted)]">
              Total for the quantity above. If accepted, you pay this amount via
              Stripe; Harbor retains a hosting fee from the seller&apos;s payout.
            </p>
          </div>
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="mt-6 rounded-md bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--accent-dark)] disabled:opacity-50"
        >
          {submitting ? "Submitting…" : "Submit bid"}
        </button>
      </form>
    </section>
  );
}
