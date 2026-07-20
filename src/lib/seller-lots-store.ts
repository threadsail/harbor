"use client";

import {
  SELLER_LOTS_STORAGE_KEY,
  type SellerLot,
} from "@/lib/seller-lots";
import { DEMO_GALLERY_LOTS } from "@/lib/galleries";
import { readBids, readDemoOverrides } from "@/lib/bids-store";

/** Demo lots shown in seller admin (aligned with public gallery demo IDs). */
export const SAMPLE_SELLER_LOTS: SellerLot[] = DEMO_GALLERY_LOTS.map((lot) => ({
  id: lot.id,
  title: lot.title,
  description: lot.notes,
  quantity: lot.availableUnits,
  condition: lot.condition,
  models: lot.models,
  includes: lot.includes,
  bidDeadline: lot.bidDeadline,
  status: "Accepting bids" as const,
  bids: 0,
  images: [lot.image],
  createdAt: "2026-07-01T00:00:00.000Z",
}));

function readSavedLots(): SellerLot[] {
  try {
    const raw = localStorage.getItem(SELLER_LOTS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SellerLot[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function buildSellerAdminLots(): SellerLot[] {
  const overrides = readDemoOverrides();
  const pendingByLot = readBids().reduce<Record<string, number>>((acc, bid) => {
    if (bid.status === "pending") {
      acc[bid.lotId] = (acc[bid.lotId] ?? 0) + 1;
    }
    return acc;
  }, {});

  const samples = SAMPLE_SELLER_LOTS.map((lot) => {
    const override = overrides[lot.id];
    return {
      ...lot,
      quantity: override?.quantity ?? lot.quantity,
      status: override?.status ?? lot.status,
      bids: pendingByLot[lot.id] ?? 0,
    };
  });

  const saved = readSavedLots().map((lot) => ({
    ...lot,
    bids: pendingByLot[lot.id] ?? lot.bids,
  }));

  return [...saved, ...samples];
}

export function getSellerAdminLot(lotId: string): SellerLot | null {
  return buildSellerAdminLots().find((lot) => lot.id === lotId) ?? null;
}

/** Lots the seller created (excludes demo sample inventory). */
export function countUserCreatedLots(): number {
  return readSavedLots().length;
}

export function listUserCreatedLots(): SellerLot[] {
  return readSavedLots();
}
