"use client";

import {
  BIDS_STORAGE_KEY,
  DEMO_LOT_OVERRIDES_KEY,
  SALES_STORAGE_KEY,
  applyAcceptedSaleToLot,
  buildSaleFromBid,
  type Bid,
  type DemoLotOverride,
  type Sale,
  type SalePaymentStatus,
} from "@/lib/bids";
import {
  SELLER_LOTS_STORAGE_KEY,
  type SellerLot,
  type SellerLotStatus,
} from "@/lib/seller-lots";
import { DEMO_GALLERY_LOTS } from "@/lib/galleries";
import { getFeeRateForPlan, readSellerPlan } from "@/lib/seller-plan";

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function readBids(): Bid[] {
  const parsed = readJson<Bid[]>(BIDS_STORAGE_KEY, []);
  return Array.isArray(parsed) ? parsed : [];
}

export function writeBids(bids: Bid[]) {
  writeJson(BIDS_STORAGE_KEY, bids);
}

export function readSales(): Sale[] {
  const parsed = readJson<Sale[]>(SALES_STORAGE_KEY, []);
  return Array.isArray(parsed) ? parsed : [];
}

export function writeSales(sales: Sale[]) {
  writeJson(SALES_STORAGE_KEY, sales);
}

export function readSellerLots(): SellerLot[] {
  const parsed = readJson<SellerLot[]>(SELLER_LOTS_STORAGE_KEY, []);
  return Array.isArray(parsed) ? parsed : [];
}

export function writeSellerLots(lots: SellerLot[]) {
  writeJson(SELLER_LOTS_STORAGE_KEY, lots);
}

export function readDemoOverrides(): Record<string, DemoLotOverride> {
  const parsed = readJson<Record<string, DemoLotOverride>>(
    DEMO_LOT_OVERRIDES_KEY,
    {}
  );
  return parsed && typeof parsed === "object" ? parsed : {};
}

export function writeDemoOverrides(overrides: Record<string, DemoLotOverride>) {
  writeJson(DEMO_LOT_OVERRIDES_KEY, overrides);
}

export type InventoryLot = {
  id: string;
  title: string;
  quantity: number;
  status: SellerLotStatus;
  source: "seller" | "demo";
};

export function getInventoryLot(lotId: string): InventoryLot | null {
  const sellerLot = readSellerLots().find((lot) => lot.id === lotId);
  if (sellerLot) {
    return {
      id: sellerLot.id,
      title: sellerLot.title,
      quantity: sellerLot.quantity,
      status: sellerLot.status,
      source: "seller",
    };
  }

  const demo = DEMO_GALLERY_LOTS.find((lot) => lot.id === lotId);
  if (!demo) return null;

  const override = readDemoOverrides()[lotId];
  return {
    id: demo.id,
    title: demo.title,
    quantity: override?.quantity ?? demo.availableUnits,
    status: override?.status ?? "Accepting bids",
    source: "demo",
  };
}

export function getAvailableUnits(lotId: string): number {
  return getInventoryLot(lotId)?.quantity ?? 0;
}

export function saveInventoryLotUpdate(
  lotId: string,
  update: { quantity: number; status: SellerLotStatus }
) {
  const sellerLots = readSellerLots();
  const sellerIndex = sellerLots.findIndex((lot) => lot.id === lotId);
  if (sellerIndex >= 0) {
    const next = [...sellerLots];
    next[sellerIndex] = {
      ...next[sellerIndex],
      quantity: update.quantity,
      status: update.status,
      bids: Math.max(
        0,
        readBids().filter((b) => b.lotId === lotId && b.status === "pending")
          .length
      ),
    };
    writeSellerLots(next);
    return;
  }

  const overrides = readDemoOverrides();
  overrides[lotId] = {
    quantity: update.quantity,
    status: update.status,
  };
  writeDemoOverrides(overrides);
}

