import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getAppSession } from "@/utils/auth/session";
import { buyerInviteAuthPath } from "@/lib/buyer-galleries";
import LinkGalleryOnVisit from "@/components/LinkGalleryOnVisit";
import PlaceBidForm from "@/components/PlaceBidForm";
import {
  DEMO_GALLERY,
  galleryLotPath,
  galleryPath,
  galleryTitleFromToken,
  getGalleryLot,
} from "@/lib/galleries";

type LotDetailPageProps = {
  params: Promise<{ slug: string; lotId: string }>;
};

export async function generateMetadata({ params }: LotDetailPageProps) {
  const { lotId } = await params;
  const lot = getGalleryLot(lotId);
  return {
    title: lot ? `${lot.title} | Harbor` : "Lot | Harbor",
    description: "Private lot details. Sign in required.",
    robots: { index: false, follow: false },
  };
}

export default async function LotDetailPage({ params }: LotDetailPageProps) {
  const { slug, lotId } = await params;
  const session = await getAppSession();
  const lotPath = galleryLotPath(slug, lotId);

  if (!session) {
    redirect(buyerInviteAuthPath(lotPath));
  }

  const lot = getGalleryLot(lotId);
  if (!lot) notFound();

  const galleryTitle = galleryTitleFromToken(slug);
  const details = [
    { label: "Listed quantity", value: lot.quantity },
    { label: "Condition", value: lot.condition },
    { label: "Models", value: lot.models },
    { label: "Includes", value: lot.includes },
    { label: "Bid deadline", value: lot.bidDeadline },
    {
      label: "Seller",
      value: slug === DEMO_GALLERY.token ? DEMO_GALLERY.seller : "Private seller",
    },
    {
      label: "Logistics",
      value:
        slug === DEMO_GALLERY.token
          ? DEMO_GALLERY.location
          : "Arranged after award",
    },
  ];

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
      {session.role === "buyer" && <LinkGalleryOnVisit token={slug} />}
      <Link
        href={galleryPath(slug)}
        className="text-sm font-semibold text-[var(--accent)] hover:underline"
      >
        ← Back to Seller Inventory
      </Link>

      <p className="mt-6 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
        {galleryTitle}
      </p>
      <h1 className="font-display mt-2 text-3xl tracking-tight text-[var(--ink)] sm:text-4xl">
        {lot.title}
      </h1>
      <p className="mt-3 text-[var(--muted)]">{lot.meta}</p>

      <div className="relative mt-8 aspect-[16/10] overflow-hidden bg-[var(--mist)]">
        <Image
          src={lot.image}
          alt={lot.imageAlt}
          fill
          priority
          className="object-cover"
          sizes="(max-width: 896px) 100vw, 896px"
        />
      </div>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-[var(--ink)]">Lot details</h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          {details.map((item) => (
            <div
              key={item.label}
              className="border-b border-[var(--border)] pb-4"
            >
              <dt className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                {item.label}
              </dt>
              <dd className="mt-1 text-sm text-[var(--ink)]">{item.value}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-[var(--ink)]">Notes</h3>
          <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
            {lot.notes}
          </p>
        </div>
      </section>

      {session.role === "buyer" ? (
        <PlaceBidForm
          lotId={lot.id}
          lotTitle={lot.title}
          fallbackAvailable={lot.availableUnits}
          bidDeadline={lot.bidDeadline}
          buyerName={session.name}
          buyerEmail={session.email}
        />
      ) : (
        <section className="mt-12 border border-[var(--border)] bg-white p-6">
          <h2 className="text-lg font-semibold text-[var(--ink)]">
            Seller view
          </h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Buyers bid on this lot with a quantity and amount. Accept bids in
            your seller admin to process the sale and reduce remaining
            inventory.
          </p>
          <p className="mt-4 text-sm text-[var(--muted)]">
            Deadline {lot.bidDeadline}
          </p>
        </section>
      )}
    </div>
  );
}
