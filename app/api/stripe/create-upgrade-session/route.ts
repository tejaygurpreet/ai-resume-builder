import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { runSubscriptionIntervalScheduleUpgrade } from "@/lib/stripe-plan-interval-upgrade";

/**
 * Pro Monthly ↔ Pro Annual schedule upgrade using the correct Stripe mode (test vs live)
 * for the user’s existing subscription. Same behavior as POST /api/stripe/change-plan.
 *
 * Stripe subscription ids use `sub_…` in both test and live; mode is resolved by probing
 * STRIPE_SECRET_KEY_TEST / STRIPE_SECRET_KEY_LIVE / STRIPE_SECRET_KEY.
 *
 * This route does not create a new Checkout subscription — it updates the subscription
 * schedule. Returns JSON (no hosted checkout URL) unless we add invoice collection later.
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "You must be logged in to upgrade" },
        { status: 401 }
      );
    }

    const userId = (session.user as { id?: string }).id;
    if (!userId) {
      return NextResponse.json(
        { error: "Session missing user id. Please sign in again." },
        { status: 401 }
      );
    }

    let interval: "annual" | "monthly" = "annual";
    try {
      const body = await req.json();
      if (body?.interval === "monthly" || body?.interval === "annual") {
        interval = body.interval;
      }
    } catch {
      /* empty body → default annual */
    }

    const result = await runSubscriptionIntervalScheduleUpgrade({
      userId,
      interval,
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({
      success: true,
      url: null as string | null,
      scheduled: true,
      message: result.message,
      stripeMode: result.stripeMode,
      currentPeriodEnd: result.currentPeriodEnd,
    });
  } catch (err) {
    console.error("create-upgrade-session error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Upgrade failed" },
      { status: 500 }
    );
  }
}
