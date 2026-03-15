import { prisma } from "./prisma";
import { PLANS } from "./stripe";

export async function getUserSubscription(userId: string) {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  if (!subscription || subscription.plan === "free") {
    return {
      plan: "free" as const,
      ...PLANS.free,
      isActive: true,
    };
  }

  const isActive =
    subscription.status === "active" &&
    subscription.currentPeriodEnd &&
    subscription.currentPeriodEnd > new Date();

  return {
    plan: subscription.plan as "free" | "pro",
    ...PLANS[subscription.plan as keyof typeof PLANS],
    isActive: !!isActive,
    stripeCustomerId: subscription.stripeCustomerId,
    stripeSubscriptionId: subscription.stripeSubscriptionId,
    currentPeriodEnd: subscription.currentPeriodEnd,
  };
}

export function canUseFeature(
  subscription: Awaited<ReturnType<typeof getUserSubscription>>,
  feature: "ai" | "templates" | "exports",
  currentCount?: number
) {
  if (feature === "ai") return true;
  if (feature === "templates")
    return currentCount === undefined || currentCount < subscription.templates;
  if (feature === "exports") return subscription.plan === "pro";
  return false;
}

export function requiresAdsForExport(
  subscription: Awaited<ReturnType<typeof getUserSubscription>>
) {
  return subscription.plan === "free";
}
