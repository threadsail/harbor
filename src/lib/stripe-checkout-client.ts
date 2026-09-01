import type { Sale } from "@/lib/bids";

export type CheckoutApiResponse = {
  mode?: "stripe" | "simulate";
  url?: string;
  sessionId?: string;
  saleId?: string;
  message?: string;
  error?: string;
};

type SaleCheckoutInput = Pick<
  Sale,
  | "id"
  | "bidId"
  | "lotTitle"
  | "quantity"
  | "amount"
  | "buyerEmail"
  | "buyerName"
  | "feeRate"
>;

export async function requestStripeCheckout(
  sale: SaleCheckoutInput
): Promise<
  | { ok: true; data: CheckoutApiResponse }
  | { ok: false; error: string }
> {
  try {
    const response = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        saleId: sale.id,
        bidId: sale.bidId,
        lotTitle: sale.lotTitle,
        quantity: sale.quantity,
        amount: sale.amount,
        buyerEmail: sale.buyerEmail,
        buyerName: sale.buyerName,
        feeRate: sale.feeRate,
      }),
    });

    const data = (await response.json()) as CheckoutApiResponse;

    if (!response.ok) {
      return { ok: false, error: data.error || "Could not start Stripe checkout." };
    }

    return { ok: true, data };
  } catch {
    return { ok: false, error: "Network error starting Stripe checkout." };
  }
}
