"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getLotQuota,
  PLAN_ANNUAL_PRICE,
  PLAN_FEE_RATE,
  PLAN_LABEL,
  writeSellerPlan,
  type LotQuota,
  type SellerPlan,
} from "@/lib/seller-plan";
import { countUserCreatedLots } from "@/lib/seller-lots-store";
import { formatFeePercent } from "@/lib/fees";

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

  const planDescription =
    quota.plan === "free"
      ? `Free accounts can list up to ${quota.limit} device lots (${quota.used} used). Hosting fee: ${formatFeePercent(PLAN_FEE_RATE.free)} per sale.`
      : quota.limit != null
        ? `${PLAN_LABEL[quota.plan]} plan: up to ${quota.limit} device lots (${quota.used} used). Hosting fee: ${formatFeePercent(quota.feeRate)} per sale.`
        : `${PLAN_LABEL[quota.plan]} plan: unlimited device lots. Hosting fee: ${formatFeePercent(quota.feeRate)} per sale.`;

  return (
    <div className="mt-8 border border-[var(--border)] bg-white p-6">
      <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
        Seller plan
      </p>
      <p className="mt-1 text-lg font-semibold text-[var(--ink)]">
        {PLAN_LABEL[quota.plan]}
        {quota.plan !== "free" ? (
          <span className="ml-2 text-sm font-normal text-[var(--muted)]">
            ${PLAN_ANNUAL_PRICE[quota.plan]}/year
          </span>
        ) : null}
      </p>
      <p className="mt-2 text-sm text-[var(--muted)]">{planDescription}</p>
      <div className="mt-4 flex flex-wrap gap-3">
        {quota.plan !== "budget" ? (
          <button
            type="button"
            onClick={() => setPlan("budget")}
            className="rounded-md border border-[var(--border)] px-4 py-2 text-sm font-semibold text-[var(--ink)] hover:bg-[var(--mist)]"
          >
            Activate Budget (demo)
          </button>
        ) : null}
        {quota.plan !== "pro" ? (
          <button
            type="button"
            onClick={() => setPlan("pro")}
            className="rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--accent-dark)]"
          >
            Activate Pro (demo)
          </button>
        ) : null}
        {quota.plan !== "free" ? (
          <button
            type="button"
            onClick={() => setPlan("free")}
            className="rounded-md border border-[var(--border)] px-4 py-2 text-sm font-semibold text-[var(--ink)] hover:bg-[var(--mist)]"
          >
            Switch to Free (demo)
          </button>
        ) : null}
        <Link
          href="/pricing"
          className="rounded-md border border-[var(--border)] px-4 py-2 text-sm font-semibold text-[var(--ink)] hover:bg-[var(--mist)]"
        >
          View pricing
        </Link>
      </div>
    </div>
  );
}
