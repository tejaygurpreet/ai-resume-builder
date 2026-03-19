import type { Subscription } from "@prisma/client";

/**
 * Active Pro: plan pro + (lifetime OR active subscription with valid period).
 */
export function isActiveProSubscription(
  sub: Pick<
    Subscription,
    "plan" | "status" | "stripeSubscriptionId" | "currentPeriodEnd"
  > | null
): boolean {
  if (!sub || sub.plan !== "pro") return false;
  if (!sub.stripeSubscriptionId) return true; // Lifetime
  if (sub.status !== "active") return false;
  if (!sub.currentPeriodEnd) return true;
  return sub.currentPeriodEnd > new Date();
}

/** Export Access: paid one-time export, not Pro — unlimited export, no AI. */
export function isExportOnlyAccess(
  sub: Pick<Subscription, "plan" | "oneTimeExport"> | null
): boolean {
  return !!(sub?.oneTimeExport && sub.plan !== "pro");
}

/**
 * Export-only users must not use any AI (unlimited export only).
 * Free + Pro may call AI routes (free tier enforces per-resume limits in each route).
 */
export function isAiBlockedForExportOnly(
  sub: Pick<Subscription, "plan" | "oneTimeExport"> | null
): boolean {
  return isExportOnlyAccess(sub);
}

export type MembershipDisplay =
  | "free"
  | "export"
  | "pro_monthly"
  | "pro_annual"
  | "pro_lifetime";

export function getMembershipDisplay(
  sub: Pick<
    Subscription,
    | "plan"
    | "planInterval"
    | "status"
    | "stripeSubscriptionId"
    | "currentPeriodEnd"
    | "oneTimeExport"
  > | null
): MembershipDisplay {
  if (!sub) return "free";
  if (isExportOnlyAccess(sub)) return "export";
  if (!isActiveProSubscription(sub)) return "free";
  if (!sub.stripeSubscriptionId) return "pro_lifetime";
  const interval = (sub.planInterval ?? "").toLowerCase();
  if (interval === "annual" || interval === "yearly") return "pro_annual";
  return "pro_monthly";
}
