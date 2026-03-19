import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getStripeOrNull, PLANS } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

/**
 * Schedule a subscription upgrade to take effect at the end of the current billing period.
 * Supports: monthly -> annual
 * Does NOT create overlapping subscriptions. Uses Stripe subscription schedules.
 */
export async function POST(req: Request) {
  try {
    const stripe = getStripeOrNull();
    if (!stripe) {
      return NextResponse.json(
        { error: "Payment system is not configured. Please contact support." },
        { status: 503 }
      );
    }
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "You must be logged in to change your plan" },
        { status: 401 }
      );
    }

    const { interval } = await req.json();
    if (interval !== "annual" && interval !== "lifetime") {
      return NextResponse.json(
        { error: "Invalid interval. Use 'annual' or 'lifetime'." },
        { status: 400 }
      );
    }

    const userId = (session.user as { id?: string }).id;
    if (!userId) {
      return NextResponse.json(
        { error: "Session missing user id. Please sign in again." },
        { status: 401 }
      );
    }

    const subscription = await prisma.subscription.findUnique({
      where: { userId },
    });

    if (!subscription?.stripeSubscriptionId || subscription.plan !== "pro") {
      return NextResponse.json(
        { error: "No active Pro subscription found to change." },
        { status: 400 }
      );
    }

    if (subscription.planInterval === "lifetime") {
      return NextResponse.json(
        { error: "You already have Lifetime Pro." },
        { status: 400 }
      );
    }

    if (interval === "annual" && subscription.planInterval === "annual") {
      return NextResponse.json(
        { error: "You are already on the Annual plan." },
        { status: 400 }
      );
    }

    if (interval === "lifetime") {
      return NextResponse.json(
        {
          error: "Use the pricing page to purchase Lifetime. It will replace your current plan.",
          useCheckout: true,
        },
        { status: 400 }
      );
    }

    const annualPriceId = PLANS.pro.stripeAnnualPriceId;
    if (!annualPriceId) {
      return NextResponse.json(
        { error: "Annual plan is not configured." },
        { status: 500 }
      );
    }

    const stripeSubscription = await stripe.subscriptions.retrieve(
      subscription.stripeSubscriptionId,
      { expand: ["schedule"] }
    );

    const currentPeriodEnd = stripeSubscription.current_period_end;
    const now = Math.floor(Date.now() / 1000);

    let scheduleId: string | null = null;

    if (stripeSubscription.schedule) {
      scheduleId =
        typeof stripeSubscription.schedule === "string"
          ? stripeSubscription.schedule
          : stripeSubscription.schedule.id;
    }

    if (!scheduleId) {
      const schedule = await stripe.subscriptionSchedules.create({
        from_subscription: subscription.stripeSubscriptionId,
      });
      scheduleId = schedule.id;
    }

    const schedule = await stripe.subscriptionSchedules.retrieve(scheduleId, {
      expand: ["subscription"],
    });

    const phases = schedule.phases;
    const currentPhase = phases[0];
    if (!currentPhase) {
      return NextResponse.json(
        { error: "Could not read subscription schedule." },
        { status: 500 }
      );
    }

    const phase1Items = currentPhase.items.map((item) => ({
      price: typeof item.price === "string" ? item.price : item.price.id,
      quantity: item.quantity ?? 1,
    }));

    await stripe.subscriptionSchedules.update(scheduleId, {
      phases: [
        {
          items: phase1Items,
          start_date: currentPhase.start_date,
          end_date: currentPeriodEnd,
        },
        {
          items: [{ price: annualPriceId, quantity: 1 }],
          start_date: currentPeriodEnd,
        },
      ],
    });

    return NextResponse.json({
      success: true,
      message: "Your plan will switch to Annual at the end of your current billing period.",
      currentPeriodEnd: new Date(currentPeriodEnd * 1000).toISOString(),
    });
  } catch (err) {
    console.error("Stripe change-plan error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to change plan" },
      { status: 500 }
    );
  }
}
