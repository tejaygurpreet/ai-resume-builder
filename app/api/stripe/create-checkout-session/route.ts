import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  getExportPriceId,
  getProAnnualPriceId,
  getProLifetimePriceId,
  getProMonthlyPriceId,
  getRuntimeStripeMode,
  logStripePlanPriceMissing,
  logStripePlanPriceResolved,
} from "@/lib/stripe-prices";
import { getStripeClientForMode } from "@/lib/stripe-config";
import { prisma } from "@/lib/prisma";

type PlanTypeKey = "monthly" | "annual" | "export" | "lifetime";

const PLAN_MAP: Record<
  PlanTypeKey,
  { tier: string; webhookPlanType: string }
> = {
  monthly: { tier: "PRO_MONTHLY", webhookPlanType: "pro_monthly" },
  annual: { tier: "PRO_ANNUAL", webhookPlanType: "pro_annual" },
  export: { tier: "EXPORT", webhookPlanType: "one_time_export" },
  lifetime: { tier: "LIFETIME", webhookPlanType: "pro_lifetime" },
};

/**
 * New checkout by `planType` (monthly | annual | export | lifetime).
 * Uses NODE_ENV + lib/stripe-env / lib/stripe-prices (test vs live price IDs).
 * For Pro subscriptions with `plan` + `interval`, use POST /api/stripe/checkout instead.
 */
export async function POST(req: Request) {
  try {
    const mode = getRuntimeStripeMode();
    let stripe;
    try {
      stripe = getStripeClientForMode(mode);
    } catch {
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

    const userId = (session.user as { id?: string }).id;
    if (!userId) {
      return NextResponse.json(
        { error: "Session missing user id. Please sign in again." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const planType = body.planType as PlanTypeKey | undefined;
    const targetPlan = planType ? PLAN_MAP[planType] : undefined;
    if (!planType || !targetPlan) {
      return NextResponse.json({ error: "Invalid plan type" }, { status: 400 });
    }

    const priceId =
      planType === "monthly"
        ? getProMonthlyPriceId()
        : planType === "annual"
          ? getProAnnualPriceId()
          : planType === "export"
            ? getExportPriceId()
            : getProLifetimePriceId();

    if (!priceId) {
      logStripePlanPriceMissing("create-checkout-session", planType, mode);
      return NextResponse.json(
        { error: "Price ID not configured" },
        { status: 500 }
      );
    }
    logStripePlanPriceResolved("create-checkout-session", planType, mode);

    const sub = await prisma.subscription.findUnique({
      where: { userId },
      select: { plan: true, stripeSubscriptionId: true },
    });
    if (sub?.plan === "pro" && !sub.stripeSubscriptionId) {
      return NextResponse.json(
        { error: "Lifetime Pro users cannot purchase other plans." },
        { status: 400 }
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

    const isPayment = planType === "lifetime" || planType === "export";

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: isPayment ? "payment" : "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      client_reference_id: userId,
      customer_email: session.user.email,
      metadata: {
        userId,
        userEmail: session.user.email,
        planType: targetPlan.webhookPlanType,
        tier: targetPlan.tier,
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
