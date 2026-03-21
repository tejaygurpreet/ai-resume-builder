import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { applySubscriptionProrationPriceChange } from "@/lib/stripe-subscription-proration-upgrade";
import {
  type CheckoutPlanType,
  getCheckoutPlanPriceId,
  getDefaultCheckoutStripeMode,
  getStripeClientForMode,
  resolveStripeForSubscriptionId,
} from "@/lib/stripe-config";
import type { StripeMode } from "@/lib/stripe-subscription-mode";
import {
  describeStripePlanPriceResolution,
  isStripePriceDebugEnabled,
  logStripePlanPriceMissing,
  logStripePlanPriceResolved,
} from "@/lib/stripe-prices";

const PLAN_META: Record<string, { tier: string }> = {
  monthly: { tier: "PRO_MONTHLY" },
  annual: { tier: "PRO_ANNUAL" },
  export: { tier: "EXPORT" },
  lifetime: { tier: "LIFETIME" },
};

function normalizePlanType(raw: unknown): CheckoutPlanType | undefined {
  if (typeof raw !== "string") return undefined;
  const p = raw.toLowerCase();
  if (p === "monthly" || p === "annual" || p === "export" || p === "lifetime") {
    return p;
  }
  return undefined;
}

/**
 * planType: `monthly` | `annual` | `export` | `lifetime`
 *
 * - Price IDs use the Stripe **account mode** that owns the user’s subscription when
 *   `stripeSubscriptionId` is set (probe with all configured secret keys).
 * - Otherwise mode follows NODE_ENV (dev → test, production → live).
 * - Recurring plan switches use `subscriptions.update` + proration (not Checkout on `subscription`).
 * - Which secret key to use: `resolveStripeForSubscriptionId` tries STRIPE_TEST_SECRET_KEY,
 *   STRIPE_LIVE_SECRET_KEY, then optional STRIPE_SECRET_KEY — Stripe ids are always `sub_…` (there is no `sub_test_` prefix).
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string } | undefined)?.id;
    const userEmail = session?.user?.email;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let planType: CheckoutPlanType | undefined;
    try {
      const body = await req.json();
      planType = normalizePlanType(body?.planType);
      if (!planType && body?.interval === "annual") planType = "annual";
      if (!planType && body?.interval === "monthly") planType = "monthly";
      if (!planType && body?.targetPlan === "ANNUAL") planType = "annual";
      if (!planType && body?.targetPlan === "MONTHLY") planType = "monthly";
    } catch {
      planType = undefined;
    }

    if (!planType || !PLAN_META[planType]) {
      return NextResponse.json(
        { error: "Invalid plan type (use monthly, annual, export, or lifetime)" },
        { status: 400 }
      );
    }

    const currentSubscription = await prisma.subscription.findFirst({
      where: {
        userId,
        status: "active",
      },
    });

    /** Stripe client + mode for this subscription (same instance used for proration). */
    let stripeForExistingSub: Awaited<
      ReturnType<typeof resolveStripeForSubscriptionId>
    > = null;

    let priceMode: StripeMode = getDefaultCheckoutStripeMode();
    if (currentSubscription?.stripeSubscriptionId) {
      stripeForExistingSub = await resolveStripeForSubscriptionId(
        currentSubscription.stripeSubscriptionId
      );
      if (stripeForExistingSub) {
        priceMode = stripeForExistingSub.mode;
      }
    }

    const priceId = getCheckoutPlanPriceId(planType, priceMode);
    if (!priceId) {
      logStripePlanPriceMissing("create-upgrade-session", planType, priceMode);
      return NextResponse.json(
        {
          error: "Price ID not configured for this mode",
          hint:
            priceMode === "test"
              ? "Set STRIPE_TEST_PRO_MONTHLY_PRICE_ID / STRIPE_TEST_PRO_ANNUAL_PRICE_ID / STRIPE_TEST_EXPORT_PRICE_ID / STRIPE_TEST_*_LIFETIME_* or shared STRIPE_PRO_* / STRIPE_EXPORT_PRICE_ID."
              : "Set STRIPE_LIVE_PRO_MONTHLY_PRICE_ID, STRIPE_LIVE_EXPORT_PRICE_ID (or shared STRIPE_PRO_MONTHLY_PRICE_ID / STRIPE_EXPORT_PRICE_ID / STRIPE_ONE_TIME_PRICE_ID) on the host.",
          ...(isStripePriceDebugEnabled()
            ? {
                priceResolution: describeStripePlanPriceResolution(
                  planType,
                  priceMode
                ),
              }
            : {}),
        },
        { status: 500 }
      );
    }
    logStripePlanPriceResolved("create-upgrade-session", planType, priceMode);

    const baseUrl =
      process.env.NEXTAUTH_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
      "http://localhost:3000";

    const targetPlan = PLAN_META[planType]!;

    const upgradeFromPlan = currentSubscription?.plan ?? "";
    const upgradeFromInterval = currentSubscription?.planInterval ?? "";

    // Existing Stripe subscription: recurring plan changes → proration
    if (
      currentSubscription?.stripeSubscriptionId &&
      (planType === "monthly" || planType === "annual")
    ) {
      if (!stripeForExistingSub) {
        return NextResponse.json(
          {
            error: "Could not load subscription in Stripe",
            hint:
              "Subscription IDs are always sub_… in test and live. Set STRIPE_TEST_SECRET_KEY and STRIPE_LIVE_SECRET_KEY (both on the server if you upgrade test or live subs). STRIPE_SECRET_KEY is optional.",
            env: {
              hasStripeTestSecretKey: !!process.env.STRIPE_TEST_SECRET_KEY?.trim(),
              hasStripeLiveSecretKey: !!process.env.STRIPE_LIVE_SECRET_KEY?.trim(),
              hasStripeSecretKeyLegacy: !!process.env.STRIPE_SECRET_KEY?.trim(),
            },
          },
          { status: 400 }
        );
      }

      try {
        const { paymentUrl, message } = await applySubscriptionProrationPriceChange(
          stripeForExistingSub.stripe,
          currentSubscription.stripeSubscriptionId,
          priceId
        );

        return NextResponse.json({
          url: paymentUrl,
          success: true,
          message,
          stripeMode: stripeForExistingSub.mode,
          metadata: {
            userId,
            targetTier: targetPlan.tier,
            upgradeFromPlan,
            upgradeFromInterval,
            isUpgrade: "true",
          },
        });
      } catch (e) {
        console.error("[create-upgrade-session] proration error", {
          userId,
          stripeSubscriptionId: currentSubscription.stripeSubscriptionId,
          planType,
          error: e instanceof Error ? e.message : e,
        });
        return NextResponse.json(
          { error: e instanceof Error ? e.message : "Upgrade failed" },
          { status: 500 }
        );
      }
    }

    let stripe;
    try {
      stripe = getStripeClientForMode(priceMode);
    } catch (e) {
      console.error("[create-upgrade-session] Stripe client for mode", priceMode, e);
      return NextResponse.json(
        {
          error:
            "Stripe is not configured for this checkout mode. Set STRIPE_TEST_SECRET_KEY (test) and/or STRIPE_LIVE_SECRET_KEY (live) to match your price IDs.",
        },
        { status: 503 }
      );
    }

    const webhookPlanType =
      planType === "monthly"
        ? "pro_monthly"
        : planType === "annual"
          ? "pro_annual"
          : planType === "lifetime"
            ? "pro_lifetime"
            : "one_time_export";

    const isPayment = planType === "lifetime" || planType === "export";
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: isPayment ? "payment" : "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${baseUrl}/dashboard?${isPayment ? "success=true" : "upgraded=true"}`,
      cancel_url: `${baseUrl}/pricing?canceled=true`,
      client_reference_id: userId,
      ...(userEmail ? { customer_email: userEmail } : {}),
      metadata: {
        userId,
        userEmail: userEmail ?? "",
        planType: webhookPlanType,
        targetTier: targetPlan.tier,
        ...(currentSubscription?.stripeSubscriptionId
          ? {
              upgradeFromPlan,
              upgradeFromInterval,
              isUpgrade: "true",
            }
          : {}),
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("[create-upgrade-session] Upgrade error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
