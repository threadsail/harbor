"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { countUserCreatedLots } from "@/lib/seller-lots-store";
import {
  FREE_SELLER_LOT_LIMIT,
  getLotQuota,
  type LotQuota,
} from "@/lib/seller-plan";

export default function SellerLotsHeader() {
  const [quota, setQuota] = useState<LotQuota | null>(null);

  function refresh() {
    setQuota(getLotQuota(countUserCreatedLots()));
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
  }, []);

  const atLimit = quota && !quota.canAddLot;

  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h2 className="text-lg font-semibold text-[var(--ink)]">Your lots</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Click a lot to see details and who is offering.
          {quota?.plan === "free" && quota.limit != null ? (
            <>
              {" "}
              Free plan: {quota.used} / {quota.limit} lots used.
            </>
          ) : quota?.plan === "pro" ? (
            <> Pro plan: unlimited lots.</>
          ) : null}
        </p>
        {atLimit ? (
          <p className="mt-2 text-sm text-[var(--ink)]">
            You&apos;ve reached the {FREE_SELLER_LOT_LIMIT}-lot free limit.{" "}
            <Link
              href="/pricing"
              className="font-semibold text-[var(--accent)] hover:underline"
            >
              Upgrade to Pro
            </Link>{" "}
            for unlimited device lots.
          </p>
        ) : null}
      </div>
      {atLimit ? (
        <Link
          href="/pricing"
          className="rounded-md border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--ink)] hover:bg-[var(--mist)]"
        >
          Upgrade to Pro
        </Link>
      ) : (
        <Link
          href="/dashboard/seller/lots/new"
          className="rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--accent-dark)]"
        >
          Add lot
        </Link>
      )}
    </div>
  );
}
