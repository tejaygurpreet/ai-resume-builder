import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getStripeOrNull, PLANS } from "@/lib/stripe";

export async function POST() {
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
        { error: "You must be logged in" },
        { status: 401 }
      );
    }

    const priceId = PLANS.oneTimeExport.stripePriceId;
    if (!priceId) {
      return NextResponse.json(
        { error: "One-time export is not configured" },
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

    const userId = (session.user as { id?: string }).id;
    if (!userId) {
      return NextResponse.json(
        { error: "Session missing user id. Please sign in again." },
        { status: 401 }
      );
    }
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
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
