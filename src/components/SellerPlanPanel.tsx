"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getLotQuota,
  writeSellerPlan,
  type LotQuota,
  type SellerPlan,
} from "@/lib/seller-plan";
import { countUserCreatedLots } from "@/lib/seller-lots-store";

export default function SellerPlanPanel() {
  const [quota, setQuota] = useState<LotQuota | null>(null);

  function refresh() {
    setQuota(getLotQuota(countUserCreatedLots()));
  }

  useEffect(() => {
    refresh();
  }, []);

  function setPlan(plan: SellerPlan) {
    writeSellerPlan(plan);
    refresh();
    window.dispatchEvent(new Event("harbor-inventory-updated"));
  }

  if (!quota) return null;

  return (
    <div className="mt-8 border border-[var(--border)] bg-white p-6">
      <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
        Seller plan
      </p>
      <p className="mt-1 text-lg font-semibold capitalize text-[var(--ink)]">
        {quota.plan === "pro" ? "Pro" : "Free"}
      </p>
      <p className="mt-2 text-sm text-[var(--muted)]">
        {quota.plan === "pro"
          ? "Unlimited device lots on your Seller Inventory."
          : `Free accounts can list up to ${quota.limit} device lots (${quota.used} used). Upgrade to Pro for unlimited lots.`}
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        {quota.plan === "free" ? (
          <>
            <button
              type="button"
              onClick={() => setPlan("pro")}
              className="rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--accent-dark)]"
            >
              Activate Pro (demo)
            </button>
            <Link
              href="/pricing"
              className="rounded-md border border-[var(--border)] px-4 py-2 text-sm font-semibold text-[var(--ink)] hover:bg-[var(--mist)]"
            >
              View pricing
            </Link>
          </>
        ) : (
          <button
            type="button"
            onClick={() => setPlan("free")}
            className="rounded-md border border-[var(--border)] px-4 py-2 text-sm font-semibold text-[var(--ink)] hover:bg-[var(--mist)]"
          >
            Switch to Free (demo)
          </button>
        )}
      </div>
    </div>
  );
}
