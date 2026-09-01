"use client";

import { useEffect, useState } from "react";
import type { Sale } from "@/lib/bids";
import {
  attachStripeCheckout,
  finalizePaidSale,
  readSales,
} from "@/lib/bids-store";
import { formatFeePercent, formatUsd } from "@/lib/fees";
import { requestStripeCheckout } from "@/lib/stripe-checkout-client";

type BuyerPaymentsPanelProps = {
  buyerEmail: string;
};

function matchesBuyer(sale: Sale, buyerEmail: string): boolean {
  return sale.buyerEmail.toLowerCase() === buyerEmail.toLowerCase();
}

export default function BuyerPaymentsPanel({
  buyerEmail,
}: BuyerPaymentsPanelProps) {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loadingSaleId, setLoadingSaleId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function refresh() {
    const mine = readSales().filter(
      (sale) =>
        matchesBuyer(sale, buyerEmail) &&
        (sale.paymentStatus === "awaiting_payment" ||
          sale.paymentStatus === "paid" ||
          sale.paymentStatus === "simulated")
    );
    setSales(mine);
  }

  useEffect(() => {
    refresh();
    const onUpdate = () => refresh();
    window.addEventListener("harbor-inventory-updated", onUpdate);
    window.addEventListener("storage", onUpdate);
    return () => {
      window.removeEventListener("harbor-inventory-updated", onUpdate);
      window.removeEventListener("storage", onUpdate);
    };
  }, [buyerEmail]);

  const awaiting = sales.filter((s) => s.paymentStatus === "awaiting_payment");
  const completed = sales.filter(
    (s) => s.paymentStatus === "paid" || s.paymentStatus === "simulated"
  );

  async function handlePayNow(sale: Sale) {
    setMessage(null);
    setError(null);
    setLoadingSaleId(sale.id);

    if (sale.stripeCheckoutUrl) {
      window.location.href = sale.stripeCheckoutUrl;
      return;
    }

    const checkout = await requestStripeCheckout(sale);
    if (!checkout.ok) {
      setError(checkout.error);
      setLoadingSaleId(null);
      return;
    }

    const { data } = checkout;

    if (data.mode === "simulate") {
      const finalized = finalizePaidSale(sale.id, "simulated");
      if (!finalized.ok) {
        setError(finalized.error);
      } else {
        setMessage(finalized.message);
        window.dispatchEvent(new Event("harbor-inventory-updated"));
      }
      setLoadingSaleId(null);
      refresh();
      return;
    }

    if (data.sessionId && data.url) {
      attachStripeCheckout(sale.id, data.sessionId, data.url);
      window.location.href = data.url;
      return;
    }

    setError("Could not open Stripe checkout.");
    setLoadingSaleId(null);
  }

  return (
    <div className="space-y-10">
      <section>
        <h2 className="text-lg font-semibold text-[var(--ink)]">
          Accepted offers — pay now
        </h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          When a seller accepts your bid, complete payment here via Stripe.
          Inventory is reserved until you pay or the seller cancels.
        </p>

        {message && (
          <p className="mt-4 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            {message}
          </p>
        )}
        {error && (
          <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        {awaiting.length === 0 ? (
          <div className="mt-4 border border-[var(--border)] bg-white p-6">
            <p className="text-sm text-[var(--muted)]">
              No accepted offers awaiting payment. Place a bid on a lot in a
              linked Seller Inventory — when the seller accepts, it will appear
              here.
            </p>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {awaiting.map((sale) => (
              <div
                key={sale.id}
                className="border border-[var(--accent)] bg-white p-5"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-semibold text-[var(--ink)]">
                      {sale.lotTitle}
                    </p>
                    <p className="mt-1 text-sm text-[var(--muted)]">
                      {sale.quantity.toLocaleString()} units · Accepted{" "}
                      {new Date(sale.createdAt).toLocaleString()}
                    </p>
                    <p className="mt-2 text-lg font-semibold text-[var(--ink)]">
                      {formatUsd(sale.amount)}
                    </p>
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      Includes Harbor hosting fee (
                      {formatFeePercent(sale.feeRate)} ·{" "}
                      {formatUsd(sale.harborFee)})
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={loadingSaleId === sale.id}
                    onClick={() => void handlePayNow(sale)}
                    className="rounded-md bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--accent-dark)] disabled:opacity-50"
                  >
                    {loadingSaleId === sale.id ? "Opening Stripe…" : "Pay now"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {completed.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-[var(--ink)]">
            Completed purchases
          </h2>
          <div className="mt-4 overflow-hidden border border-[var(--border)] bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-[var(--border)] bg-[var(--mist)] text-[var(--muted)]">
                <tr>
                  <th className="px-4 py-3 font-medium">Lot</th>
                  <th className="px-4 py-3 font-medium">Total</th>
                  <th className="px-4 py-3 font-medium">Paid</th>
                </tr>
              </thead>
              <tbody>
                {completed.map((sale) => (
                  <tr
                    key={sale.id}
                    className="border-b border-[var(--border)] last:border-0"
                  >
                    <td className="px-4 py-3 font-medium text-[var(--ink)]">
                      {sale.lotTitle}
                      <span className="mt-1 block text-xs font-normal text-[var(--muted)]">
                        {sale.quantity.toLocaleString()} units
                        {sale.paymentStatus === "simulated"
                          ? " · Simulated"
                          : " · Stripe"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[var(--ink)]">
                      {formatUsd(sale.amount)}
                    </td>
                    <td className="px-4 py-3 text-[var(--muted)]">
                      {sale.paidAt
                        ? new Date(sale.paidAt).toLocaleDateString()
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
