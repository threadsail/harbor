export type UserRole = "seller" | "buyer";

export function roleFromIntent(intent: unknown): UserRole | null {
  if (intent === "sell" || intent === "seller") return "seller";
  if (intent === "buy" || intent === "buyer") return "buyer";
  return null;
}

export function intentFromRole(role: UserRole): "sell" | "buy" {
  return role === "seller" ? "sell" : "buy";
}

export const DEMO_ACCOUNTS = {
  seller: {
    email: "seller@harbor.test",
    password: "harbor-seller-demo",
    name: "Lincoln USD (Demo Seller)",
    role: "seller" as const,
  },
  buyer: {
    email: "buyer@harbor.test",
    password: "harbor-buyer-demo",
    name: "Pacific Recycle Co. (Demo Buyer)",
    role: "buyer" as const,
  },
} as const;

export const DEMO_COOKIE = "harbor_demo_session";

export type DemoSession = {
  role: UserRole;
  email: string;
  name: string;
  isDemo: true;
};

export function encodeDemoSession(session: DemoSession): string {
  return Buffer.from(JSON.stringify(session), "utf8").toString("base64url");
}

export function decodeDemoSession(value: string | undefined): DemoSession | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(
      Buffer.from(value, "base64url").toString("utf8")
    ) as DemoSession;
    if (
      parsed?.isDemo === true &&
      (parsed.role === "seller" || parsed.role === "buyer") &&
      typeof parsed.email === "string" &&
      typeof parsed.name === "string"
    ) {
      return parsed;
    }
  } catch {
    // ignore bad cookie
  }
  return null;
}

export function dashboardPathForRole(role: UserRole): string {
  return role === "seller" ? "/dashboard/seller" : "/dashboard/buyer";
}
