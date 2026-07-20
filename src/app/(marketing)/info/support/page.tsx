import Link from "next/link";

export default function SupportPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
      <h1 className="font-display text-4xl tracking-tight text-[var(--ink)] sm:text-5xl">
        Support
      </h1>
      <p className="mt-6 text-lg leading-relaxed text-[var(--muted)]">
        Help with accounts, gallery links, and bidding.
      </p>
      <ul className="mt-10 space-y-6">
        <li>
          <h2 className="font-semibold text-[var(--ink)]">
            Why can&apos;t I browse all devices?
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
            Harbor has no public marketplace. Sellers share private gallery
            links. If you are a vendor, ask the seller for their Harbor URL,
            then sign in to open it.
          </p>
        </li>
        <li>
          <h2 className="font-semibold text-[var(--ink)]">
            Do I need an account to sell or bid?
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
            Yes. Login is required for both sellers and buyers.
          </p>
        </li>
        <li>
          <h2 className="font-semibold text-[var(--ink)]">Still stuck?</h2>
          <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
            <Link
              href="/info/contact"
              className="font-semibold text-[var(--accent)] hover:underline"
            >
              Contact us
            </Link>{" "}
            and we will help you get set up.
          </p>
        </li>
      </ul>
    </div>
  );
}
