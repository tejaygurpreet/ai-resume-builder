import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStripeClientForMode } from "@/lib/stripe-config";
import { getRuntimeStripeMode } from "@/lib/stripe-prices";
import { resolveStripeForSubscriptionId } from "@/lib/stripe-subscription-mode";

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
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string } | undefined)?.id;

    if (!userId) {
      return NextResponse.json(FREE_SUBSCRIPTION);
    }

    const subscription = await prisma.subscription.findFirst({
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
      } catch {
        /* optional: DB row is enough for pricing */
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
