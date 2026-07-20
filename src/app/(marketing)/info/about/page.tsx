import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
      <h1 className="font-display text-4xl tracking-tight text-[var(--ink)] sm:text-5xl">
        About Harbor
      </h1>
      <p className="mt-6 text-lg leading-relaxed text-[var(--muted)]">
        Harbor helps school districts and companies retire technology the right
        way: privately, competitively, and with less e-waste.
      </p>
      <p className="mt-4 text-base leading-relaxed text-[var(--muted)]">
        Instead of a public marketplace where anyone can browse every lot, Harbor
        gives sellers a gallery they control. Share a link with verified
        recycling vendors, collect bids, and move inventory without exposing
        your refresh cycle to the open web.
      </p>
      <p className="mt-4 text-base leading-relaxed text-[var(--muted)]">
        Buyers get access only when invited—so competition stays focused on real
        lots from real institutions, not a noisy feed of random listings.
      </p>
      <Link
        href="/info/contact"
        className="mt-10 inline-flex rounded-md bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--accent-dark)]"
      >
        Contact the team
      </Link>
    </div>
  );
}
