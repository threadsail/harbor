import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import {
  DEMO_COOKIE,
  decodeDemoSession,
  roleFromIntent,
  type UserRole,
} from "@/lib/demo-auth";

export type AppSession = {
  role: UserRole;
  email: string;
  name: string;
  isDemo: boolean;
};

export async function getAppSession(): Promise<AppSession | null> {
  const cookieStore = await cookies();
  const demo = decodeDemoSession(cookieStore.get(DEMO_COOKIE)?.value);
  if (demo) {
    return {
      role: demo.role,
      email: demo.email,
      name: demo.name,
      isDemo: true,
    };
  }

  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    const user = data?.user;
    if (!user) return null;

    const meta = user.user_metadata ?? {};
    const role =
      roleFromIntent(meta.intent) ??
      roleFromIntent(meta.role) ??
      "seller";

    const name =
      (typeof meta.full_name === "string" && meta.full_name) ||
      (typeof meta.name === "string" && meta.name) ||
      (typeof meta.username === "string" && meta.username) ||
      user.email?.split("@")[0] ||
      "Account";

    return {
      role,
      email: user.email ?? "",
      name,
      isDemo: false,
    };
  } catch {
    return null;
  }
}
