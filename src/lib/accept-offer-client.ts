import {
  attachStripeCheckout,
  startSaleCheckout,
} from "@/lib/bids-store";
import { requestStripeCheckout } from "@/lib/stripe-checkout-client";

export type AcceptOfferResult =
  | {
      ok: true;
      buyerName: string;
      buyerEmail: string;
      simulated: boolean;
    }
  | { ok: false; error: string };

/** Seller accepts a bid and creates a Stripe checkout session for the buyer. */
export async function acceptOfferAndRequestPayment(
  bidId: string
): Promise<AcceptOfferResult> {
  const started = startSaleCheckout(bidId);
  if (!started.ok) return started;

  const checkout = await requestStripeCheckout(started.sale);
  if (!checkout.ok) return checkout;

  const { data } = checkout;

  if (data.mode === "simulate") {
    return {
      ok: true,
      buyerName: started.sale.buyerName,
      buyerEmail: started.sale.buyerEmail,
      simulated: true,
    };
  }

  if (data.sessionId && data.url) {
    attachStripeCheckout(started.sale.id, data.sessionId, data.url);
    window.dispatchEvent(new Event("harbor-inventory-updated"));
    return {
      ok: true,
      buyerName: started.sale.buyerName,
      buyerEmail: started.sale.buyerEmail,
      simulated: false,
    };
  }

  return { ok: false, error: "Stripe did not return a checkout URL." };
}

export function acceptOfferSuccessMessage(result: Extract<AcceptOfferResult, { ok: true }>): string {
  if (result.simulated) {
    return `Offer accepted. ${result.buyerName} can pay from buyer admin (simulated checkout until Stripe keys are added).`;
  }
  return `Offer accepted. ${result.buyerName} (${result.buyerEmail}) can pay from their buyer admin.`;
}
