import { prisma } from "./prisma";
import { PLANS } from "./stripe";

export type SubscriptionSummary = Awaited<ReturnType<typeof getUserSubscription>>;

/**
 * Resolved subscription for feature checks (includes Export Access as non-free).
 */
export async function getUserSubscription(userId: string) {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  if (!subscription) {
    return {
      tier: "FREE" as const,
      plan: "free" as const,
      ...PLANS.free,
      isActive: true,
      exportsUsed: 0,
      oneTimeExport: false,
    };
  }

  const isExportOnly =
    subscription.plan === "export" ||
    !!(subscription.oneTimeExport && subscription.plan !== "pro");

  if (isExportOnly) {
    return {
      tier: "EXPORT" as const,
      plan: "export" as const,
      ...PLANS.free,
      maxExportsPerMonth: Number.POSITIVE_INFINITY,
      aiGenerationsPerResume: 0,
      adsBeforeExport: false,
      isActive: true,
      exportsUsed: subscription.exportsUsed,
      oneTimeExport: subscription.oneTimeExport,
      stripeCustomerId: subscription.stripeCustomerId,
      stripeSubscriptionId: subscription.stripeSubscriptionId,
      currentPeriodEnd: subscription.currentPeriodEnd,
    };
  }

  if (subscription.plan !== "pro") {
    return {
      tier: "FREE" as const,
      plan: "free" as const,
      ...PLANS.free,
      isActive: true,
      exportsUsed: subscription.exportsUsed,
      oneTimeExport: subscription.oneTimeExport,
    };
  }

  const isLifetimePro = !subscription.stripeSubscriptionId;
  const isActive =
    subscription.status === "active" &&
    (isLifetimePro ||
      (!!subscription.currentPeriodEnd &&
        subscription.currentPeriodEnd > new Date()));

  const interval = (subscription.planInterval ?? "").toLowerCase();
  const tier =
    isLifetimePro
      ? ("PRO_LIFETIME" as const)
      : interval === "annual" || interval === "yearly"
        ? ("PRO_ANNUAL" as const)
        : ("PRO_MONTHLY" as const);

  return {
    tier,
    plan: "pro" as const,
    ...PLANS.pro,
    isActive: !!isActive,
    stripeCustomerId: subscription.stripeCustomerId,
    stripeSubscriptionId: subscription.stripeSubscriptionId,
    currentPeriodEnd: subscription.currentPeriodEnd,
    exportsUsed: subscription.exportsUsed,
    oneTimeExport: subscription.oneTimeExport,
    planInterval: subscription.planInterval,
  };
}

export function canUseFeature(
  subscription: SubscriptionSummary,
  feature: "ai" | "templates" | "exports",
  currentCount?: number
) {
  if (subscription.tier === "EXPORT") {
    if (feature === "ai") return false;
    if (feature === "templates")
      return currentCount === undefined || currentCount < PLANS.free.templates;
    if (feature === "exports") return true;
    return false;
  }

  if (feature === "ai") {
    if (subscription.plan === "pro" && subscription.isActive) return true;
    return subscription.aiGenerationsPerResume === Number.POSITIVE_INFINITY
      ? true
      : currentCount === undefined ||
          currentCount < subscription.aiGenerationsPerResume;
  }
  if (feature === "templates")
    return (
      currentCount === undefined || currentCount < subscription.templates
    );
  if (feature === "exports") {
    if (subscription.plan === "pro" && subscription.isActive) return true;
    return subscription.exportsUsed < subscription.maxExportsPerMonth;
  }
  return false;
}

/** Free tier shows ad gate before export. */
export function requiresAdsForExport(subscription: SubscriptionSummary): boolean {
  return subscription.tier === "FREE";
}
