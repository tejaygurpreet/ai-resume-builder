import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import { applySubscriptionProrationPriceChange } from "@/lib/stripe-subscription-proration-upgrade";
import { resolveStripeForSubscriptionId } from "@/lib/stripe-subscription-mode";
import type { StripeMode } from "@/lib/stripe-subscription-mode";

/**
 * Read first non-empty env among candidate keys (supports your STRIPE_TEST_* / STRIPE_LIVE_* names).
 */
function readPriceId(
  mode: StripeMode,
  testKeys: string[],
  liveKeys: string[]
): string | undefined {
  const keys = mode === "test" ? testKeys : liveKeys;
  for (const k of keys) {
    const v = process.env[k]?.trim();
    if (v) return v;
  }
  return undefined;
}

function resolvePlanPriceId(
  planType: string,
  mode: StripeMode
): string | undefined {
  switch (planType) {
    case "monthly":
      return readPriceId(mode, ["STRIPE_TEST_PRO_MONTHLY_PRICE_ID"], [
        "STRIPE_LIVE_PRO_MONTHLY_PRICE_ID",
      ]);
    case "annual":
      return readPriceId(mode, ["STRIPE_TEST_PRO_ANNUAL_PRICE_ID"], [
        "STRIPE_LIVE_PRO_ANNUAL_PRICE_ID",
      ]);
    case "export":
      return readPriceId(mode, ["STRIPE_TEST_EXPORT_PRICE_ID"], [
        "STRIPE_LIVE_EXPORT_PRICE_ID",
      ]);
    case "lifetime":
      return readPriceId(
        mode,
        ["STRIPE_TEST_PRO_LIFETIME_PRICE_ID", "STRIPE_TEST_LIFETIME_PRICE_ID"],
        ["STRIPE_LIVE_PRO_LIFETIME_PRICE_ID", "STRIPE_LIVE_LIFETIME_PRICE_ID"]
      );
    default:
      return undefined;
  }
}

const PLAN_META: Record<
  string,
  { tier: string }
> = {
  monthly: { tier: "PRO_MONTHLY" },
  annual: { tier: "PRO_ANNUAL" },
  export: { tier: "EXPORT" },
  lifetime: { tier: "LIFETIME" },
};

/**
 * planType: `monthly` | `annual` | `export` | `lifetime`
 *
 * - Test vs live **price IDs** follow NODE_ENV when there is no Stripe subscription yet.
 * - With an existing `stripeSubscriptionId`, mode is detected by which API key can retrieve
 *   the subscription (Stripe ids are always `sub_…`, not `sub_test_`).
 * - Updating an existing **recurring** subscription uses `subscriptions.update` + proration
 *   (Stripe Checkout `sessions.create` does not support `subscription` on create).
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string } | undefined)?.id;
    const userEmail = session?.user?.email;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let planType: string | undefined;
    try {
      const body = await req.json();
      planType =
        typeof body?.planType === "string" ? body.planType.toLowerCase() : undefined;
      // Back-compat with previous API
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

    /** Price-ID mode: NODE_ENV when no sub; else derived from Stripe retrieve probe. */
    let priceMode: StripeMode =
      process.env.NODE_ENV === "production" ? "live" : "test";
    if (currentSubscription?.stripeSubscriptionId) {
      const resolved = await resolveStripeForSubscriptionId(
        currentSubscription.stripeSubscriptionId
      );
      if (resolved) {
        priceMode = resolved.mode;
      }
    }

    const priceId = resolvePlanPriceId(planType, priceMode);
    if (!priceId) {
      return NextResponse.json(
        { error: "Price ID not configured for this mode" },
        { status: 500 }
      );
    }

    const baseUrl =
      process.env.NEXTAUTH_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
      "http://localhost:3000";

    const targetPlan = PLAN_META[planType]!;

    const upgradeFromPlan = currentSubscription?.plan ?? "";
    const upgradeFromInterval = currentSubscription?.planInterval ?? "";

    // Existing Stripe subscription: recurring plan changes → proration (not Checkout update)
    if (
      currentSubscription?.stripeSubscriptionId &&
      (planType === "monthly" || planType === "annual")
    ) {
      const resolved = await resolveStripeForSubscriptionId(
        currentSubscription.stripeSubscriptionId
      );
      if (!resolved) {
        return NextResponse.json(
          {
            error:
              "Could not load subscription in Stripe. Set STRIPE_TEST_SECRET_KEY and STRIPE_LIVE_SECRET_KEY if needed.",
          },
          { status: 400 }
        );
      }

      try {
        const { paymentUrl, message } = await applySubscriptionProrationPriceChange(
          resolved.stripe,
          currentSubscription.stripeSubscriptionId,
          priceId
        );

        return NextResponse.json({
          url: paymentUrl,
          success: true,
          message,
          stripeMode: resolved.mode,
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

    const stripe = getStripe();

    const webhookPlanType =
      planType === "monthly"
        ? "pro_monthly"
        : planType === "annual"
          ? "pro_annual"
          : planType === "lifetime"
            ? "pro_lifetime"
            : "one_time_export";

    // New checkout (no existing sub, or export/lifetime)
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
