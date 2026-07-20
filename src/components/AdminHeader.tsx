import Link from "next/link";
import { signOut } from "@/app/actions/auth";
import { getAppSession } from "@/utils/auth/session";
import { dashboardPathForRole } from "@/lib/demo-auth";
import HarborLogoMark from "@/components/HarborLogoMark";

export default async function AdminHeader() {
  const session = await getAppSession();
  const dashboardHref = session
    ? dashboardPathForRole(session.role)
    : "/dashboard";
  const roleLabel =
    session?.role === "buyer"
      ? "Buyer admin"
      : session?.role === "seller"
        ? "Seller admin"
        : "Admin";

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
        <div className="flex items-center gap-3">
          <Link href={dashboardHref} className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[var(--accent)] text-white">
              <HarborLogoMark />
            </div>
            <span className="font-display text-xl tracking-tight text-[var(--ink)]">
              Harbor
            </span>
          </Link>
          <span className="hidden h-5 w-px bg-[var(--border)] sm:block" />
          <span className="hidden text-sm font-medium text-[var(--muted)] sm:inline">
            {roleLabel}
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {session && (
            <Link
              href="/dashboard/profile"
              className="rounded-md px-3 py-2 text-sm font-medium text-[var(--muted)] transition-colors hover:bg-[var(--mist)] hover:text-[var(--ink)]"
            >
              Profile
            </Link>
          )}
          <form action={signOut}>
            <button
              type="submit"
              className="rounded-md border border-[var(--border)] bg-white px-3.5 py-2 text-sm font-medium text-[var(--ink)] transition-colors hover:bg-[var(--mist)] sm:px-4"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
