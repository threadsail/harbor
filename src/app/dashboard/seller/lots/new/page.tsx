import Link from "next/link";
import { redirect } from "next/navigation";
import { getAppSession } from "@/utils/auth/session";
import AddLotForm from "@/components/AddLotForm";

export const metadata = {
  title: "Add lot | Harbor",
  description: "Upload photos and describe devices for your Seller Inventory.",
};

export default async function AddLotPage() {
  const session = await getAppSession();
  if (!session) redirect("/auth?intent=sell");
  if (session.role !== "seller") redirect("/dashboard/buyer");

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <Link
        href="/dashboard/seller"
        className="text-sm font-semibold text-[var(--accent)] hover:underline"
      >
        ← Back to seller admin
      </Link>
      <p className="mt-6 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
        Seller admin
      </p>
      <h1 className="font-display mt-2 text-3xl tracking-tight text-[var(--ink)] sm:text-4xl">
        Add lot
      </h1>
      <p className="mt-3 max-w-2xl text-[var(--muted)]">
        Upload photos and describe the items you want to sell. Lots appear in
        your Seller Inventory for invited buyers.
      </p>

      <div className="mt-8">
        <AddLotForm />
      </div>
    </div>
  );
}
