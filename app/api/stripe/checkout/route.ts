import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getStripeOrNull, PLANS } from "@/lib/stripe";

export async function POST(req: Request) {
  try {
    const stripe = getStripeOrNull();
    if (!stripe) {
      return NextResponse.json(
        { error: "Payment system is not configured. Please contact support." },
        { status: 503 }
      );
    }
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "You must be logged in to upgrade" },
        { status: 401 }
      );
    }

    const { plan, interval = "monthly" } = await req.json();
    if (plan !== "pro") {
      return NextResponse.json(
        { error: "Invalid plan" },
        { status: 400 }
      );
    }

    const priceId =
      interval === "annual" && PLANS.pro.stripeAnnualPriceId
        ? PLANS.pro.stripeAnnualPriceId
        : interval === "lifetime" && PLANS.pro.stripeLifetimePriceId
          ? PLANS.pro.stripeLifetimePriceId
          : PLANS.pro.stripePriceId;
    if (!priceId) {
      return NextResponse.json(
        { error: "Pro plan is not configured" },
        { status: 500 }
      );
    }

    const baseUrl =
      process.env.NEXTAUTH_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
      "http://localhost:3000";
    const successUrl =
      process.env.STRIPE_SUCCESS_URL || `${baseUrl}/dashboard?success=true`;
    const cancelUrl =
      process.env.STRIPE_CANCEL_URL || `${baseUrl}/pricing?canceled=true`;

    const isLifetime = interval === "lifetime";
    const planType =
      interval === "monthly"
        ? "pro_monthly"
        : interval === "annual"
          ? "pro_annual"
          : "pro_lifetime";
    const userId = (session.user as { id?: string }).id;
    if (!userId) {
      return NextResponse.json(
        { error: "Session missing user id. Please sign in again." },
        { status: 401 }
      );
    }
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: isLifetime ? "payment" : "subscription",
      line_items: [{ price: priceId as string, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: session.user.email,
      metadata: {
        userId,
        userEmail: session.user.email,
        planType,
      },
    });

    return NextResponse.json({
      url: checkoutSession.url,
    });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Checkout failed" },
      { status: 500 }
    );
  }
}
