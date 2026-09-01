import type { SellerLot, SellerLotStatus } from "@/lib/seller-lots";
import { calculateHarborFee } from "@/lib/fees";

export type BidStatus =
  | "pending"
  | "accepted"
  | "awaiting_payment"
  | "rejected"
  | "withdrawn";

export type Bid = {
  id: string;
  lotId: string;
  lotTitle: string;
  buyerName: string;
  buyerEmail: string;
  quantity: number;
  amount: number;
  status: BidStatus;
  createdAt: string;
  resolvedAt?: string;
};

export type SalePaymentStatus =
  | "awaiting_payment"
  | "paid"
  | "failed"
  | "simulated";

export type Sale = {
  id: string;
  bidId: string;
  lotId: string;
  lotTitle: string;
  buyerName: string;
  buyerEmail: string;
  quantity: number;
  amount: number;
  harborFee: number;
  sellerPayout: number;
  feeRate: number;
  paymentStatus: SalePaymentStatus;
  stripeSessionId?: string;
  stripeCheckoutUrl?: string;
  remainingQuantity: number;
  lotClosed: boolean;
  createdAt: string;
  paidAt?: string;
};

export const BIDS_STORAGE_KEY = "harbor_bids";
export const SALES_STORAGE_KEY = "harbor_sales";
export const DEMO_LOT_OVERRIDES_KEY = "harbor_demo_lot_overrides";

export type DemoLotOverride = {
  quantity: number;
  status: SellerLotStatus;
};

export function createBidId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `bid_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function createSaleId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `sale_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function parseBidAmount(raw: string): number | null {
  const cleaned = raw.replace(/[$,\s]/g, "");
  const value = Number.parseFloat(cleaned);
  if (!Number.isFinite(value) || value <= 0) return null;
  return Math.round(value * 100) / 100;
}

/** Apply an accepted bid: reduce inventory and close the lot when sold out. */
export function applyAcceptedSaleToLot<
  T extends { quantity: number; status: SellerLotStatus },
>(lot: T, acceptedQuantity: number): T & { closed: boolean } {
  const remaining = Math.max(0, lot.quantity - acceptedQuantity);
  const closed = remaining === 0;
  return {
    ...lot,
    quantity: remaining,
    status: closed
      ? "Closed"
      : lot.status === "Draft"
        ? "Accepting bids"
        : lot.status,
    closed,
  };
}

export type AcceptBidResult =
  | {
      ok: true;
      sale: Sale;
      remainingQuantity: number;
      lotClosed: boolean;
    }
  | {
      ok: false;
      error: string;
    };

/** Validate bid against lot and build a sale record (inventory not yet reduced). */
export function buildSaleFromBid(
  bid: Bid,
  lot: Pick<SellerLot, "id" | "title" | "quantity" | "status">,
  paymentStatus: SalePaymentStatus = "awaiting_payment",
  feeRate?: number
): AcceptBidResult {
  if (bid.status !== "pending" && bid.status !== "awaiting_payment") {
    return { ok: false, error: "This bid is no longer pending." };
  }
  if (lot.status === "Closed" || lot.quantity <= 0) {
    return { ok: false, error: "This lot has no remaining inventory." };
  }
  if (bid.quantity > lot.quantity) {
    return {
      ok: false,
      error: `Only ${lot.quantity.toLocaleString()} units remain on this lot.`,
    };
  }

  const applied = applyAcceptedSaleToLot(lot, bid.quantity);
  const fees = calculateHarborFee(bid.amount, feeRate);
  const sale: Sale = {
    id: createSaleId(),
    bidId: bid.id,
    lotId: lot.id,
    lotTitle: lot.title,
    buyerName: bid.buyerName,
    buyerEmail: bid.buyerEmail,
    quantity: bid.quantity,
    amount: fees.total,
    harborFee: fees.harborFee,
    sellerPayout: fees.sellerPayout,
    feeRate: fees.feeRate,
    paymentStatus,
    remainingQuantity: applied.quantity,
    lotClosed: applied.closed,
    createdAt: new Date().toISOString(),
  };

  return {
    ok: true,
    sale,
    remainingQuantity: applied.quantity,
    lotClosed: applied.closed,
  };
}
