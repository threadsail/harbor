/** Free seller accounts can list this many device lots. */
export const FREE_SELLER_LOT_LIMIT = 5;

/** Budget plan device lot limit. */
export const BUDGET_SELLER_LOT_LIMIT = 15;

export const SELLER_PLAN_STORAGE_KEY = "harbor_seller_plan";

export type SellerPlan = "free" | "budget" | "pro";

export const PLAN_ANNUAL_PRICE: Record<SellerPlan, number> = {
  free: 0,
  budget: 149,
  pro: 249,
};

/** Harbor hosting fee taken from each Stripe payout. */
export const PLAN_FEE_RATE: Record<SellerPlan, number> = {
  free: 0.1,
  budget: 0.05,
  pro: 0.025,
};

export const PLAN_LABEL: Record<SellerPlan, string> = {
  free: "Free",
  budget: "Budget",
  pro: "Pro",
};

export function readSellerPlan(): SellerPlan {
  if (typeof window === "undefined") return "free";
  try {
    const raw = localStorage.getItem(SELLER_PLAN_STORAGE_KEY);
    if (raw === "pro" || raw === "budget") return raw;
    return "free";
  } catch {
    return "free";
  }
}

export function writeSellerPlan(plan: SellerPlan) {
  localStorage.setItem(SELLER_PLAN_STORAGE_KEY, plan);
}

export function getFeeRateForPlan(plan: SellerPlan = readSellerPlan()): number {
  return PLAN_FEE_RATE[plan];
}

export function getLotLimitForPlan(plan: SellerPlan): number | null {
  if (plan === "pro") return null;
  if (plan === "budget") return BUDGET_SELLER_LOT_LIMIT;
  return FREE_SELLER_LOT_LIMIT;
}

export function hasUnlimitedLots(plan: SellerPlan): boolean {
  return plan === "pro";
}

export type LotQuota = {
  plan: SellerPlan;
  used: number;
  limit: number | null;
  remaining: number | null;
  canAddLot: boolean;
  feeRate: number;
};

/** Quota for user-created lots (demo sample lots do not count). */
export function getLotQuota(userCreatedLotCount: number): LotQuota {
  const plan = readSellerPlan();
  const feeRate = getFeeRateForPlan(plan);
  const limit = getLotLimitForPlan(plan);

  if (limit === null) {
    return {
      plan,
      used: userCreatedLotCount,
      limit: null,
      remaining: null,
      canAddLot: true,
      feeRate,
    };
  }

  const used = userCreatedLotCount;
  const remaining = Math.max(0, limit - used);
  return {
    plan,
    used,
    limit,
    remaining,
    canAddLot: used < limit,
    feeRate,
  };
}

export function lotLimitReachedMessage(plan: SellerPlan = readSellerPlan()): string {
  if (plan === "free") {
    return `Free accounts can list up to ${FREE_SELLER_LOT_LIMIT} device lots. Upgrade to Budget or Pro for more lots and a lower hosting fee.`;
  }
  if (plan === "budget") {
    return `Budget accounts can list up to ${BUDGET_SELLER_LOT_LIMIT} device lots. Upgrade to Pro for unlimited lots.`;
  }
  return "You have reached your lot limit.";
}

export function planPriceLabel(plan: SellerPlan): string {
  const price = PLAN_ANNUAL_PRICE[plan];
  if (price === 0) return "$0";
  return `$${price}/year`;
}

export function planLotLimitLabel(plan: SellerPlan): string {
  const limit = getLotLimitForPlan(plan);
  if (limit === null) return "Unlimited device lots";
  return `Up to ${limit} device lots`;
}
