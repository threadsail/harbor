import Link from "next/link";
import { signOut } from "@/app/actions/auth";
import { getAppSession } from "@/utils/auth/session";
import { dashboardPathForRole } from "@/lib/demo-auth";

export default async function AuthHeader() {
  const session = await getAppSession();

  if (session) {
    return (
      <div className="flex items-center gap-2 sm:gap-3">
        <Link
          href={dashboardPathForRole(session.role)}
          className="rounded-md bg-[var(--accent)] px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[var(--accent-dark)] sm:px-4"
        >
          {session.role === "seller" ? "Seller admin" : "Buyer admin"}
        </Link>
        <form action={signOut}>
          <button
            type="submit"
            className="rounded-md border border-[var(--border)] bg-white px-3.5 py-2 text-sm font-medium text-[var(--ink)] transition-colors hover:bg-[var(--mist)] sm:px-4"
          >
            Sign out
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/auth"
        className="hidden rounded-md px-3 py-2 text-sm font-medium text-[var(--muted)] transition-colors hover:text-[var(--ink)] sm:inline-flex"
      >
        Sign in
      </Link>
      <Link
        href="/auth?mode=signup"
        className="rounded-md bg-[var(--accent)] px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[var(--accent-dark)] sm:px-4"
      >
        Get started
      </Link>
    </div>
  );
}
