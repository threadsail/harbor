import Link from "next/link";
import { FREE_SELLER_LOT_LIMIT } from "@/lib/seller-plan";

const plans = [
  {
    name: "Free",
    price: "$0",
    detail: "For schools and companies getting started",
    features: [
      `Up to ${FREE_SELLER_LOT_LIMIT} device lots`,
      "Private Seller Inventory links",
      "Invite vendor bidding",
      "Stripe payouts minus 5% Harbor fee",
    ],
    cta: "Start free",
    href: "/auth?intent=sell&mode=signup",
  },
  {
    name: "Pro",
    price: "Contact us",
    detail: "For districts and enterprises with larger fleets",
    features: [
      "Unlimited device lots",
      "Everything in Free",
      "Multi-site inventories",
      "Team seats for IT staff",
      "Priority onboarding",
    ],
    featured: true,
    cta: "Upgrade to Pro",
    href: "/info/contact",
  },
  {
    name: "Vendor",
    price: "Free to join",
    detail: "For recycling & refurb buyers",
    features: [
      "Open shared inventory links",
      "Submit bids on lots",
      "Pay accepted bids via Stripe",
      "Buyer profile for sellers",
      "Account required to bid",
    ],
    cta: "Join as vendor",
    href: "/auth?intent=buy&mode=signup",
  },
];

export default function PricingPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="font-display text-4xl tracking-tight text-[var(--ink)] sm:text-5xl">
          Simple plans for sellers and buyers
        </h1>
        <p className="mt-4 text-lg text-[var(--muted)]">
          Start free with up to {FREE_SELLER_LOT_LIMIT} device lots. Upgrade to
          Pro when you need unlimited listings. Vendors bid for free.
        </p>
      </div>

      <div className="mt-10 mx-auto max-w-2xl border border-[var(--border)] bg-white p-6 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
          Hosting fee
        </p>
        <p className="font-display mt-2 text-3xl text-[var(--ink)]">5%</p>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Harbor takes 5% of each paid sale for platform hosting. The remaining
          95% is the seller payout. Buyers pay the full bid amount via Stripe.
        </p>
      </div>

      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`flex flex-col border bg-white p-6 ${
              plan.featured
                ? "border-[var(--accent)] shadow-md"
                : "border-[var(--border)]"
            }`}
          >
            <h2 className="text-xl font-semibold text-[var(--ink)]">
              {plan.name}
            </h2>
            <p className="mt-3 font-display text-3xl text-[var(--ink)]">
              {plan.price}
            </p>
            <p className="mt-2 text-sm text-[var(--muted)]">{plan.detail}</p>
            <ul className="mt-6 flex-1 space-y-3">
              {plan.features.map((feature) => (
                <li
                  key={feature}
                  className="flex items-start gap-2 text-sm text-[var(--ink)]"
                >
                  <span
                    className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]"
                    aria-hidden
                  />
                  {feature}
                </li>
              ))}
            </ul>
            <Link
              href={plan.href}
              className={`mt-8 inline-flex justify-center rounded-md px-4 py-2.5 text-sm font-semibold transition ${
                plan.featured
                  ? "bg-[var(--accent)] text-white hover:bg-[var(--accent-dark)]"
                  : "border border-[var(--border)] text-[var(--ink)] hover:bg-[var(--mist)]"
              }`}
            >
              {plan.cta}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
