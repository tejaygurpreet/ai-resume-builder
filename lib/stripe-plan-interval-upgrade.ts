import { prisma } from "@/lib/prisma";
import {
  getProAnnualPriceIdForStripeMode,
  getProMonthlyPriceIdForStripeMode,
} from "@/lib/stripe-prices";
import { applySubscriptionScheduleIntervalChange } from "@/lib/stripe-schedule-interval-change";
import {
  resolveStripeForSubscriptionId,
  type StripeMode,
} from "@/lib/stripe-subscription-mode";

export type IntervalUpgradeResult =
  | {
      ok: true;
      message: string;
      stripeMode: StripeMode;
      currentPeriodEnd: string;
    }
  | { ok: false; status: number; error: string };

/**
 * Validates DB state and schedules monthly↔annual change on the Stripe account
 * that owns the subscription (test vs live).
 */
export async function runSubscriptionIntervalScheduleUpgrade(params: {
  userId: string;
  interval: "annual" | "monthly";
}): Promise<IntervalUpgradeResult> {
  const { userId, interval } = params;

  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  if (!subscription?.stripeSubscriptionId || subscription.plan !== "pro") {
    return {
      ok: false,
      status: 400,
      error: "No active Pro subscription found to change.",
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
    const hasDual =
      !!process.env.STRIPE_SECRET_KEY_TEST?.trim() &&
      !!process.env.STRIPE_SECRET_KEY_LIVE?.trim();
    return {
      ok: false,
      status: 400,
      error: hasDual
        ? "Could not load this subscription in Stripe. Check that the subscription id matches your test or live account."
        : "Subscription not found with the configured Stripe key. If this user subscribed in the other mode, set STRIPE_SECRET_KEY_TEST and STRIPE_SECRET_KEY_LIVE (and matching price IDs) so both can be tried.",
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
          ? `Annual plan is not configured for ${resolved.mode} mode (set STRIPE_${resolved.mode === "test" ? "TEST" : "LIVE"}_PRO_ANNUAL_PRICE_ID or STRIPE_PRO_ANNUAL_PRICE_ID).`
          : `Monthly plan is not configured for ${resolved.mode} mode.`,
    };
  }

  try {
    const { currentPeriodEnd } = await applySubscriptionScheduleIntervalChange(
      resolved.stripe,
      subscription.stripeSubscriptionId,
      targetPriceId
    );

    const message =
      interval === "annual"
        ? "Your plan will switch to Annual at the end of your current billing period."
        : "Your plan will switch to Monthly at the end of your current billing period.";

    return {
      ok: true,
      message,
      stripeMode: resolved.mode,
      currentPeriodEnd: new Date(currentPeriodEnd * 1000).toISOString(),
    };
  } catch (e) {
    return {
      ok: false,
      status: 500,
      error: e instanceof Error ? e.message : "Failed to change plan",
    };
  }
}
