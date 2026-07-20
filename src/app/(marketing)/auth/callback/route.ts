import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import {
  dashboardPathForRole,
  roleFromIntent,
} from "@/lib/demo-auth";
import { galleryTokenFromPath } from "@/lib/buyer-galleries";
import { persistGalleryLink } from "@/utils/auth/link-gallery";

function safePath(value: string | null, fallback: string) {
  if (value && value.startsWith("/") && !value.startsWith("//")) {
    return value;
  }
  return fallback;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const intent = searchParams.get("intent");
  const rawNext = searchParams.get("next");

  if (code) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) {
        return NextResponse.redirect(
          new URL("/auth?error=callback", origin)
        );
      }

      const roleFromQuery = roleFromIntent(intent);
      if (roleFromQuery) {
        await supabase.auth.updateUser({
          data: { intent: intent === "buy" ? "buy" : "sell" },
        });
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();
      const meta = user?.user_metadata ?? {};
      const role =
        roleFromQuery ??
        roleFromIntent(meta.intent) ??
        roleFromIntent(meta.role) ??
        "seller";

      const defaultPath = dashboardPathForRole(role);
      const next = safePath(rawNext, defaultPath);
      const destination =
        next === "/dashboard" || next === "/auth" ? defaultPath : next;

      if (role === "buyer") {
        const token = galleryTokenFromPath(destination);
        if (token) {
          await persistGalleryLink(token);
        }
      }

      return NextResponse.redirect(new URL(destination, origin));
    } catch {
      return NextResponse.redirect(new URL("/auth?error=callback", origin));
    }
  }

  return NextResponse.redirect(new URL("/auth?error=callback", origin));
}
