/** Free seller accounts can list this many device lots. */
export const FREE_SELLER_LOT_LIMIT = 5;

export const SELLER_PLAN_STORAGE_KEY = "harbor_seller_plan";

export type SellerPlan = "free" | "pro";

export function readSellerPlan(): SellerPlan {
  if (typeof window === "undefined") return "free";
  try {
    const raw = localStorage.getItem(SELLER_PLAN_STORAGE_KEY);
    return raw === "pro" ? "pro" : "free";
  } catch {
    return "free";
  }
}

export function writeSellerPlan(plan: SellerPlan) {
  localStorage.setItem(SELLER_PLAN_STORAGE_KEY, plan);
}

export type LotQuota = {
  plan: SellerPlan;
  used: number;
  limit: number | null;
  remaining: number | null;
  canAddLot: boolean;
};

/** Quota for user-created lots (demo sample lots do not count). */
export function getLotQuota(userCreatedLotCount: number): LotQuota {
  const plan = readSellerPlan();
  if (plan === "pro") {
    return {
      plan,
      used: userCreatedLotCount,
      limit: null,
      remaining: null,
      canAddLot: true,
    };
  }

  const used = userCreatedLotCount;
  const remaining = Math.max(0, FREE_SELLER_LOT_LIMIT - used);
  return {
    plan: "free",
    used,
    limit: FREE_SELLER_LOT_LIMIT,
    remaining,
    canAddLot: used < FREE_SELLER_LOT_LIMIT,
  };
}

export function lotLimitReachedMessage(limit = FREE_SELLER_LOT_LIMIT): string {
  return `Free accounts can list up to ${limit} device lots. Upgrade to Pro for unlimited lots.`;
}
