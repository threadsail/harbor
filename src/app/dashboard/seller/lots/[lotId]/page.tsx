import Link from "next/link";
import { redirect } from "next/navigation";
import { getAppSession } from "@/utils/auth/session";
import SellerLotDetail from "@/components/SellerLotDetail";

export const metadata = {
  title: "Lot details | Harbor",
  description: "View lot details and offers in seller admin.",
};

type SellerLotPageProps = {
  params: Promise<{ lotId: string }>;
};

export default async function SellerLotPage(_props: SellerLotPageProps) {
  const session = await getAppSession();
  if (!session) redirect("/auth?intent=sell");
  if (session.role !== "seller") redirect("/dashboard/buyer");

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
      <Link
        href="/dashboard/seller"
        className="text-sm font-semibold text-[var(--accent)] hover:underline"
      >
        ← Back to seller admin
      </Link>
      <p className="mt-6 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
        Seller admin
      </p>
      <SellerLotDetail />
    </div>
  );
}
