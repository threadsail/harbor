import Link from "next/link";
import { redirect } from "next/navigation";
import { getAppSession } from "@/utils/auth/session";
import { dashboardPathForRole } from "@/lib/demo-auth";
import SellerPlanPanel from "@/components/SellerPlanPanel";

export default async function ProfilePage() {
  const session = await getAppSession();
  if (!session) redirect("/auth");

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <Link
        href={dashboardPathForRole(session.role)}
        className="text-sm font-semibold text-[var(--accent)] hover:underline"
      >
        ← Back to {session.role} admin
      </Link>
      <h1 className="font-display mt-4 text-3xl tracking-tight text-[var(--ink)]">
        Profile
      </h1>
      <p className="mt-2 text-[var(--muted)]">
        Account details for your {session.role} workspace.
      </p>
      <div className="mt-8 space-y-4 border border-[var(--border)] bg-white p-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
            Organization
          </p>
          <p className="mt-1 text-[var(--ink)]">{session.name}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
            Email
          </p>
          <p className="mt-1 text-[var(--ink)]">{session.email}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
            Role
          </p>
          <p className="mt-1 capitalize text-[var(--ink)]">{session.role}</p>
        </div>
        {session.isDemo && (
          <p className="rounded-md bg-[var(--accent-soft)] px-3 py-2 text-sm text-[var(--muted)]">
            You are using a demo test login. Sign out to switch between seller
            and buyer admin accounts.
          </p>
        )}
      </div>
      {session.role === "seller" ? <SellerPlanPanel /> : null}
    </div>
  );
}
