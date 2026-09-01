"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import type { Bid, Sale } from "@/lib/bids";
import {
  getSellerAdminLot,
} from "@/lib/seller-lots-store";
import type { SellerLot } from "@/lib/seller-lots";
import {
  acceptOfferAndRequestPayment,
  acceptOfferSuccessMessage,
} from "@/lib/accept-offer-client";
import {
  readBids,
  readSales,
  rejectBid,
} from "@/lib/bids-store";
import { calculateHarborFeeForCurrentPlan, formatFeePercent, formatUsd } from "@/lib/fees";
import { getFeeRateForPlan, readSellerPlan } from "@/lib/seller-plan";

function statusLabel(status: Bid["status"]): string {
  switch (status) {
    case "pending":
      return "Pending";
    case "awaiting_payment":
      return "Awaiting payment";
    case "accepted":
      return "Accepted";
    case "rejected":
      return "Rejected";
    case "withdrawn":
      return "Withdrawn";
    default:
      return status;
  }
}

export default function SellerLotDetail() {
  const params = useParams<{ lotId: string }>();
  const lotId = params.lotId;

  const [lot, setLot] = useState<SellerLot | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingBidId, setLoadingBidId] = useState<string | null>(null);

  function refresh() {
    setLot(getSellerAdminLot(lotId));
    setBids(readBids().filter((bid) => bid.lotId === lotId));
    setSales(readSales().filter((sale) => sale.lotId === lotId));
    setReady(true);
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
  }, [lotId]);

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

  if (!ready) {
    return (
      <p className="mt-8 text-sm text-[var(--muted)]">Loading lot…</p>
    );
  }

  if (!lot) {
    return (
      <div className="mt-8 border border-[var(--border)] bg-white p-6">
        <p className="text-[var(--ink)]">Lot not found.</p>
        <Link
          href="/dashboard/seller"
          className="mt-4 inline-flex text-sm font-semibold text-[var(--accent)] hover:underline"
        >
          ← Back to seller admin
        </Link>
      </div>
    );
  }

  const pending = bids.filter((bid) => bid.status === "pending");
  const otherOffers = bids.filter((bid) => bid.status !== "pending");
  const details = [
    { label: "Quantity", value: `${lot.quantity.toLocaleString()} units` },
    { label: "Condition", value: lot.condition },
    { label: "Models", value: lot.models },
    { label: "Includes", value: lot.includes },
    { label: "Bid deadline", value: lot.bidDeadline },
    { label: "Status", value: lot.status },
  ];

  return (
    <div className="mt-8 space-y-10">
      <section>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl tracking-tight text-[var(--ink)] sm:text-4xl">
              {lot.title}
            </h1>
            <p className="mt-2 text-sm text-[var(--muted)]">
              {lot.bids} pending offer{lot.bids === 1 ? "" : "s"} · {lot.status}
            </p>
          </div>
        </div>

        {lot.images.length > 0 && (
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {lot.images.map((src, index) => (
              <div
                key={`${src}-${index}`}
                className="relative aspect-[16/10] overflow-hidden bg-[var(--mist)]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </div>
            ))}
          </div>
        )}

        {lot.description ? (
          <p className="mt-6 text-[var(--muted)]">{lot.description}</p>
        ) : null}

        <dl className="mt-8 grid gap-4 sm:grid-cols-2">
          {details.map((item) => (
            <div
              key={item.label}
              className="border-b border-[var(--border)] pb-4"
            >
              <dt className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                {item.label}
              </dt>
              <dd className="mt-1 text-sm text-[var(--ink)]">{item.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-[var(--ink)]">
          Offers on this lot
        </h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          See who is bidding. Accept to notify the buyer to pay via Stripe —
          Harbor&apos;s hosting fee is {formatFeePercent(getFeeRateForPlan(readSellerPlan()))}{" "}
          on your plan; the seller receives the rest.
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

        {bids.length === 0 ? (
          <div className="mt-4 border border-[var(--border)] bg-white p-6">
            <p className="text-sm text-[var(--muted)]">
              No offers yet. Share your Seller Inventory link with vendors.
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
                      <p className="font-semibold text-[var(--ink)]">
                        {bid.buyerName}
                      </p>
                      <p className="mt-1 text-sm text-[var(--muted)]">
                        {bid.buyerEmail}
                      </p>
                      <p className="mt-2 text-sm text-[var(--ink)]">
                        {bid.quantity.toLocaleString()} units ·{" "}
                        {formatUsd(fees.total)}
                      </p>
                      <p className="mt-1 text-xs text-[var(--muted)]">
                        Harbor {formatUsd(fees.harborFee)} · Seller payout{" "}
                        {formatUsd(fees.sellerPayout)}
                      </p>
                      <p className="mt-1 text-xs text-[var(--muted)]">
                        Pending · Submitted{" "}
                        {new Date(bid.createdAt).toLocaleString()}
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

            {otherOffers.map((bid) => {
              const fees = calculateHarborFeeForCurrentPlan(bid.amount);
              const relatedSale = sales.find((sale) => sale.bidId === bid.id);
              return (
                <div
                  key={bid.id}
                  className="border border-[var(--border)] bg-[var(--mist)]/40 p-5"
                >
                  <p className="font-semibold text-[var(--ink)]">
                    {bid.buyerName}
                  </p>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    {bid.buyerEmail}
                  </p>
                  <p className="mt-2 text-sm text-[var(--ink)]">
                    {bid.quantity.toLocaleString()} units ·{" "}
                    {formatUsd(fees.total)}
                  </p>
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    {statusLabel(bid.status)}
                    {bid.resolvedAt
                      ? ` · ${new Date(bid.resolvedAt).toLocaleString()}`
                      : ` · Submitted ${new Date(bid.createdAt).toLocaleString()}`}
                    {relatedSale
                      ? ` · Harbor ${formatUsd(relatedSale.harborFee)} · Seller ${formatUsd(relatedSale.sellerPayout)}`
                      : ""}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
