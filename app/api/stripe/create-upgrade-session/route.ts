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
  isConfiguredProRecurringPriceId,
  isStripePriceDebugEnabled,
  logStripePlanPriceMissing,
  logStripePlanPriceResolved,
} from "@/lib/stripe-prices";
import {
  detectTestStripeSubscriptionInLiveDeployment,
  isDeploymentStripeLiveMode,
} from "@/lib/stripe-test-live-guard";

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

function getSiteBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.NEXTAUTH_URL?.trim() ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "") ||
    "http://localhost:3000"
  );
}

/**
 * POST /api/stripe/create-upgrade-session
 *
 * **Upgrade with body `{ newPriceId }`:** requires an active row with `stripeSubscriptionId`.
 * Uses `subscriptions.update` + proration (Stripe Checkout cannot swap an existing sub’s price
 * the way `subscription_data` on `sessions.create` suggests — that only applies to *new* subs).
 *
 * **Otherwise** accepts `planType` / `interval` for new checkouts and legacy flows (free → Pro, etc.).
 */
export async function POST(req: Request) {
  try {
    const authSession = await getServerSession(authOptions);
    const userId = (authSession?.user as { id?: string } | undefined)?.id;
    const userEmail = authSession?.user?.email;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: Record<string, unknown> = {};
    try {
      body = (await req.json()) as Record<string, unknown>;
    } catch {
      body = {};
    }

    console.log("[create-upgrade-session] request", {
      userId,
      bodyKeys: Object.keys(body),
      hasNewPriceId: typeof body.newPriceId === "string" && !!body.newPriceId,
    });

    const newPriceIdRaw =
      typeof body.newPriceId === "string" ? body.newPriceId.trim() : "";

    const currentSubscription = await prisma.subscription.findFirst({
      where: { userId, status: "active" },
    });

    const isLiveMode = isDeploymentStripeLiveMode();
    console.log(
      `[create-upgrade-session] Upgrade attempt - Mode: ${isLiveMode ? "LIVE" : "TEST"}, User: ${userId}, Sub ID: ${currentSubscription?.stripeSubscriptionId ?? "none"}`
    );

    if (currentSubscription?.stripeSubscriptionId) {
      const testInLive = await detectTestStripeSubscriptionInLiveDeployment(
        currentSubscription.stripeSubscriptionId
      );
      if (testInLive.isTestSubscriptionInLive) {
        console.error(
          `[create-upgrade-session] Refusing upgrade: test subscription in live deployment (${testInLive.reason}) — ${currentSubscription.stripeSubscriptionId}`
        );
        return NextResponse.json(
          {
            error:
              "Cannot upgrade test-mode subscription in live mode. Contact support.",
          },
          { status: 400 }
        );
      }
    }

    console.log("[create-upgrade-session] prisma subscription", {
      userId,
      found: !!currentSubscription,
      plan: currentSubscription?.plan,
      stripeSubscriptionId: currentSubscription?.stripeSubscriptionId ?? null,
    });

    // ── Explicit price upgrade (pricing page sends `newPriceId` for monthly ↔ annual) ──
    if (newPriceIdRaw) {
      if (!currentSubscription?.stripeSubscriptionId) {
        console.warn(
          "[create-upgrade-session] newPriceId but no stripeSubscriptionId"
        );
        return NextResponse.json(
          { error: "No active subscription" },
          { status: 400 }
        );
      }
      if (!isConfiguredProRecurringPriceId(newPriceIdRaw)) {
        return NextResponse.json(
          { error: "Invalid or unknown price id for upgrade" },
          { status: 400 }
        );
      }

      const stripeForExistingSub = await resolveStripeForSubscriptionId(
        currentSubscription.stripeSubscriptionId
      );
      if (!stripeForExistingSub) {
        console.error(
          "[create-upgrade-session] resolveStripeForSubscriptionId failed",
          { stripeSubscriptionId: currentSubscription.stripeSubscriptionId }
        );
        return NextResponse.json(
          {
            error: "Could not load subscription in Stripe",
            hint: "Set STRIPE_TEST_SECRET_KEY and STRIPE_LIVE_SECRET_KEY for the account that owns this subscription.",
          },
          { status: 400 }
        );
      }

      try {
        const { paymentUrl, message } = await applySubscriptionProrationPriceChange(
          stripeForExistingSub.stripe,
          currentSubscription.stripeSubscriptionId,
          newPriceIdRaw
        );

        console.log("[create-upgrade-session] proration result", {
          userId,
          hasPaymentUrl: !!paymentUrl,
          message,
        });

        return NextResponse.json({
          url: paymentUrl,
          success: true,
          message,
          stripeMode: stripeForExistingSub.mode,
          metadata: {
            userId,
            targetTier: "PRO",
            upgradeFromPlan: currentSubscription.plan ?? "",
            upgradeFromInterval: currentSubscription.planInterval ?? "",
            isUpgrade: "true",
          },
        });
      } catch (e) {
        console.error("[create-upgrade-session] Stripe proration error", {
          userId,
          stripeSubscriptionId: currentSubscription.stripeSubscriptionId,
          error: e instanceof Error ? e.message : e,
        });
        return NextResponse.json(
          { error: e instanceof Error ? e.message : "Upgrade failed" },
          { status: 500 }
        );
      }
    }

    // ── Legacy: planType / interval (new checkouts + non–newPriceId upgrades) ──
    let planType: CheckoutPlanType | undefined = normalizePlanType(body?.planType);
    if (!planType && body?.interval === "annual") planType = "annual";
    if (!planType && body?.interval === "monthly") planType = "monthly";
    if (!planType && body?.targetPlan === "ANNUAL") planType = "annual";
    if (!planType && body?.targetPlan === "MONTHLY") planType = "monthly";

    if (!planType || !PLAN_META[planType]) {
      return NextResponse.json(
        {
          error:
            "Invalid request: send newPriceId for upgrades, or planType (monthly, annual, export, lifetime)",
        },
        { status: 400 }
      );
    }

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
              ? "Set STRIPE_TEST_* Pro / export price env vars."
              : "Set STRIPE_LIVE_* or shared STRIPE_PRO_* price env vars.",
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

    const baseUrl = getSiteBaseUrl();
    const targetPlan = PLAN_META[planType]!;
    const upgradeFromPlan = currentSubscription?.plan ?? "";
    const upgradeFromInterval = currentSubscription?.planInterval ?? "";

    if (
      currentSubscription?.stripeSubscriptionId &&
      (planType === "monthly" || planType === "annual")
    ) {
      if (!stripeForExistingSub) {
        return NextResponse.json(
          {
            error: "Could not load subscription in Stripe",
            hint: "Set STRIPE_TEST_SECRET_KEY and STRIPE_LIVE_SECRET_KEY on the server.",
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
            "Stripe is not configured for this checkout mode. Set STRIPE_TEST_SECRET_KEY and/or STRIPE_LIVE_SECRET_KEY.",
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
      ...(!isPayment
        ? {
            subscription_data: {
              metadata: {
                userId,
                userEmail: userEmail ?? "",
                planType: webhookPlanType,
                targetTier: targetPlan.tier,
              },
            },
          }
        : {}),
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
