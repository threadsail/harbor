"use client";

import { useEffect } from "react";
import { linkSharedGalleryAction } from "@/app/actions/auth";

/** Links a shared Seller Inventory to the buyer account after they open it. */
export default function LinkGalleryOnVisit({ token }: { token: string }) {
  useEffect(() => {
    void linkSharedGalleryAction(token);
  }, [token]);

  return null;
}
