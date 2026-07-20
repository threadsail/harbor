import Link from "next/link";
import { redirect } from "next/navigation";
import { getAppSession } from "@/utils/auth/session";
import CopyGalleryLink from "@/components/CopyGalleryLink";
import SellerLotsHeader from "@/components/SellerLotsHeader";
import SellerLotsTable from "@/components/SellerLotsTable";
import SellerBidsPanel from "@/components/SellerBidsPanel";
import { DEMO_GALLERY, galleryPath } from "@/lib/galleries";

const galleryHref = galleryPath(DEMO_GALLERY.token);

export default async function SellerAdminPage() {
  const session = await getAppSession();
  if (!session) redirect("/auth?intent=sell");
  if (session.role !== "seller") redirect("/dashboard/buyer");

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
          Seller admin
        </p>
        <h1 className="font-display mt-2 text-3xl tracking-tight text-[var(--ink)] sm:text-4xl">
          {session.name}
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          {session.email}
          {session.isDemo ? " · Demo account" : ""}
        </p>
      </div>

      <section className="mt-10">
        <SellerLotsHeader />
        <SellerLotsTable />
      </section>

      <div className="mt-10">
        <SellerBidsPanel />
      </div>

      <section className="mt-10 border border-[var(--border)] bg-white p-6">
        <h2 className="text-lg font-semibold text-[var(--ink)]">
          Share Seller Inventory link
        </h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Send this private URL to recycling vendors. The token is unguessable
          and the inventory is not listed on the public site.
        </p>
        <CopyGalleryLink path={galleryHref} />
        <Link
          href={galleryHref}
          className="mt-4 inline-flex text-sm font-semibold text-[var(--accent)] hover:underline"
        >
          Open Seller Inventory preview →
        </Link>
      </section>
    </div>
  );
}
