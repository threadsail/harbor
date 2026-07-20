export type SellerLotStatus = "Draft" | "Accepting bids" | "Closed";

export type SellerLot = {
  id: string;
  title: string;
  description: string;
  quantity: number;
  condition: string;
  models: string;
  includes: string;
  bidDeadline: string;
  status: SellerLotStatus;
  bids: number;
  images: string[];
  createdAt: string;
};

export const SELLER_LOTS_STORAGE_KEY = "harbor_seller_lots";

export function createLotId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `lot_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}
