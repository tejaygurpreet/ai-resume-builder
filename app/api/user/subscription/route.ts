import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStripeClientForMode } from "@/lib/stripe-config";
import { getRuntimeStripeMode } from "@/lib/stripe-prices";
import { resolveStripeForSubscriptionId } from "@/lib/stripe-subscription-mode";

/** Matches `deriveActivePlan` / pricing page subscription state. */
const FREE_SUBSCRIPTION = {
  plan: "free",
  planInterval: null as string | null,
  stripeSubscriptionId: null as string | null,
  oneTimeExport: false,
  currentPeriodEnd: null as string | null,
  status: "active",
};

function toIso(d: Date | null | undefined): string | null {
  if (d == null) return null;
  try {
    return d instanceof Date ? d.toISOString() : new Date(d).toISOString();
  } catch {
    return null;
  }
}

/**
 * GET /api/user/subscription
 * Current user’s billing row for pricing / plan UI. Always 200 on success path;
 * returns free-shaped payload if unauthenticated, missing row, or on unexpected errors.
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string } | undefined)?.id;

    if (!userId) {
      return NextResponse.json(FREE_SUBSCRIPTION);
    }

    const row = await prisma.subscription.findUnique({
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

    if (!row) {
      return NextResponse.json(FREE_SUBSCRIPTION);
    }

    let plan = row.plan;
    let planInterval = row.planInterval;
    const stripeSubscriptionId = row.stripeSubscriptionId;
    let oneTimeExport = row.oneTimeExport;
    let currentPeriodEnd = row.currentPeriodEnd;
    let status = row.status;

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
      currentPeriodEnd: toIso(currentPeriodEnd),
      status,
    });
  } catch (e) {
    console.error("[GET /api/user/subscription]", e);
    return NextResponse.json(FREE_SUBSCRIPTION);
  }
}