export function submitBid(input: {
  lotId: string;
  lotTitle: string;
  buyerName: string;
  buyerEmail: string;
  quantity: number;
  amount: number;
}): { ok: true; bid: Bid } | { ok: false; error: string } {
  const lot = getInventoryLot(input.lotId);
  if (!lot) return { ok: false, error: "Lot not found." };
  if (lot.status === "Closed" || lot.quantity <= 0) {
    return { ok: false, error: "This lot is closed." };
  }
  if (input.quantity < 1 || input.quantity > lot.quantity) {
    return {
      ok: false,
      error: `Quantity must be between 1 and ${lot.quantity.toLocaleString()}.`,
    };
  }
  if (input.amount <= 0) {
    return { ok: false, error: "Enter a valid bid amount." };
  }

  const bid: Bid = {
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `bid_${Date.now()}`,
    lotId: input.lotId,
    lotTitle: input.lotTitle,
    buyerName: input.buyerName,
    buyerEmail: input.buyerEmail,
    quantity: input.quantity,
    amount: input.amount,
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  const bids = [bid, ...readBids()];
  writeBids(bids);

  if (lot.source === "seller") {
    const lots = readSellerLots();
    writeSellerLots(
      lots.map((item) =>
        item.id === lot.id
          ? {
              ...item,
              bids: bids.filter(
                (b) => b.lotId === item.id && b.status === "pending"
              ).length,
              status:
                item.status === "Draft" ? "Accepting bids" : item.status,
            }
          : item
      )
    );
  }

  return { ok: true, bid };
}

/**
 * Seller accepts a bid → create sale awaiting Stripe payment.
 * Inventory is reserved only after payment succeeds.
 */
export function startSaleCheckout(bidId: string):
  | { ok: true; sale: Sale; bid: Bid }
  | { ok: false; error: string } {
  const bids = readBids();
  const bid = bids.find((item) => item.id === bidId);
  if (!bid) return { ok: false, error: "Bid not found." };
  if (bid.status !== "pending") {
    return { ok: false, error: "This bid is no longer pending." };
  }

  const lot = getInventoryLot(bid.lotId);
  if (!lot) return { ok: false, error: "Lot not found." };

  const built = buildSaleFromBid(
    bid,
    {
      id: lot.id,
      title: lot.title,
      quantity: lot.quantity,
      status: lot.status,
    },
    "awaiting_payment",
    getFeeRateForPlan(readSellerPlan())
  );
  if (!built.ok) return { ok: false, error: built.error };

  const updatedBid: Bid = { ...bid, status: "awaiting_payment" };
  writeBids(bids.map((item) => (item.id === bid.id ? updatedBid : item)));
  writeSales([built.sale, ...readSales().filter((s) => s.bidId !== bid.id)]);

  return { ok: true, sale: built.sale, bid: updatedBid };
}

export function attachStripeCheckout(
  saleId: string,
  sessionId: string,
  checkoutUrl: string
) {
  writeSales(
    readSales().map((sale) =>
      sale.id === saleId
        ? { ...sale, stripeSessionId: sessionId, stripeCheckoutUrl: checkoutUrl }
        : sale
    )
  );
}

/** @deprecated Use attachStripeCheckout */
export function attachStripeSession(saleId: string, sessionId: string) {
  attachStripeCheckout(saleId, sessionId, "");
}

export function getSaleById(saleId: string): Sale | undefined {
  return readSales().find((sale) => sale.id === saleId);
}

/**
 * After Stripe payment succeeds (or simulated pay), reduce inventory and close if empty.
 */
export function finalizePaidSale(
  saleId: string,
  paymentStatus: Extract<SalePaymentStatus, "paid" | "simulated">,
  stripeSessionId?: string
): { ok: true; message: string; sale: Sale } | { ok: false; error: string } {
  const sales = readSales();
  const sale = sales.find((item) => item.id === saleId);
  if (!sale) return { ok: false, error: "Sale not found." };
  if (sale.paymentStatus === "paid" || sale.paymentStatus === "simulated") {
    return { ok: true, message: "Sale already paid.", sale };
  }

  const lot = getInventoryLot(sale.lotId);
  if (!lot) return { ok: false, error: "Lot not found." };
  if (sale.quantity > lot.quantity) {
    return {
      ok: false,
      error: `Only ${lot.quantity.toLocaleString()} units remain — cannot complete this sale.`,
    };
  }

  const applied = applyAcceptedSaleToLot(
    {
      id: lot.id,
      title: lot.title,
      quantity: lot.quantity,
      status: lot.status,
    },
    sale.quantity
  );

  const paidAt = new Date().toISOString();
  const completed: Sale = {
    ...sale,
    paymentStatus,
    stripeSessionId: stripeSessionId ?? sale.stripeSessionId,
    remainingQuantity: applied.quantity,
    lotClosed: applied.closed,
    paidAt,
  };

  writeSales(sales.map((item) => (item.id === saleId ? completed : item)));

  const bids = readBids();
  const nextBids = bids.map((item) => {
    if (item.id === sale.bidId) {
      return {
        ...item,
        status: "accepted" as const,
        resolvedAt: paidAt,
      };
    }
    if (
      item.lotId === sale.lotId &&
      (item.status === "pending" || item.status === "awaiting_payment") &&
      item.quantity > applied.quantity
    ) {
      return { ...item, status: "rejected" as const, resolvedAt: paidAt };
    }
    return item;
  });
  writeBids(nextBids);

  saveInventoryLotUpdate(sale.lotId, {
    quantity: applied.quantity,
    status: applied.status,
  });

  if (lot.source === "seller") {
    writeSellerLots(
      readSellerLots().map((item) =>
        item.id === sale.lotId
          ? {
              ...item,
              quantity: applied.quantity,
              status: applied.status,
              bids: nextBids.filter(
                (b) => b.lotId === item.id && b.status === "pending"
              ).length,
            }
          : item
      )
    );
  }

  const message = applied.closed
    ? `Payment received. Sold ${sale.quantity.toLocaleString()} units. Lot is now closed (sold out). Harbor fee $${sale.harborFee.toFixed(2)} · Seller payout $${sale.sellerPayout.toFixed(2)}.`
    : `Payment received. Sold ${sale.quantity.toLocaleString()} units. ${applied.quantity.toLocaleString()} remain. Harbor fee $${sale.harborFee.toFixed(2)} · Seller payout $${sale.sellerPayout.toFixed(2)}.`;

  return { ok: true, message, sale: completed };
}

export function rejectBid(
  bidId: string
): { ok: true } | { ok: false; error: string } {
  const bids = readBids();
  const bid = bids.find((item) => item.id === bidId);
  if (!bid) return { ok: false, error: "Bid not found." };
  if (bid.status !== "pending" && bid.status !== "awaiting_payment") {
    return { ok: false, error: "This bid is no longer pending." };
  }

  const resolvedAt = new Date().toISOString();
  writeBids(
    bids.map((item) =>
      item.id === bidId
        ? { ...item, status: "rejected" as const, resolvedAt }
        : item
    )
  );

  writeSales(
    readSales().map((sale) =>
      sale.bidId === bidId && sale.paymentStatus === "awaiting_payment"
        ? { ...sale, paymentStatus: "failed" as const }
        : sale
    )
  );

  const lot = getInventoryLot(bid.lotId);
  if (lot?.source === "seller") {
    const pending = readBids().filter(
      (b) => b.lotId === bid.lotId && b.status === "pending"
    ).length;
    writeSellerLots(
      readSellerLots().map((item) =>
        item.id === bid.lotId ? { ...item, bids: pending } : item
      )
    );
  }

  return { ok: true };
}

/** @deprecated Use startSaleCheckout + finalizePaidSale */
export function acceptBid(bidId: string) {
  const started = startSaleCheckout(bidId);
  if (!started.ok) return started;
  return finalizePaidSale(started.sale.id, "simulated");
}
