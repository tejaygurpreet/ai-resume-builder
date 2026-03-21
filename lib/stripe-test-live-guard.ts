/**
 * Prevent test-mode Stripe subscriptions from being used on live deployments.
 * Real Stripe test `sub_*` IDs usually look like live IDs — detection uses key probe when
 * STRIPE_TEST_SECRET_KEY + STRIPE_LIVE_SECRET_KEY are both set, plus optional ID heuristics.
 */

import type { PrismaClient } from "@prisma/client";
import { resolveStripeForSubscriptionId } from "@/lib/stripe-subscription-mode";

/** Live deployment: explicit live secret key or Next production build. */
export function isDeploymentStripeLiveMode(): boolean {
  const live = process.env.STRIPE_LIVE_SECRET_KEY?.trim();
  if (live?.startsWith("sk_live")) return true;
  if (process.env.NODE_ENV === "production") return true;
  return false;
}

/** Narrow string hints (Stripe does not put "test" in real sub ids by default). */
export function subscriptionIdHasTestLikeMarker(stripeSubscriptionId: string): boolean {
  const id = stripeSubscriptionId.trim();
  if (!id) return false;
  if (id.startsWith("sub_1test")) return true;
  if (id.toLowerCase().includes("test")) return true;
  return false;
}

export type TestSubInLiveDetection =
  | { isTestSubscriptionInLive: false }
  | {
      isTestSubscriptionInLive: true;
      reason: "id_heuristic" | "stripe_probe_test_mode";
    };

/**
 * If we're on a live deployment and this subscription id is clearly test data, flag it.
 */
export async function detectTestStripeSubscriptionInLiveDeployment(
  stripeSubscriptionId: string | null | undefined
): Promise<TestSubInLiveDetection> {
  if (!stripeSubscriptionId?.trim() || !isDeploymentStripeLiveMode()) {
    return { isTestSubscriptionInLive: false };
  }
  const id = stripeSubscriptionId.trim();

  if (subscriptionIdHasTestLikeMarker(id)) {
    return { isTestSubscriptionInLive: true, reason: "id_heuristic" };
  }

  const resolved = await resolveStripeForSubscriptionId(id);
  if (resolved?.mode === "test") {
    return { isTestSubscriptionInLive: true, reason: "stripe_probe_test_mode" };
  }

  return { isTestSubscriptionInLive: false };
}

/** Clear Stripe linkage and reset to free after test-data cleanup. */
export async function autoCleanTestStripeSubscriptionRow(
  prisma: PrismaClient,
  userId: string
): Promise<void> {
  await prisma.subscription.update({
    where: { userId },
    data: {
      stripeSubscriptionId: null,
      stripeCustomerId: null,
      stripePriceId: null,
      plan: "free",
      planInterval: null,
      status: "canceled",
      oneTimeExport: false,
    },
  });
}
