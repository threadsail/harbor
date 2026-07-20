import {
  DEMO_GALLERY,
  DEMO_GALLERY_LOTS,
  galleryTitleFromToken,
} from "@/lib/galleries";

export const LINKED_GALLERIES_COOKIE = "harbor_linked_galleries";

export type LinkedGallery = {
  token: string;
  title: string;
  seller: string;
  linkedAt: string;
  image: string;
  imageAlt: string;
  lotCount: number;
  bidDeadline: string;
};

export function galleryTokenFromPath(path: string): string | null {
  const match = path.match(/^\/g\/([^/?#]+)/);
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

export function buyerInviteAuthPath(nextPath: string): string {
  const params = new URLSearchParams({
    mode: "signup",
    intent: "buy",
    invite: "1",
    next: nextPath,
  });
  return `/auth?${params.toString()}`;
}

export function decodeLinkedGalleryTokens(
  value: string | undefined
): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(
      Buffer.from(value, "base64url").toString("utf8")
    ) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is string => typeof item === "string");
  } catch {
    return [];
  }
}

export function encodeLinkedGalleryTokens(tokens: string[]): string {
  const unique = [...new Set(tokens)];
  return Buffer.from(JSON.stringify(unique), "utf8").toString("base64url");
}

export function linkedGallerySummaries(tokens: string[]): LinkedGallery[] {
  return tokens.map((token) => {
    if (token === DEMO_GALLERY.token) {
      return {
        token,
        title: DEMO_GALLERY.title,
        seller: DEMO_GALLERY.seller,
        linkedAt: new Date().toISOString(),
        image: DEMO_GALLERY.coverImage,
        imageAlt: DEMO_GALLERY.coverAlt,
        lotCount: DEMO_GALLERY.lotCount,
        bidDeadline: DEMO_GALLERY.bidDeadline,
      };
    }

    const fallbackImage =
      DEMO_GALLERY_LOTS[0]?.image ??
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80";

    return {
      token,
      title: galleryTitleFromToken(token),
      seller: "Private seller",
      linkedAt: new Date().toISOString(),
      image: fallbackImage,
      imageAlt: "Seller inventory devices",
      lotCount: DEMO_GALLERY_LOTS.length,
      bidDeadline: "TBD",
    };
  });
}
