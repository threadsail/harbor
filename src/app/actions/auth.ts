"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import {
  DEMO_ACCOUNTS,
  DEMO_COOKIE,
  dashboardPathForRole,
  encodeDemoSession,
  type UserRole,
} from "@/lib/demo-auth";
import { galleryTokenFromPath } from "@/lib/buyer-galleries";
import {
  linkGalleryToBuyer,
  persistGalleryLink,
} from "@/utils/auth/link-gallery";

function safeNextPath(next: string | undefined): string | null {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return null;
  return next;
}

export async function signOut() {
  const cookieStore = await cookies();
  cookieStore.delete(DEMO_COOKIE);

  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch {
    // Env missing or Supabase unreachable; still redirect
  }
  redirect("/");
}

export async function demoSignIn(role: UserRole, next?: string) {
  const account = DEMO_ACCOUNTS[role];
  const cookieStore = await cookies();

  cookieStore.set(
    DEMO_COOKIE,
    encodeDemoSession({
      role: account.role,
      email: account.email,
      name: account.name,
      isDemo: true,
    }),
    {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
    }
  );

  const destination = safeNextPath(next) ?? dashboardPathForRole(role);

  if (role === "buyer") {
    const token = galleryTokenFromPath(destination);
    if (token) {
      await persistGalleryLink(token, { updateSupabase: false });
    }
  }

  redirect(destination);
}

export async function linkSharedGalleryAction(token: string) {
  await linkGalleryToBuyer(token);
}
