import type { Subscription } from "@prisma/client";

/**
 * Active Pro: plan pro + (lifetime OR active subscription with valid period).
 */
export function isActiveProSubscription(
  sub: Pick<
    Subscription,
    | "plan"
    | "status"
    | "stripeSubscriptionId"
    | "currentPeriodEnd"
    | "planInterval"
  > | null
): boolean {
  if (!sub || sub.plan !== "pro") return false;
  if (!sub.stripeSubscriptionId) return true; // Lifetime
  const st = (sub.status ?? "").toLowerCase();
  if (st !== "active" && st !== "trialing") return false;

  if (sub.currentPeriodEnd) {
    const end =
      sub.currentPeriodEnd instanceof Date
        ? sub.currentPeriodEnd
        : new Date(sub.currentPeriodEnd);
    if (!Number.isNaN(end.getTime()) && end > new Date()) return true;
    // Expired period → not active (unless interval fallback below)
    if (!Number.isNaN(end.getTime()) && end <= new Date()) return false;
  }

  // Recurring Pro with interval set but period end missing / invalid (webhook ordering, clock skew).
  // Avoid treating arbitrary `plan=pro` rows without interval as active (reduces “ghost Pro”).
  const pi = (sub.planInterval ?? "").toLowerCase();
  return pi === "monthly" || pi === "annual" || pi === "yearly";
}

/** Export Access: `plan === "export"` (new) or legacy `oneTimeExport` on free plan. */
export function isExportOnlyAccess(
  sub: Pick<Subscription, "plan" | "oneTimeExport"> | null
): boolean {
  if (!sub) return false;
  if (sub.plan === "export") return true;
  return !!(sub.oneTimeExport && sub.plan !== "pro");
}

/** Unlimited exports: Pro or Export Access (including legacy one-time flag). */
export function hasUnlimitedExports(
  sub: Pick<Subscription, "plan" | "oneTimeExport"> | null
): boolean {
  if (!sub) return false;
  if (sub.plan === "pro") return true;
  return isExportOnlyAccess(sub);
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
