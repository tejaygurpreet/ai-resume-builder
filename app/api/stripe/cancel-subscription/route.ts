import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getStripeOrNull } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import {
  autoCleanTestStripeSubscriptionRow,
  detectTestStripeSubscriptionInLiveDeployment,
} from "@/lib/stripe-test-live-guard";

/**
 * Cancel subscription at period end. Does not support Lifetime or Export-only.
 */
export async function POST() {
  try {
    const stripe = getStripeOrNull();
    if (!stripe) {
      return NextResponse.json(
        { error: "Payment system is not configured." },
        { status: 503 }
      );
    }
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "You must be logged in to cancel" },
        { status: 401 }
      );
    }

    const userId = (session.user as { id?: string }).id;
    if (!userId) {
      return NextResponse.json(
        { error: "Invalid session" },
        { status: 401 }
      );
    }

    const subscription = await prisma.subscription.findUnique({
      where: { userId },
    });

    if (!subscription) {
      return NextResponse.json(
        { error: "No subscription found" },
        { status: 400 }
      );
    }

    if (!subscription.stripeSubscriptionId) {
      return NextResponse.json(
        { error: "Lifetime and Export plans cannot be cancelled through this flow." },
        { status: 400 }
      );
    }

    if (subscription.plan !== "pro") {
      return NextResponse.json(
        { error: "No recurring Pro subscription to cancel." },
        { status: 400 }
      );
    }

    const testInLive = await detectTestStripeSubscriptionInLiveDeployment(
      subscription.stripeSubscriptionId
    );
    if (testInLive.isTestSubscriptionInLive) {
      console.warn(
        `[cancel-subscription] Test Stripe subscription in live deployment for user ${userId} (${testInLive.reason}). Auto-cleaning instead of Stripe update.`
      );
      await autoCleanTestStripeSubscriptionRow(prisma, userId);
      return NextResponse.json({
        success: true,
        message:
          "Test-mode billing was cleared on this account. There is nothing to cancel in live Stripe.",
      });
    }

    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    return NextResponse.json({
      success: true,
      message: "Your subscription will cancel at the end of your current billing period. You will keep access until then.",
    });
  } catch (err) {
    console.error("Cancel subscription error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to cancel" },
      { status: 500 }
    );
  }
}
