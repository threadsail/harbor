"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Bid, Sale } from "@/lib/bids";
import {
  attachStripeSession,
  finalizePaidSale,
  readBids,
  readSales,
  rejectBid,
  startSaleCheckout,
} from "@/lib/bids-store";
import { calculateHarborFee, formatUsd, HARBOR_FEE_RATE } from "@/lib/fees";

export default function SellerBidsPanel() {
  const [bids, setBids] = useState<Bid[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingBidId, setLoadingBidId] = useState<string | null>(null);

  function refresh() {
    setBids(readBids());
    setSales(readSales());
  }

  useEffect(() => {
    refresh();
  }, []);

  const pending = bids.filter((bid) => bid.status === "pending");
  const awaitingPayment = sales.filter(
    (sale) => sale.paymentStatus === "awaiting_payment"
  );

  async function handleAcceptAndCharge(bidId: string) {
    setMessage(null);
    setError(null);
    setLoadingBidId(bidId);

    const started = startSaleCheckout(bidId);
    if (!started.ok) {
      setError(started.error);
      setLoadingBidId(null);
      refresh();
      return;
    }

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          saleId: started.sale.id,
          bidId: started.bid.id,
          lotTitle: started.sale.lotTitle,
          quantity: started.sale.quantity,
          amount: started.sale.amount,
          buyerEmail: started.sale.buyerEmail,
          buyerName: started.sale.buyerName,
        }),
      });
      const data = (await response.json()) as {
        mode?: string;
        url?: string;
        sessionId?: string;
        saleId?: string;
        message?: string;
        error?: string;
      };

      if (!response.ok) {
        setError(data.error || "Could not start Stripe checkout.");
        setLoadingBidId(null);
        refresh();
        return;
      }

      if (data.mode === "simulate") {
        const finalized = finalizePaidSale(started.sale.id, "simulated");
        if (!finalized.ok) {
          setError(finalized.error);
        } else {
          setMessage(
            `${finalized.message} (Simulated — add Stripe keys for live checkout.)`
          );
          window.dispatchEvent(new Event("harbor-inventory-updated"));
        }
        setLoadingBidId(null);
        refresh();
        return;
      }

      if (data.sessionId) {
        attachStripeSession(started.sale.id, data.sessionId);
      }

      if (data.url) {
        window.location.href = data.url;
        return;
      }

      setError("Stripe did not return a checkout URL.");
    } catch {
      setError("Network error starting Stripe checkout.");
    }

    setLoadingBidId(null);
    refresh();
  }

  function handleReject(bidId: string) {
    setMessage(null);
    setError(null);
    const result = rejectBid(bidId);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setMessage("Bid rejected.");
    refresh();
    window.dispatchEvent(new Event("harbor-inventory-updated"));
  }

  return (
    <div className="space-y-10">
      <section>
        <h2 className="text-lg font-semibold text-[var(--ink)]">
          Incoming bids
        </h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Accept a bid to charge the buyer through Stripe. Harbor takes a{" "}
          {(HARBOR_FEE_RATE * 100).toFixed(0)}% hosting fee; the seller receives
          the rest. Inventory decreases only after payment succeeds.
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

        {pending.length === 0 ? (
          <div className="mt-4 border border-[var(--border)] bg-white p-6">
            <p className="text-sm text-[var(--muted)]">
              No pending bids right now.
            </p>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {pending.map((bid) => {
              const fees = calculateHarborFee(bid.amount);
              return (
                <div
                  key={bid.id}
                  className="border border-[var(--border)] bg-white p-5"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="font-semibold text-[var(--ink)]">
                        <Link
                          href={`/dashboard/seller/lots/${bid.lotId}`}
                          className="hover:text-[var(--accent)] hover:underline"
                        >
                          {bid.lotTitle}
                        </Link>
                      </h3>
                      <p className="mt-1 text-sm text-[var(--muted)]">
                        {bid.buyerName} · {bid.buyerEmail}
                      </p>
                      <p className="mt-2 text-sm text-[var(--ink)]">
                        {bid.quantity.toLocaleString()} units · Buyer pays{" "}
                        {formatUsd(fees.total)}
                      </p>
                      <p className="mt-1 text-xs text-[var(--muted)]">
                        Harbor fee (5%): {formatUsd(fees.harborFee)} · Seller
                        payout: {formatUsd(fees.sellerPayout)}
                      </p>
                      <p className="mt-1 text-xs text-[var(--muted)]">
                        Submitted {new Date(bid.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={loadingBidId === bid.id}
                        onClick={() => void handleAcceptAndCharge(bid.id)}
                        className="rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--accent-dark)] disabled:opacity-50"
                      >
                        {loadingBidId === bid.id
                          ? "Starting Stripe…"
                          : "Accept & charge with Stripe"}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleReject(bid.id)}
                        className="rounded-md border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--ink)] hover:bg-[var(--mist)]"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {awaitingPayment.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-[var(--ink)]">
            Awaiting Stripe payment
          </h2>
          <div className="mt-4 space-y-3">
            {awaitingPayment.map((sale) => (
              <div
                key={sale.id}
                className="border border-[var(--border)] bg-white p-5 text-sm"
              >
                <p className="font-semibold text-[var(--ink)]">{sale.lotTitle}</p>
                <p className="mt-1 text-[var(--muted)]">
                  {sale.buyerName} · {sale.quantity.toLocaleString()} units ·{" "}
                  {formatUsd(sale.amount)}
                </p>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  Harbor {formatUsd(sale.harborFee)} · Seller{" "}
                  {formatUsd(sale.sellerPayout)}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-lg font-semibold text-[var(--ink)]">
          Processed sales
        </h2>
        {sales.filter(
          (s) => s.paymentStatus === "paid" || s.paymentStatus === "simulated"
        ).length === 0 ? (
          <div className="mt-4 border border-[var(--border)] bg-white p-6">
            <p className="text-sm text-[var(--muted)]">
              Paid sales will appear here with Harbor&apos;s 5% fee and seller
              payout.
            </p>
          </div>
        ) : (
          <div className="mt-4 overflow-hidden border border-[var(--border)] bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-[var(--border)] bg-[var(--mist)] text-[var(--muted)]">
                <tr>
                  <th className="px-4 py-3 font-medium">Lot</th>
                  <th className="px-4 py-3 font-medium">Buyer</th>
                  <th className="px-4 py-3 font-medium">Total</th>
                  <th className="px-4 py-3 font-medium">Harbor 5%</th>
                  <th className="hidden px-4 py-3 font-medium sm:table-cell">
                    Seller
                  </th>
                </tr>
              </thead>
              <tbody>
                {sales
                  .filter(
                    (s) =>
                      s.paymentStatus === "paid" ||
                      s.paymentStatus === "simulated"
                  )
                  .map((sale) => (
                    <tr
                      key={sale.id}
                      className="border-b border-[var(--border)] last:border-0"
                    >
                      <td className="px-4 py-3 font-medium text-[var(--ink)]">
                        {sale.lotTitle}
                        <span className="mt-1 block text-xs font-normal text-[var(--muted)]">
                          {sale.quantity.toLocaleString()} units
                          {sale.lotClosed ? " · Lot closed" : ""}
                          {sale.paymentStatus === "simulated"
                            ? " · Simulated"
                            : " · Stripe"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[var(--muted)]">
                        {sale.buyerName}
                      </td>
                      <td className="px-4 py-3 text-[var(--ink)]">
                        {formatUsd(sale.amount)}
                      </td>
                      <td className="px-4 py-3 text-[var(--ink)]">
                        {formatUsd(sale.harborFee ?? sale.amount * 0.05)}
                      </td>
                      <td className="hidden px-4 py-3 text-[var(--muted)] sm:table-cell">
                        {formatUsd(sale.sellerPayout ?? sale.amount * 0.95)}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
