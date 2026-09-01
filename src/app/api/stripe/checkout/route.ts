import { NextResponse } from "next/server";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { calculateHarborFee } from "@/lib/fees";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      saleId?: string;
      bidId?: string;
      lotTitle?: string;
      quantity?: number;
      amount?: number;
      buyerEmail?: string;
      buyerName?: string;
      feeRate?: number;
    };

    const {
      saleId,
      bidId,
      lotTitle,
      quantity,
      amount,
      buyerEmail,
      buyerName,
      feeRate,
    } = body;

    if (
      !saleId ||
      !bidId ||
      !lotTitle ||
      !quantity ||
      !amount ||
      amount <= 0
    ) {
      return NextResponse.json(
        { error: "Missing sale details for checkout." },
        { status: 400 }
      );
    }

    if (!isStripeConfigured()) {
      return NextResponse.json({
        mode: "simulate",
        message:
          "Stripe keys are not configured. Use simulated payment for local demo.",
        saleId,
      });
    }

    const stripe = getStripe();
    if (!stripe) {
      return NextResponse.json(
        { error: "Stripe is not available." },
        { status: 500 }
      );
    }

    const fees = calculateHarborFee(amount, feeRate);
    const origin = new URL(request.url).origin;
    const unitAmount = Math.round(fees.total * 100);
    const feePercent = (fees.feeRate * 100).toFixed(0);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: buyerEmail || undefined,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: unitAmount,
            product_data: {
              name: lotTitle,
              description: `${quantity.toLocaleString()} units · includes ${feePercent}% Harbor hosting fee ($${fees.harborFee.toFixed(2)})`,
            },
          },
        },
      ],
      metadata: {
        saleId,
        bidId,
        quantity: String(quantity),
        harborFee: String(fees.harborFee),
        sellerPayout: String(fees.sellerPayout),
        feeRate: String(fees.feeRate),
        buyerName: buyerName || "",
      },
      payment_intent_data: {
        metadata: {
          saleId,
          bidId,
          harborFee: String(fees.harborFee),
          sellerPayout: String(fees.sellerPayout),
        },
        description: `Harbor sale · ${lotTitle}`,
      },
      success_url: `${origin}/payment/success?session_id={CHECKOUT_SESSION_ID}&sale_id=${encodeURIComponent(saleId)}`,
      cancel_url: `${origin}/payment/cancel?sale_id=${encodeURIComponent(saleId)}`,
    });

    return NextResponse.json({
      mode: "stripe",
      url: session.url,
      sessionId: session.id,
      saleId,
      fees,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Checkout failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
