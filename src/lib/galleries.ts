/** Unguessable gallery tokens for private share links. */
export const DEMO_GALLERY = {
  token: "g_9f2c8e1a7b4d6e0f3a5c8d2b1e7f9a4c6d0b8e3f5a1c7d9e2b4f6a8c0d3e5f7",
  title: "Lincoln USD · Device refresh 2026",
  seller: "Lincoln USD",
  location: "Midwest region · Pickup arranged by buyer",
  coverImage:
    "https://images.unsplash.com/photo-1587614382346-4ec70e388b28?auto=format&fit=crop&w=1200&q=80",
  coverAlt: "Chromebooks and classroom devices in a seller inventory",
  lotCount: 4,
  bidDeadline: "Jul 28, 2026",
} as const;

export type GalleryLot = {
  id: string;
  title: string;
  meta: string;
  image: string;
  imageAlt: string;
  quantity: string;
  availableUnits: number;
  condition: string;
  models: string;
  includes: string;
  notes: string;
  bidDeadline: string;
};

export const DEMO_GALLERY_LOTS: GalleryLot[] = [
  {
    id: "chromebooks-grade-6-8",
    title: "Chromebooks · Grade 6–8",
    meta: "240 units · Good",
    image:
      "https://images.unsplash.com/photo-1587614382346-4ec70e388b28?auto=format&fit=crop&w=1600&q=80",
    imageAlt: "Stack of Chromebook laptops ready for recycling",
    quantity: "240 units",
    availableUnits: 240,
    condition: "Good — classroom wear, power-on tested",
    models: "Lenovo 100e Gen 3 · mixed 2021–2023",
    includes: "Devices only (chargers sold separately in another lot)",
    notes:
      "Asset tags still attached. MDM enrollment will be cleared before pickup. Bulk palletized at district warehouse.",
    bidDeadline: "Jul 28, 2026",
  },
  {
    id: "ipads-classroom-cart",
    title: "iPads · Classroom cart",
    meta: "48 units · Fair",
    image:
      "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=1600&q=80",
    imageAlt: "Tablet devices on a table",
    quantity: "48 units",
    availableUnits: 48,
    condition: "Fair — scuffs and case marks, all boot to lock screen",
    models: "iPad 8th / 9th generation · Wi-Fi",
    includes: "48 iPads + 2 charging carts",
    notes:
      "Supervised mode may still be active until wipe confirmation. Carts show normal school use.",
    bidDeadline: "Jul 28, 2026",
  },
  {
    id: "chargers-cases",
    title: "Chargers & cases",
    meta: "Mixed lot",
    image:
      "https://images.unsplash.com/photo-1625948515291-69613efd103f?auto=format&fit=crop&w=1600&q=80",
    imageAlt: "Device chargers and cables",
    quantity: "1 mixed lot (~180 pieces)",
    availableUnits: 180,
    condition: "Mixed — functional where tested",
    models: "USB-C Chromebook chargers · tablet cases",
    includes: "Chargers, cables, and protective cases",
    notes:
      "Sold as-is. Prefer buyer who takes the Chromebook or iPad lots as well.",
    bidDeadline: "Jul 28, 2026",
  },
  {
    id: "carts-peripherals",
    title: "Carts & peripherals",
    meta: "12 carts",
    image:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1600&q=80",
    imageAlt: "Laptop and workstation equipment",
    quantity: "12 charging carts + peripherals",
    availableUnits: 12,
    condition: "Good — working locks and power",
    models: "Bretford / generic 30-bay carts",
    includes: "Carts, mice, keyboards, and spare docks",
    notes: "Heavy items. Buyer responsible for freight from district dock.",
    bidDeadline: "Aug 2, 2026",
  },
];

export function galleryPath(token: string): string {
  return `/g/${token}`;
}

export function galleryLotPath(token: string, lotId: string): string {
  return `/g/${token}/${lotId}`;
}

export function galleryTitleFromToken(token: string): string {
  if (token === DEMO_GALLERY.token) return DEMO_GALLERY.title;
  // Never echo raw tokens in the UI; unknown links stay generic.
  return "Seller Inventory";
}

export function getGalleryLot(lotId: string): GalleryLot | undefined {
  return DEMO_GALLERY_LOTS.find((lot) => lot.id === lotId);
}
