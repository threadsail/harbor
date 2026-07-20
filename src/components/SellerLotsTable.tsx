"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  buildSellerAdminLots,
} from "@/lib/seller-lots-store";
import type { SellerLot } from "@/lib/seller-lots";

export default function SellerLotsTable() {
  const [lots, setLots] = useState<SellerLot[]>([]);
  const [ready, setReady] = useState(false);

  function refresh() {
    setLots(buildSellerAdminLots());
    setReady(true);
  }

  useEffect(() => {
    refresh();
    const onUpdate = () => refresh();
    window.addEventListener("harbor-inventory-updated", onUpdate);
    window.addEventListener("storage", onUpdate);
    return () => {
      window.removeEventListener("harbor-inventory-updated", onUpdate);
      window.removeEventListener("storage", onUpdate);
    };
  }, []);

  return (
    <div className="mt-4 overflow-hidden border border-[var(--border)] bg-white">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-[var(--border)] bg-[var(--mist)] text-[var(--muted)]">
          <tr>
            <th className="px-4 py-3 font-medium">Lot</th>
            <th className="hidden px-4 py-3 font-medium sm:table-cell">
              Quantity
            </th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Bids</th>
          </tr>
        </thead>
        <tbody>
          {!ready ? (
            <tr>
              <td colSpan={4} className="px-4 py-6 text-[var(--muted)]">
                Loading lots…
              </td>
            </tr>
          ) : lots.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-4 py-6 text-[var(--muted)]">
                No lots yet. Add a lot to get started.
              </td>
            </tr>
          ) : (
            lots.map((lot) => (
              <tr
                key={lot.id}
                className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--mist)]/60"
              >
                <td className="p-0">
                  <Link
                    href={`/dashboard/seller/lots/${lot.id}`}
                    className="flex items-center gap-3 px-4 py-3"
                  >
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden bg-[var(--mist)]">
                      {lot.images[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={lot.images[0]}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[10px] text-[var(--muted)]">
                          No photo
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-[var(--ink)]">
                        {lot.title}
                      </p>
                      {lot.description ? (
                        <p className="mt-0.5 line-clamp-1 text-xs text-[var(--muted)]">
                          {lot.description}
                        </p>
                      ) : null}
                    </div>
                  </Link>
                </td>
                <td className="hidden p-0 sm:table-cell">
                  <Link
                    href={`/dashboard/seller/lots/${lot.id}`}
                    className="block px-4 py-3 text-[var(--muted)]"
                  >
                    {lot.quantity.toLocaleString()} units
                  </Link>
                </td>
                <td className="p-0">
                  <Link
                    href={`/dashboard/seller/lots/${lot.id}`}
                    className="block px-4 py-3 text-[var(--muted)]"
                  >
                    {lot.status}
                  </Link>
                </td>
                <td className="p-0">
                  <Link
                    href={`/dashboard/seller/lots/${lot.id}`}
                    className="block px-4 py-3 text-[var(--ink)]"
                  >
                    {lot.bids}
                  </Link>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
