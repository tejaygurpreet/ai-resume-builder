import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  getExportPriceIdForStripeMode,
  getRuntimeStripeMode,
  logStripePlanPriceMissing,
  logStripePlanPriceResolved,
} from "@/lib/stripe-prices";
import {
  getStripeClientForMode,
  resolveStripeForSubscriptionId,
} from "@/lib/stripe-config";
import type { StripeMode } from "@/lib/stripe-subscription-mode";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "You must be logged in" },
        { status: 401 }
      );
    }

    const userId = (session.user as { id?: string }).id;
    if (!userId) {
      return NextResponse.json(
        { error: "Session missing user id. Please sign in again." },
        { status: 401 }
      );
    }

    const sub = await prisma.subscription.findUnique({
      where: { userId },
      select: {
        plan: true,
        planInterval: true,
        stripeSubscriptionId: true,
      },
    });

    let mode: StripeMode = getRuntimeStripeMode();
    if (sub?.stripeSubscriptionId) {
      const resolved = await resolveStripeForSubscriptionId(
        sub.stripeSubscriptionId
      );
      if (resolved) mode = resolved.mode;
    }

    let stripe;
    try {
      stripe = getStripeClientForMode(mode);
    } catch {
      return NextResponse.json(
        { error: "Payment system is not configured. Please contact support." },
        { status: 503 }
      );
    }

    if (sub?.plan === "pro" && !sub.stripeSubscriptionId) {
      return NextResponse.json(
        { error: "Lifetime Pro users cannot purchase other plans." },
        { status: 400 }
      );
    }
    if (sub?.plan === "export") {
      return NextResponse.json(
        { error: "You already have Export Access." },
        { status: 400 }
      );
    }

    const priceId = getExportPriceIdForStripeMode(mode);
    if (!priceId) {
      logStripePlanPriceMissing("one-time-export", "export", mode);
      return NextResponse.json(
        {
          error: "One-time export is not configured",
          hint:
            mode === "test"
              ? "Set STRIPE_TEST_EXPORT_PRICE_ID or STRIPE_EXPORT_PRICE_ID / STRIPE_ONE_TIME_PRICE_ID."
              : "Set STRIPE_LIVE_EXPORT_PRICE_ID, STRIPE_LIVE_ONE_TIME_PRICE_ID, or shared STRIPE_EXPORT_PRICE_ID / STRIPE_ONE_TIME_PRICE_ID.",
        },
        { status: 500 }
      );
    }
    logStripePlanPriceResolved("one-time-export", "export", mode);

    const baseUrl =
      process.env.NEXTAUTH_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
      "http://localhost:3000";
    const successUrl =
      process.env.STRIPE_SUCCESS_URL || `${baseUrl}/dashboard?success=true`;
    const cancelUrl =
      process.env.STRIPE_CANCEL_URL || `${baseUrl}/pricing?canceled=true`;

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [{ price: priceId as string, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: session.user.email,
      metadata: {
        userId,
        userEmail: session.user.email,
        planType: "one_time_export",
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (err) {
    console.error("One-time export checkout error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Checkout failed" },
      { status: 500 }
    );
  }
}
