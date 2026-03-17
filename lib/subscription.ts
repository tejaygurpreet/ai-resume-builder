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
      exportsUsed: subscription?.exportsUsed ?? 0,
      oneTimeExport: subscription?.oneTimeExport ?? false,
    };
  }

  const isActive =
    subscription.status === "active" &&
    subscription.currentPeriodEnd &&
    subscription.currentPeriodEnd > new Date();

  const planConfig = subscription.plan === "pro" ? PLANS.pro : PLANS.free;

  return {
    plan: subscription.plan as "free" | "pro",
    ...planConfig,
    isActive: !!isActive,
    stripeCustomerId: subscription.stripeCustomerId,
    stripeSubscriptionId: subscription.stripeSubscriptionId,
    currentPeriodEnd: subscription.currentPeriodEnd,
    exportsUsed: subscription.exportsUsed,
    oneTimeExport: subscription.oneTimeExport,
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
  if (feature === "exports") {
    if (subscription.plan === "pro") return true;
    if (subscription.oneTimeExport) return true;
    return subscription.exportsUsed < subscription.maxExportsPerMonth;
  }
  return false;
}

/** @deprecated No ads — always returns false */
export function requiresAdsForExport(
  _subscription: Awaited<ReturnType<typeof getUserSubscription>>
) {
  return false;
}
