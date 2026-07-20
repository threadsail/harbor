/** Harbor platform fee for hosting sales. */
export const HARBOR_FEE_RATE = 0.05;

export type FeeBreakdown = {
  /** Total buyer pays (bid amount). */
  total: number;
  /** 5% to Harbor for hosting. */
  harborFee: number;
  /** Remaining amount owed to the seller. */
  sellerPayout: number;
  feeRate: number;
};

/** Split a bid amount into Harbor's 5% hosting fee and seller payout. */
export function calculateHarborFee(totalAmount: number): FeeBreakdown {
  const total = Math.round(totalAmount * 100) / 100;
  const harborFee = Math.round(total * HARBOR_FEE_RATE * 100) / 100;
  const sellerPayout = Math.round((total - harborFee) * 100) / 100;
  return {
    total,
    harborFee,
    sellerPayout,
    feeRate: HARBOR_FEE_RATE,
  };
}

export function formatUsd(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(amount);
}
