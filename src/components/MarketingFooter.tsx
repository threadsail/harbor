import Link from "next/link";

export default function MarketingFooter() {
  return (
    <footer className="border-t border-[var(--border)] bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="font-display text-xl text-[var(--ink)]">Harbor</p>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-[var(--muted)]">
            Private device galleries for schools and enterprises. Share a link.
            Invite vendors. Recover value—securely.
          </p>
        </div>
        <div className="flex flex-wrap gap-8 text-sm">
          <div className="space-y-2">
            <p className="font-semibold text-[var(--ink)]">Platform</p>
            <Link
              href="/sell"
              className="block text-[var(--muted)] hover:text-[var(--accent)]"
            >
              For sellers
            </Link>
            <Link
              href="/buy"
              className="block text-[var(--muted)] hover:text-[var(--accent)]"
            >
              For buyers
            </Link>
            <Link
              href="/pricing"
              className="block text-[var(--muted)] hover:text-[var(--accent)]"
            >
              Pricing
            </Link>
          </div>
          <div className="space-y-2">
            <p className="font-semibold text-[var(--ink)]">Company</p>
            <Link
              href="/info/about"
              className="block text-[var(--muted)] hover:text-[var(--accent)]"
            >
              About
            </Link>
            <Link
              href="/info/contact"
              className="block text-[var(--muted)] hover:text-[var(--accent)]"
            >
              Contact
            </Link>
            <Link
              href="/info/support"
              className="block text-[var(--muted)] hover:text-[var(--accent)]"
            >
              Support
            </Link>
          </div>
          <div className="space-y-2">
            <p className="font-semibold text-[var(--ink)]">Account</p>
            <Link
              href="/auth"
              className="block text-[var(--muted)] hover:text-[var(--accent)]"
            >
              Sign in
            </Link>
            <Link
              href="/auth?mode=signup"
              className="block text-[var(--muted)] hover:text-[var(--accent)]"
            >
              Create account
            </Link>
          </div>
        </div>
      </div>
      <div className="border-t border-[var(--border)]">
        <div className="mx-auto max-w-6xl px-4 py-4 text-center text-xs text-[var(--muted)] sm:px-6 sm:text-left">
          © {new Date().getFullYear()} Harbor. Device listings stay
          private—visible only via shared links.
        </div>
      </div>
    </footer>
  );
}
