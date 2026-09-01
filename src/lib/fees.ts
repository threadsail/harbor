import { getFeeRateForPlan, PLAN_FEE_RATE } from "@/lib/seller-plan";

/** Default Harbor fee for Budget (5%). Free is 10%, Pro is 2.5%. */
export const HARBOR_FEE_RATE = PLAN_FEE_RATE.budget;

export type FeeBreakdown = {
  /** Total buyer pays (bid amount). */
  total: number;
  /** Harbor hosting fee. */
  harborFee: number;
  /** Remaining amount owed to the seller. */
  sellerPayout: number;
  feeRate: number;
};

/** Split a bid amount into Harbor's hosting fee and seller payout. */
export function calculateHarborFee(
  totalAmount: number,
  feeRate: number = HARBOR_FEE_RATE
): FeeBreakdown {
  const total = Math.round(totalAmount * 100) / 100;
  const harborFee = Math.round(total * feeRate * 100) / 100;
  const sellerPayout = Math.round((total - harborFee) * 100) / 100;
  return {
    total,
    harborFee,
    sellerPayout,
    feeRate,
  };
}

/** Fee rate for the current seller plan (client-side). */
export function calculateHarborFeeForCurrentPlan(totalAmount: number): FeeBreakdown {
  return calculateHarborFee(totalAmount, getFeeRateForPlan());
}

export function formatFeePercent(feeRate: number): string {
  const pct = feeRate * 100;
  return `${Number.isInteger(pct) ? pct.toFixed(0) : pct.toFixed(1)}%`;
}

export function formatUsd(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(amount);
}
