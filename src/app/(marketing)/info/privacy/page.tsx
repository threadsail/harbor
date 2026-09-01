import Link from "next/link";

export const metadata = {
  title: "Privacy policy | Harbor",
  description:
    "How Harbor and Theseus Creative LLC collect, use, and protect your information.",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
      <h1 className="font-display text-4xl tracking-tight text-[var(--ink)] sm:text-5xl">
        Privacy policy
      </h1>
      <p className="mt-4 text-sm text-[var(--muted)]">
        Last updated: September 1, 2026
      </p>
      <p className="mt-6 text-lg leading-relaxed text-[var(--muted)]">
        Harbor is operated by Theseus Creative LLC. This policy explains what
        information we collect, how we use it, and the choices you have.
      </p>

      <div className="mt-10 space-y-8 text-base leading-relaxed text-[var(--muted)]">
        <section>
          <h2 className="text-lg font-semibold text-[var(--ink)]">
            Information we collect
          </h2>
          <p className="mt-3">
            When you create an account or use Harbor, we may collect your name,
            email address, organization details, and account role (seller or
            buyer). If you list devices or place bids, we also store inventory
            details, photos, bid amounts, and related transaction information.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[var(--ink)]">
            How we use information
          </h2>
          <p className="mt-3">
            We use your information to operate Harbor, authenticate users,
            facilitate private Seller Inventory links, process bids and payments
            through Stripe, and communicate with you about your account or
            support requests.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[var(--ink)]">
            Private by design
          </h2>
          <p className="mt-3">
            Seller inventories are not publicly listed on Harbor. Access is
            limited to people who receive your private link. We do not sell your
            personal information to third parties.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[var(--ink)]">
            Third-party services
          </h2>
          <p className="mt-3">
            Harbor uses trusted providers for authentication (including Google
            and Microsoft sign-in), hosting, and payments (Stripe). Those
            services process data according to their own privacy policies.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[var(--ink)]">
            Data retention and security
          </h2>
          <p className="mt-3">
            We retain account and transaction data as long as needed to provide
            the service and meet legal obligations. We use reasonable
            technical and organizational measures to protect your information.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[var(--ink)]">
            Your choices
          </h2>
          <p className="mt-3">
            You may request access to, correction of, or deletion of your
            personal information by contacting us. You can sign out of your
            account at any time from your dashboard.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[var(--ink)]">
            Contact
          </h2>
          <p className="mt-3">
            Questions about this policy? Email{" "}
            <a
              href="mailto:jordan@theseuscreative.com"
              className="font-medium text-[var(--accent)] hover:underline"
            >
              jordan@theseuscreative.com
            </a>
            .
          </p>
        </section>
      </div>

      <Link
        href="/info/contact"
        className="mt-10 inline-flex text-sm font-semibold text-[var(--accent)] hover:underline"
      >
        Contact us →
      </Link>
    </div>
  );
}
