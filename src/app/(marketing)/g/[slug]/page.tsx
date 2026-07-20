import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getAppSession } from "@/utils/auth/session";
import { dashboardPathForRole } from "@/lib/demo-auth";
import { buyerInviteAuthPath } from "@/lib/buyer-galleries";
import LinkGalleryOnVisit from "@/components/LinkGalleryOnVisit";
import {
  DEMO_GALLERY_LOTS,
  galleryLotPath,
  galleryPath,
  galleryTitleFromToken,
} from "@/lib/galleries";

type GalleryPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: GalleryPageProps) {
  const { slug } = await params;
  const title = galleryTitleFromToken(slug);
  return {
    title: `${title} | Harbor`,
    description: "Seller inventory. Sign in required to view and bid.",
    robots: { index: false, follow: false },
  };
}

export default async function GalleryPage({ params }: GalleryPageProps) {
  const { slug } = await params;
  const session = await getAppSession();
  const inventoryPath = galleryPath(slug);

  if (!session) {
    redirect(buyerInviteAuthPath(inventoryPath));
  }

  const title = galleryTitleFromToken(slug);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-16 sm:px-6 sm:py-20">
      {session.role === "buyer" && <LinkGalleryOnVisit token={slug} />}
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
        Seller Inventory
      </p>
      <h1 className="font-display mt-3 text-3xl tracking-tight text-[var(--ink)] sm:text-4xl">
        {title}
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-[var(--muted)]">
        Signed in as {session.name}
        {session.isDemo ? " (demo)" : ""}.
        {session.role === "buyer"
          ? " Open a lot to place a bid with quantity and amount."
          : " Click a lot to view full details."}
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {DEMO_GALLERY_LOTS.map((lot) => (
          <Link
            key={lot.id}
            href={galleryLotPath(slug, lot.id)}
            className="group border border-[var(--border)] bg-white p-5 transition hover:border-[var(--accent)]"
          >
            <div className="relative aspect-video overflow-hidden bg-[var(--mist)]">
              <Image
                src={lot.image}
                alt={lot.imageAlt}
                fill
                className="object-cover transition duration-300 group-hover:scale-[1.02]"
                sizes="(max-width: 640px) 100vw, 50vw"
              />
            </div>
            <h2 className="mt-4 font-semibold text-[var(--ink)] group-hover:text-[var(--accent)]">
              {lot.title}
            </h2>
            <p className="mt-1 text-sm text-[var(--muted)]">{lot.meta}</p>
            <p className="mt-4 text-sm font-semibold text-[var(--accent)]">
              {session.role === "buyer" ? "View & bid →" : "View details →"}
            </p>
          </Link>
        ))}
      </div>

      <p className="mt-10 text-sm text-[var(--muted)]">
        <Link
          href={dashboardPathForRole(session.role)}
          className="font-semibold text-[var(--accent)]"
        >
          ← Back to {session.role} admin
        </Link>
      </p>
    </div>
  );
}
