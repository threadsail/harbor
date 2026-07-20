"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

interface DropdownItem {
  label: string;
  href: string;
}

interface NavigationDropdownProps {
  label: string;
  items: DropdownItem[];
}

export default function NavigationDropdown({
  label,
  items,
}: NavigationDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-[var(--muted)] transition-colors hover:bg-[var(--mist)] hover:text-[var(--ink)]"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {label}
        <svg
          className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full z-[100] mt-1 w-48 rounded-md border border-[var(--border)] bg-white shadow-lg">
          <div className="py-1">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block px-4 py-2 text-sm text-[var(--ink)] transition-colors hover:bg-[var(--mist)]"
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
