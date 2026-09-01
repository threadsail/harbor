import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getAppSession } from "@/utils/auth/session";
import BuyerPaymentsPanel from "@/components/BuyerPaymentsPanel";
import { getLinkedGalleriesForBuyer } from "@/utils/auth/link-gallery";
import { galleryPath } from "@/lib/galleries";

export default async function BuyerAdminPage() {
  const session = await getAppSession();
  if (!session) redirect("/auth?intent=buy");
  if (session.role !== "buyer") redirect("/dashboard/seller");

  const linked = await getLinkedGalleriesForBuyer();

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
          Buyer admin
        </p>
        <h1 className="font-display mt-2 text-3xl tracking-tight text-[var(--ink)] sm:text-4xl">
          {session.name}
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          {session.email}
          {session.isDemo ? " · Demo account" : ""}
        </p>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {[
          { label: "Linked inventories", value: String(linked.length) },
          { label: "Active bids", value: "0" },
          { label: "Won this quarter", value: "0" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="border border-[var(--border)] bg-white p-5"
          >
            <p className="text-sm text-[var(--muted)]">{stat.label}</p>
            <p className="font-display mt-2 text-3xl text-[var(--ink)]">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-10">
        <BuyerPaymentsPanel buyerEmail={session.email} />
      </div>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-[var(--ink)]">
          Seller inventories linked to your account
        </h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Click an inventory to review lots. Open a lot to place a bid with
          quantity and amount.
        </p>

        {linked.length === 0 ? (
          <div className="mt-4 border border-[var(--border)] bg-white p-6">
            <p className="text-sm text-[var(--muted)]">
              No inventories linked yet. Open a shared Seller Inventory URL to
              connect it to this account.
            </p>
          </div>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {linked.map((item) => (
              <Link
                key={item.token}
                href={galleryPath(item.token)}
                className="group border border-[var(--border)] bg-white p-4 transition hover:border-[var(--accent)]"
              >
                <div className="relative aspect-video overflow-hidden bg-[var(--mist)]">
                  <Image
                    src={item.image}
                    alt={item.imageAlt}
                    fill
                    className="object-cover transition duration-300 group-hover:scale-[1.02]"
                    sizes="(max-width: 640px) 100vw, 50vw"
                  />
                </div>
                <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                  {item.seller}
                </p>
                <h3 className="mt-1 font-semibold text-[var(--ink)] group-hover:text-[var(--accent)]">
                  {item.title}
                </h3>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  {item.lotCount} lots · Bids close {item.bidDeadline}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="mt-10 border border-[var(--border)] bg-[var(--accent-soft)] p-6">
        <h2 className="text-lg font-semibold text-[var(--ink)]">
          Have a new inventory link?
        </h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Paste the seller&apos;s Harbor URL while signed in. Harbor will attach
          that Seller Inventory to your buyer account automatically.
        </p>
      </section>
    </div>
  );
}
