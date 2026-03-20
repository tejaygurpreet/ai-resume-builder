import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { runSubscriptionIntervalScheduleUpgrade } from "@/lib/stripe-plan-interval-upgrade";

function intervalFromBody(
  interval: unknown,
  targetPlan: unknown
): "annual" | "monthly" | null {
  if (interval === "annual" || interval === "monthly") return interval;
  if (targetPlan === "ANNUAL") return "annual";
  if (targetPlan === "MONTHLY") return "monthly";
  return null;
}

/**
 * Pro Monthly ↔ Pro Annual upgrade/downgrade.
 *
 * **Mode detection (not NODE_ENV):** `resolveStripeForSubscriptionId` in lib/stripe-subscription-mode.ts
 * tries STRIPE_TEST_SECRET_KEY then STRIPE_LIVE_SECRET_KEY (then STRIPE_SECRET_KEY) until
 * `subscriptions.retrieve` succeeds, then uses STRIPE_TEST_* / STRIPE_LIVE_* price IDs for that mode.
 *
 * New checkout & webhooks use NODE_ENV via lib/stripe-env.ts + lib/stripe-prices.ts.
 *
 * Body: `{ "interval": "annual" | "monthly" }` or `{ "targetPlan": "ANNUAL" | "MONTHLY" }`
 */
export async function POST(req: Request) {
  let userId: string | undefined;
  let stripeSubscriptionId: string | null | undefined;

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "You must be logged in to upgrade" },
        { status: 401 }
      );
    }

    userId = (session.user as { id?: string }).id;
    if (!userId) {
      return NextResponse.json(
        { error: "Session missing user id. Please sign in again." },
        { status: 401 }
      );
    }

    let body: Record<string, unknown> = {};
    try {
      body = await req.json();
    } catch {
      /* default annual */
    }

    const interval = intervalFromBody(body.interval, body.targetPlan) ?? "annual";

    const subRow = await prisma.subscription.findUnique({
      where: { userId },
      select: { stripeSubscriptionId: true, plan: true, planInterval: true },
    });
    stripeSubscriptionId = subRow?.stripeSubscriptionId ?? undefined;

    const result = await runSubscriptionIntervalScheduleUpgrade({
      userId,
      interval,
    });

    if (!result.ok) {
      console.error("[create-upgrade-session] failed", {
        userId,
        stripeSubscriptionId,
        interval,
        error: result.error,
        fallbackNewSubscription: result.fallbackNewSubscription,
      });
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          ...(result.fallbackNewSubscription && {
            fallbackNewSubscription: true,
            interval,
          }),
        },
        { status: result.status }
      );
    }

    return NextResponse.json({
      success: true,
      url: result.url,
      scheduled: false,
      proration: true,
      message: result.message,
      stripeMode: result.stripeMode,
      currentPeriodEnd: result.currentPeriodEnd,
      metadata: {
        targetTier: interval === "annual" ? "PRO_ANNUAL" : "PRO_MONTHLY",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upgrade failed";
    console.error("[create-upgrade-session] exception", {
      userId,
      stripeSubscriptionId,
      error: message,
    });
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
