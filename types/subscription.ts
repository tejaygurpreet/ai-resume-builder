/**
 * High-level tiers for UI (maps to DB: plan + planInterval + oneTimeExport).
 */
export type SubscriptionTier =
  | "FREE"
  | "EXPORT"
  | "PRO_MONTHLY"
  | "PRO_ANNUAL"
  | "PRO_LIFETIME";

/** Mirrors pricing page `ActivePlan` / OptimaCV product cards. */
export type ActivePlanSlug =
  | "free"
  | "one_time_export"
  | "pro_monthly"
  | "pro_annual"
  | "pro_lifetime";

export function activePlanToTier(active: ActivePlanSlug): SubscriptionTier {
  switch (active) {
    case "free":
      return "FREE";
    case "one_time_export":
      return "EXPORT";
    case "pro_monthly":
      return "PRO_MONTHLY";
    case "pro_annual":
      return "PRO_ANNUAL";
    case "pro_lifetime":
      return "PRO_LIFETIME";
    default:
      return "FREE";
  }
}

export function tierIsPaid(tier: SubscriptionTier): boolean {
  return tier !== "FREE";
}
