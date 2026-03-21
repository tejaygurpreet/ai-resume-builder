import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStripeClientForMode } from "@/lib/stripe-config";
import { getRuntimeStripeMode } from "@/lib/stripe-prices";
import { resolveStripeForSubscriptionId } from "@/lib/stripe-subscription-mode";
import {
  autoCleanTestStripeSubscriptionRow,
  detectTestStripeSubscriptionInLiveDeployment,
} from "@/lib/stripe-test-live-guard";

const FREE_SUBSCRIPTION = {
  plan: "free",
  planInterval: null as string | null,
  stripeSubscriptionId: null as string | null,
  oneTimeExport: false,
  currentPeriodEnd: null as string | null,
  status: "active",
};

/**
 * GET /api/user/subscription
 * Billing snapshot for pricing / plan UI. On failure, returns 200 + free-shaped body (never throws).
 * Live deployment: auto-cleans rows whose Stripe subscription resolves as test-mode data.
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string } | undefined)?.id;

    if (!userId) {
      return NextResponse.json(FREE_SUBSCRIPTION);
    }

    const subscription = await prisma.subscription.findUnique({
      where: { userId },
      select: {
        plan: true,
        planInterval: true,
        stripeSubscriptionId: true,
        oneTimeExport: true,
        currentPeriodEnd: true,
        status: true,
      },
    });

    if (!subscription) {
      return NextResponse.json(FREE_SUBSCRIPTION);
    }

    if (subscription.stripeSubscriptionId) {
      const testInLive = await detectTestStripeSubscriptionInLiveDeployment(
        subscription.stripeSubscriptionId
      );
      if (testInLive.isTestSubscriptionInLive) {
        console.warn(
          `[GET /api/user/subscription] Test Stripe subscription in live deployment for user ${userId}: ${subscription.stripeSubscriptionId} (reason: ${testInLive.reason}). Auto-cleaning DB row.`
        );
        await autoCleanTestStripeSubscriptionRow(prisma, userId);
        return NextResponse.json({
          ...FREE_SUBSCRIPTION,
          status: "canceled",
        });
      }
    }

    let plan = subscription.plan;
    let planInterval = subscription.planInterval;
    const stripeSubscriptionId = subscription.stripeSubscriptionId;
    const oneTimeExport = subscription.oneTimeExport;
    let currentPeriodEnd = subscription.currentPeriodEnd;
    let status = subscription.status;

    if (stripeSubscriptionId) {
      try {
        const resolved = await resolveStripeForSubscriptionId(
          stripeSubscriptionId
        );
        let stripe = resolved?.stripe;
        if (!stripe) {
          try {
            stripe = getStripeClientForMode(getRuntimeStripeMode());
          } catch {
            stripe = undefined;
          }
        }
        if (stripe) {
          const sub = await stripe.subscriptions.retrieve(stripeSubscriptionId);
          status =
            sub.status === "trialing" || sub.status === "active"
              ? "active"
              : sub.status;
          if (sub.current_period_end) {
            currentPeriodEnd = new Date(sub.current_period_end * 1000);
          }
        }
      } catch (e) {
        console.warn(
          "[GET /api/user/subscription] Stripe subscriptions.retrieve skipped:",
          e instanceof Error ? e.message : e
        );
      }
    }

    return NextResponse.json({
      plan,
      planInterval,
      stripeSubscriptionId,
      oneTimeExport,
      currentPeriodEnd: currentPeriodEnd?.toISOString() || null,
      status,
    });
  } catch (e) {
    console.error("[GET /api/user/subscription]", e);
    return NextResponse.json(FREE_SUBSCRIPTION);
  }
}
