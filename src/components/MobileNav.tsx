"use client";

import { useState } from "react";
import Link from "next/link";

const links = [
  { href: "/#how-it-works", label: "How it works" },
  { href: "/sell", label: "Sell devices" },
  { href: "/buy", label: "Buy & bid" },
  { href: "/pricing", label: "Pricing" },
  { href: "/info/about", label: "About" },
  { href: "/info/contact", label: "Contact" },
  { href: "/info/support", label: "Support" },
];

export default function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-label="Open menu"
        onClick={() => setOpen((v) => !v)}
        className="rounded-md border border-[var(--border)] px-3 py-2 text-sm font-medium text-[var(--ink)]"
      >
        Menu
      </button>
      {open && (
        <div className="absolute left-0 right-0 top-full z-50 border-b border-[var(--border)] bg-white px-4 py-3 shadow-md">
          <nav className="flex flex-col gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-md px-3 py-2.5 text-sm font-medium text-[var(--ink)] hover:bg-[var(--mist)]"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
}
