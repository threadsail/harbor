import Link from "next/link";
import {
  BUDGET_SELLER_LOT_LIMIT,
  FREE_SELLER_LOT_LIMIT,
  PLAN_ANNUAL_PRICE,
  PLAN_FEE_RATE,
  planLotLimitLabel,
} from "@/lib/seller-plan";
import { formatFeePercent } from "@/lib/fees";

const sellerPlans = [
  {
    name: "Free",
    price: "$0",
    detail: "For schools and companies getting started",
    features: [
      `Up to ${FREE_SELLER_LOT_LIMIT} device lots`,
      "Private Seller Inventory links",
      "Invite vendor bidding",
      `Stripe payouts minus ${formatFeePercent(PLAN_FEE_RATE.free)} Harbor fee`,
    ],
    cta: "Start free",
    href: "/auth?intent=sell&mode=signup",
  },
  {
    name: "Budget",
    price: `$${PLAN_ANNUAL_PRICE.budget}/year`,
    detail: "For growing IT teams with more inventory",
    features: [
      planLotLimitLabel("budget"),
      "Everything in Free",
      `Stripe payouts minus ${formatFeePercent(PLAN_FEE_RATE.budget)} Harbor fee`,
      "Email support",
    ],
    cta: "Get Budget",
    href: "/info/contact?plan=budget",
  },
  {
    name: "Pro",
    price: `$${PLAN_ANNUAL_PRICE.pro}/year`,
    detail: "For districts and enterprises with larger fleets",
    features: [
      planLotLimitLabel("pro"),
      "Everything in Budget",
      `Stripe payouts minus ${formatFeePercent(PLAN_FEE_RATE.pro)} Harbor fee`,
      "Team seats for IT staff",
      "Priority onboarding",
    ],
    featured: true,
    cta: "Get Pro",
    href: "/info/contact?plan=pro",
  },
];

const vendorPlan = {
  name: "Vendors",
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
};

export default function PricingPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="font-display text-4xl tracking-tight text-[var(--ink)] sm:text-5xl">
          Simple plans for sellers and buyers
        </h1>
        <p className="mt-4 text-lg text-[var(--muted)]">
          Start free with up to {FREE_SELLER_LOT_LIMIT} device lots. Budget adds
          up to {BUDGET_SELLER_LOT_LIMIT} lots; Pro is unlimited. Vendors bid
          for free.
        </p>
      </div>

      <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-3">
        {sellerPlans.map((plan) => (
          <div
            key={plan.name}
            className={`flex min-h-full flex-col border bg-white p-6 sm:p-8 ${
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

      <section className="mt-6 border border-[var(--border)] bg-white px-4 py-3 sm:px-5 sm:py-3.5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          <div className="shrink-0 text-center sm:text-left">
            <p className="text-sm font-semibold text-[var(--ink)]">
              {vendorPlan.name}
              <span className="font-normal text-[var(--muted)]">
                {" "}
                · {vendorPlan.price}
              </span>
            </p>
            <p className="mt-0.5 text-xs text-[var(--muted)]">
              {vendorPlan.detail}
            </p>
          </div>

          <p className="flex-1 text-center text-xs leading-relaxed text-[var(--muted)] sm:text-sm">
            {vendorPlan.features.join(" · ")}
          </p>

          <Link
            href={vendorPlan.href}
            className="inline-flex shrink-0 justify-center self-center rounded-md border border-[var(--border)] px-4 py-1.5 text-sm font-semibold text-[var(--ink)] transition hover:bg-[var(--mist)]"
          >
            {vendorPlan.cta}
          </Link>
        </div>
      </section>
    </div>
  );
}
