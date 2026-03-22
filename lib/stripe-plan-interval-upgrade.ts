import { prisma } from "@/lib/prisma";
import {
  getProAnnualPriceIdForStripeMode,
  getProMonthlyPriceIdForStripeMode,
} from "@/lib/stripe-prices";
import {
  applySubscriptionProrationPriceChange,
  resolveUpgradePaymentUrl,
} from "@/lib/stripe-subscription-proration-upgrade";
import {
  resolveStripeForSubscriptionId,
  type StripeMode,
} from "@/lib/stripe-subscription-mode";

export type IntervalUpgradeResult =
  | {
      ok: true;
      stripeMode: StripeMode;
      currentPeriodEnd: string;
      /** Stripe Checkout or hosted invoice URL — always set when ok. */
      url: string;
    }
  | {
      ok: false;
      status: number;
      error: string;
      /** Client should open new-subscription checkout for this interval. */
      fallbackNewSubscription?: boolean;
    };

function dualKeysConfigured(): boolean {
  const test =
    process.env.STRIPE_TEST_SECRET_KEY?.trim() ||
    process.env.STRIPE_SECRET_KEY_TEST?.trim();
  const live =
    process.env.STRIPE_LIVE_SECRET_KEY?.trim() ||
    process.env.STRIPE_SECRET_KEY_LIVE?.trim();
  return !!(test && live);
}

/**
 * Pro Monthly ↔ Pro Annual on the Stripe account (test vs live) that owns the subscription.
 * Uses subscription.update + proration; returns a payment URL when Stripe leaves an open invoice.
 */
export async function runSubscriptionIntervalScheduleUpgrade(params: {
  userId: string;
  interval: "annual" | "monthly";
}): Promise<IntervalUpgradeResult> {
  const { userId, interval } = params;

  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  if (!subscription) {
    return {
      ok: false,
      status: 400,
      error: "No subscription record found.",
    };
  }

  if (subscription.plan !== "pro") {
    return {
      ok: false,
      status: 400,
      error: "No active Pro subscription found to change.",
    };
  }

  if (!subscription.stripeSubscriptionId) {
    return {
      ok: false,
      status: 400,
      error:
        "No Stripe subscription on file. Use checkout to subscribe or upgrade from Free/Export.",
      fallbackNewSubscription: true,
    };
  }

  if (subscription.planInterval === "lifetime") {
    return {
      ok: false,
      status: 400,
      error: "You already have Lifetime Pro.",
    };
  }

  const planInt = (subscription.planInterval ?? "").toLowerCase();

  if (interval === "annual") {
    if (planInt === "annual" || planInt === "yearly") {
      return {
        ok: false,
        status: 400,
        error: "You are already on the Annual plan.",
      };
    }
  }

  if (interval === "monthly") {
    if (planInt === "monthly") {
      return {
        ok: false,
        status: 400,
        error: "You are already on the Monthly plan.",
      };
    }
    if (planInt !== "annual" && planInt !== "yearly") {
      return {
        ok: false,
        status: 400,
        error:
          "You can only switch to Monthly billing from an Annual subscription.",
      };
    }
  }

  const resolved = await resolveStripeForSubscriptionId(
    subscription.stripeSubscriptionId
  );

  if (!resolved) {
    return {
      ok: false,
      status: 400,
      error: dualKeysConfigured()
        ? "Could not load this subscription in Stripe. Check that the subscription id matches your test or live account."
        : "Subscription not found with the configured Stripe keys. Set STRIPE_TEST_SECRET_KEY and STRIPE_LIVE_SECRET_KEY (plus STRIPE_TEST_* / STRIPE_LIVE_* price IDs) if subscriptions may exist in either account.",
    };
  }

  const targetPriceId =
    interval === "annual"
      ? getProAnnualPriceIdForStripeMode(resolved.mode)
      : getProMonthlyPriceIdForStripeMode(resolved.mode);

  if (!targetPriceId) {
    return {
      ok: false,
      status: 500,
      error:
        interval === "annual"
          ? `Annual price not configured for ${resolved.mode} mode (STRIPE_${resolved.mode === "test" ? "TEST" : "LIVE"}_PRO_ANNUAL_PRICE_ID or STRIPE_PRO_ANNUAL_PRICE_ID).`
          : `Monthly price not configured for ${resolved.mode} mode.`,
    };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.NEXTAUTH_URL?.trim() ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "") ||
    "http://localhost:3000";

  try {
    const { subscription: updated, invoice } =
      await applySubscriptionProrationPriceChange(
        resolved.stripe,
        subscription.stripeSubscriptionId,
        targetPriceId
      );

    const url = await resolveUpgradePaymentUrl({
      stripe: resolved.stripe,
      subscription: updated,
      invoice,
      baseUrl,
      userId,
      userEmail: user?.email ?? null,
    });

    return {
      ok: true,
      stripeMode: resolved.mode,
      currentPeriodEnd: new Date(
        updated.current_period_end * 1000
      ).toISOString(),
      url,
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to change plan";
    console.error("[runSubscriptionIntervalScheduleUpgrade]", {
      userId,
      stripeSubscriptionId: subscription.stripeSubscriptionId,
      stripeMode: resolved.mode,
      interval,
      error: msg,
    });
    return {
      ok: false,
      status: 500,
      error: msg,
    };
  }
}
