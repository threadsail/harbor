import Link from "next/link";
import AuthHeader from "@/components/AuthHeader";
import HarborLogoMark from "@/components/HarborLogoMark";
import MobileNav from "@/components/MobileNav";
import NavigationDropdown from "@/components/NavigationDropdown";

export default function MarketingHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)]/80 bg-white/85 backdrop-blur-md">
      <div className="relative mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
        <Link href="/" className="group flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[var(--accent)] text-white transition group-hover:bg-[var(--accent-dark)]">
            <HarborLogoMark />
          </div>
          <span className="font-display text-xl tracking-tight text-[var(--ink)] sm:text-2xl">
            Harbor
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <Link
            href="/#how-it-works"
            className="rounded-md px-3 py-2 text-sm font-medium text-[var(--muted)] transition-colors hover:bg-[var(--mist)] hover:text-[var(--ink)]"
          >
            How it works
          </Link>
          <Link
            href="/sell"
            className="rounded-md px-3 py-2 text-sm font-medium text-[var(--muted)] transition-colors hover:bg-[var(--mist)] hover:text-[var(--ink)]"
          >
            Sell devices
          </Link>
          <Link
            href="/buy"
            className="rounded-md px-3 py-2 text-sm font-medium text-[var(--muted)] transition-colors hover:bg-[var(--mist)] hover:text-[var(--ink)]"
          >
            Buy &amp; bid
          </Link>
          <Link
            href="/pricing"
            className="rounded-md px-3 py-2 text-sm font-medium text-[var(--muted)] transition-colors hover:bg-[var(--mist)] hover:text-[var(--ink)]"
          >
            Pricing
          </Link>
          <NavigationDropdown
            label="Company"
            items={[
              { label: "About", href: "/info/about" },
              { label: "Contact", href: "/info/contact" },
              { label: "Support", href: "/info/support" },
            ]}
          />
        </nav>

        <div className="flex items-center gap-2">
          <MobileNav />
          <AuthHeader />
        </div>
      </div>
    </header>
  );
}
