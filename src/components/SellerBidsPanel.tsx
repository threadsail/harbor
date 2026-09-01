"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Bid, Sale } from "@/lib/bids";
import {
  acceptOfferAndRequestPayment,
  acceptOfferSuccessMessage,
} from "@/lib/accept-offer-client";
import { readBids, readSales, rejectBid } from "@/lib/bids-store";
import { calculateHarborFeeForCurrentPlan, formatFeePercent, formatUsd } from "@/lib/fees";
import { getFeeRateForPlan, readSellerPlan } from "@/lib/seller-plan";

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
    const onUpdate = () => refresh();
    window.addEventListener("harbor-inventory-updated", onUpdate);
    return () => window.removeEventListener("harbor-inventory-updated", onUpdate);
  }, []);

  const pending = bids.filter((bid) => bid.status === "pending");
  const awaitingPayment = sales.filter(
    (sale) => sale.paymentStatus === "awaiting_payment"
  );

  async function handleAcceptOffer(bidId: string) {
    setMessage(null);
    setError(null);
    setLoadingBidId(bidId);

    const result = await acceptOfferAndRequestPayment(bidId);
    if (!result.ok) {
      setError(result.error);
    } else {
      setMessage(acceptOfferSuccessMessage(result));
      window.dispatchEvent(new Event("harbor-inventory-updated"));
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
          Accept an offer to notify the buyer to pay via Stripe. Harbor&apos;s
          hosting fee is {formatFeePercent(getFeeRateForPlan(readSellerPlan()))}{" "}
          on your plan; the seller receives the rest. Inventory decreases only
          after the buyer pays.
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
              const fees = calculateHarborFeeForCurrentPlan(bid.amount);
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
                        Harbor fee ({formatFeePercent(fees.feeRate)}):{" "}
                        {formatUsd(fees.harborFee)} · Seller payout:{" "}
                        {formatUsd(fees.sellerPayout)}
                      </p>
                      <p className="mt-1 text-xs text-[var(--muted)]">
                        Submitted {new Date(bid.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={loadingBidId === bid.id}
                        onClick={() => void handleAcceptOffer(bid.id)}
                        className="rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--accent-dark)] disabled:opacity-50"
                      >
                        {loadingBidId === bid.id
                          ? "Accepting…"
                          : "Accept offer"}
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
            Awaiting buyer payment
          </h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            The buyer pays from their buyer admin. Inventory updates when Stripe
            confirms payment.
          </p>
          <div className="mt-4 space-y-3">
            {awaitingPayment.map((sale) => (
              <div
                key={sale.id}
                className="border border-[var(--border)] bg-white p-5 text-sm"
              >
                <p className="font-semibold text-[var(--ink)]">{sale.lotTitle}</p>
                <p className="mt-1 text-[var(--muted)]">
                  {sale.buyerName} · {sale.buyerEmail} ·{" "}
                  {sale.quantity.toLocaleString()} units ·{" "}
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
              Paid sales will appear here with Harbor&apos;s hosting fee and
              seller payout.
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
                  <th className="px-4 py-3 font-medium">Harbor fee</th>
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
                        {formatUsd(sale.harborFee)}
                        <span className="mt-1 block text-xs font-normal text-[var(--muted)]">
                          {formatFeePercent(sale.feeRate)}
                        </span>
                      </td>
                      <td className="hidden px-4 py-3 text-[var(--muted)] sm:table-cell">
                        {formatUsd(sale.sellerPayout)}
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
