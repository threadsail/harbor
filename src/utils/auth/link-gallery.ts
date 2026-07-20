import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import {
  LINKED_GALLERIES_COOKIE,
  decodeLinkedGalleryTokens,
  encodeLinkedGalleryTokens,
  linkedGallerySummaries,
  type LinkedGallery,
} from "@/lib/buyer-galleries";
import { getAppSession } from "@/utils/auth/session";

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 365,
  };
}

async function readCookieTokens(): Promise<string[]> {
  const cookieStore = await cookies();
  return decodeLinkedGalleryTokens(
    cookieStore.get(LINKED_GALLERIES_COOKIE)?.value
  );
}

async function writeCookieTokens(tokens: string[]) {
  const cookieStore = await cookies();
  cookieStore.set(
    LINKED_GALLERIES_COOKIE,
    encodeLinkedGalleryTokens(tokens),
    cookieOptions()
  );
}

async function readSupabaseTokens(): Promise<string[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    const linked = data.user?.user_metadata?.linked_galleries;
    if (!Array.isArray(linked)) return [];
    return linked.filter((item): item is string => typeof item === "string");
  } catch {
    return [];
  }
}

async function writeSupabaseTokens(tokens: string[]) {
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    if (!data.user) return;
    await supabase.auth.updateUser({
      data: { linked_galleries: [...new Set(tokens)] },
    });
  } catch {
    // Demo / unreachable Supabase — cookie link still applies
  }
}

/** Persist a shared seller inventory token (cookie + Supabase metadata when available). */
export async function persistGalleryLink(
  token: string,
  options?: { updateSupabase?: boolean }
): Promise<void> {
  if (!token) return;

  const cookieTokens = await readCookieTokens();
  let supabaseTokens: string[] = [];
  if (options?.updateSupabase !== false) {
    supabaseTokens = await readSupabaseTokens();
  }
  const merged = [...new Set([...cookieTokens, ...supabaseTokens, token])];

  await writeCookieTokens(merged);
  if (options?.updateSupabase !== false) {
    await writeSupabaseTokens(merged);
  }
}

/** Link inventory to the current buyer session only. */
export async function linkGalleryToBuyer(token: string): Promise<void> {
  if (!token) return;

  const session = await getAppSession();
  if (!session || session.role !== "buyer") return;

  await persistGalleryLink(token, { updateSupabase: !session.isDemo });
}

export async function getLinkedGalleriesForBuyer(): Promise<LinkedGallery[]> {
  const session = await getAppSession();
  if (!session || session.role !== "buyer") return [];

  const cookieTokens = await readCookieTokens();
  const supabaseTokens = session.isDemo ? [] : await readSupabaseTokens();
  const tokens = [...new Set([...cookieTokens, ...supabaseTokens])];

  return linkedGallerySummaries(tokens);
}
