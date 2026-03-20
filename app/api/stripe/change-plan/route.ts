import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { runSubscriptionIntervalScheduleUpgrade } from "@/lib/stripe-plan-interval-upgrade";

/**
 * Pro Monthly ↔ Annual: prorated subscription item update on the correct Stripe account (test vs live).
 * May return `url` (hosted invoice) when Stripe requires payment to finalize the change.
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "You must be logged in to change your plan" },
        { status: 401 }
      );
    }

    const { interval } = await req.json();
    if (interval !== "annual" && interval !== "monthly" && interval !== "lifetime") {
      return NextResponse.json(
        { error: "Invalid interval. Use 'annual', 'monthly', or 'lifetime'." },
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

    if (interval === "lifetime") {
      return NextResponse.json(
        {
          error: "Use the pricing page to purchase Lifetime. It will replace your current plan.",
          useCheckout: true,
        },
        { status: 400 }
      );
    }

    const result = await runSubscriptionIntervalScheduleUpgrade({
      userId,
      interval,
    });

    if (!result.ok) {
      return NextResponse.json(
        {
          error: result.error,
          ...(result.fallbackNewSubscription && {
            fallbackNewSubscription: true,
          }),
        },
        { status: result.status }
      );
    }

    return NextResponse.json({
      success: true,
      url: result.url,
      message: result.message,
      stripeMode: result.stripeMode,
      currentPeriodEnd: result.currentPeriodEnd,
    });
  } catch (err) {
    console.error("Stripe change-plan error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to change plan" },
      { status: 500 }
    );
  }
}
