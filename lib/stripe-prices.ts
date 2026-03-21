/**
 * Stripe Price IDs — subscription upgrades use per-mode IDs from resolveStripeForSubscriptionId;
 * new checkout uses NODE_ENV (test vs live) via getRuntimeStripeMode().
 *
 * Live monthly / export: check STRIPE_LIVE_* first, then shared fallbacks (same pattern as annual/lifetime).
 */

import type { StripeMode } from "@/lib/stripe-subscription-mode";
import { isStripeLiveRuntime } from "@/lib/stripe-env";

export function getRuntimeStripeMode(): StripeMode {
  return isStripeLiveRuntime() ? "live" : "test";
}

/** Plan kinds used for price lookup + logging (matches checkout / upgrade APIs). */
export type StripePlanPriceKind = "monthly" | "annual" | "export" | "lifetime";

function resolveFromKeys(keys: readonly string[]): {
  id: string | null;
  sourceKey: string | null;
} {
  for (const key of keys) {
    const v = process.env[key]?.trim();
    if (v) return { id: v, sourceKey: key };
  }
  return { id: null, sourceKey: null };
}

/** Env var names tried, in order, for each plan × mode (single source of truth). */
const PRICE_ENV_KEYS: Record<
  StripePlanPriceKind,
  Record<StripeMode, readonly string[]>
> = {
  monthly: {
    test: [
      "STRIPE_TEST_PRO_MONTHLY_PRICE_ID",
      "STRIPE_TEST_MONTHLY_PRICE_ID",
      "STRIPE_PRO_MONTHLY_PRICE_ID",
      "STRIPE_PRO_PRICE_ID",
      "STRIPE_MONTHLY_PRICE_ID",
    ],
    live: [
      "STRIPE_LIVE_PRO_MONTHLY_PRICE_ID",
      // Common alternate names (parallel to STRIPE_LIVE_LIFETIME_PRICE_ID–style shortcuts)
      "STRIPE_LIVE_MONTHLY_PRICE_ID",
      "STRIPE_PRO_MONTHLY_PRICE_ID",
      "STRIPE_PRO_PRICE_ID",
      "STRIPE_MONTHLY_PRICE_ID",
    ],
  },
  annual: {
    test: [
      "STRIPE_TEST_PRO_ANNUAL_PRICE_ID",
      "STRIPE_PRO_ANNUAL_PRICE_ID",
    ],
    live: [
      "STRIPE_LIVE_PRO_ANNUAL_PRICE_ID",
      "STRIPE_PRO_ANNUAL_PRICE_ID",
    ],
  },
  lifetime: {
    test: [
      "STRIPE_TEST_PRO_LIFETIME_PRICE_ID",
      "STRIPE_TEST_LIFETIME_PRICE_ID",
      "STRIPE_LIFETIME_PRICE_ID",
      "STRIPE_PRO_LIFETIME_PRICE_ID",
    ],
    live: [
      "STRIPE_LIVE_PRO_LIFETIME_PRICE_ID",
      "STRIPE_LIVE_LIFETIME_PRICE_ID",
      "STRIPE_LIFETIME_PRICE_ID",
      "STRIPE_PRO_LIFETIME_PRICE_ID",
    ],
  },
  export: {
    test: [
      "STRIPE_TEST_EXPORT_PRICE_ID",
      "STRIPE_TEST_ONE_TIME_EXPORT_PRICE_ID",
      "STRIPE_TEST_ONE_TIME_PRICE_ID",
      "STRIPE_EXPORT_PRICE_ID",
      "STRIPE_ONE_TIME_PRICE_ID",
    ],
    live: [
      "STRIPE_LIVE_EXPORT_PRICE_ID",
      "STRIPE_LIVE_ONE_TIME_EXPORT_PRICE_ID",
      "STRIPE_LIVE_ONE_TIME_PRICE_ID",
      "STRIPE_EXPORT_PRICE_ID",
      "STRIPE_ONE_TIME_PRICE_ID",
    ],
  },
};

export type StripePlanPriceResolution = {
  plan: StripePlanPriceKind;
  mode: StripeMode;
  resolvedId: string | null;
  sourceEnvKey: string | null;
  /** Which env vars were checked and whether each had a non-empty value (values are not logged). */
  keys: { name: string; set: boolean }[];
};

export function describeStripePlanPriceResolution(
  plan: StripePlanPriceKind,
  mode: StripeMode
): StripePlanPriceResolution {
  const names = PRICE_ENV_KEYS[plan][mode];
  const { id, sourceKey } = resolveFromKeys(names);
  return {
    plan,
    mode,
    resolvedId: id,
    sourceEnvKey: sourceKey,
    keys: names.map((name) => ({
      name,
      set: !!(process.env[name]?.trim()),
    })),
  };
}

/** True when STRIPE_DEBUG_PRICES=1 — logs successful price resolution (source env key + price id suffix). */
export function isStripePriceDebugEnabled(): boolean {
  return (
    process.env.STRIPE_DEBUG_PRICES === "1" ||
    process.env.STRIPE_DEBUG_PRICE_RESOLUTION === "1"
  );
}

export function logStripePlanPriceMissing(
  routeLabel: string,
  plan: StripePlanPriceKind,
  mode: StripeMode
): void {
  const d = describeStripePlanPriceResolution(plan, mode);
  console.warn(`[stripe:${routeLabel}] Price ID not configured`, {
    plan: d.plan,
    mode: d.mode,
    envKeysChecked: d.keys,
    hint:
      mode === "live"
        ? `Set STRIPE_LIVE_${plan === "monthly" ? "PRO_MONTHLY" : plan === "export" ? "EXPORT" : "…"}_PRICE_ID (or a shared fallback listed above) on the host.`
        : "Set STRIPE_TEST_* or shared STRIPE_* price ID env vars.",
  });
}

export function logStripePlanPriceResolved(
  routeLabel: string,
  plan: StripePlanPriceKind,
  mode: StripeMode
): void {
  if (!isStripePriceDebugEnabled()) return;
  const d = describeStripePlanPriceResolution(plan, mode);
  if (!d.resolvedId || !d.sourceEnvKey) return;
  console.log(`[stripe:${routeLabel}] Using price ID`, {
    plan: d.plan,
    mode: d.mode,
    sourceEnvKey: d.sourceEnvKey,
    priceIdSuffix: d.resolvedId.slice(-10),
  });
}

function getPriceForPlan(plan: StripePlanPriceKind, mode: StripeMode): string | null {
  return resolveFromKeys(PRICE_ENV_KEYS[plan][mode]).id;
}

/** Annual price for the Stripe account mode (from subscription probe or explicit mode). */
export function getProAnnualPriceIdForStripeMode(mode: StripeMode): string | null {
  return getPriceForPlan("annual", mode);
}

/** Monthly price for the Stripe account mode. */
export function getProMonthlyPriceIdForStripeMode(mode: StripeMode): string | null {
  return getPriceForPlan("monthly", mode);
}

/** Current deployment (NODE_ENV): test prices in development, live in production. */
export function getProMonthlyPriceId(): string | null {
  return getProMonthlyPriceIdForStripeMode(getRuntimeStripeMode());
}

export function getProAnnualPriceId(): string | null {
  return getProAnnualPriceIdForStripeMode(getRuntimeStripeMode());
}

/** Lifetime price for a given Stripe account mode (subscription probe or NODE_ENV). */
export function getProLifetimePriceIdForStripeMode(mode: StripeMode): string | null {
  return getPriceForPlan("lifetime", mode);
}

export function getProLifetimePriceId(): string | null {
  return getProLifetimePriceIdForStripeMode(getRuntimeStripeMode());
}

/** One-time export price for a given Stripe account mode. */
export function getExportPriceIdForStripeMode(mode: StripeMode): string | null {
  return getPriceForPlan("export", mode);
}

export function getExportPriceId(): string | null {
  return getExportPriceIdForStripeMode(getRuntimeStripeMode());
}

/** All configured annual price IDs (for webhooks / cross-mode rows). */
export function getAllProAnnualPriceIds(): string[] {
  const names = new Set<string>([
    ...PRICE_ENV_KEYS.annual.test,
    ...PRICE_ENV_KEYS.annual.live,
  ]);
  const set = new Set<string>();
  for (const k of Array.from(names)) {
    const t = process.env[k]?.trim();
    if (t) set.add(t);
  }
  return Array.from(set);
}

/** Any configured Pro monthly or annual price (test + live env names) — for upgrade `newPriceId` validation. */
export function isConfiguredProRecurringPriceId(priceId: string): boolean {
  if (!priceId?.trim()) return false;
  const allowed = new Set<string>([
    ...getAllProMonthlyPriceIds(),
    ...getAllProAnnualPriceIds(),
  ]);
  return allowed.has(priceId.trim());
}

/** All configured monthly price IDs (for webhooks / cross-mode rows). */
export function getAllProMonthlyPriceIds(): string[] {
  const names = new Set<string>([
    ...PRICE_ENV_KEYS.monthly.test,
    ...PRICE_ENV_KEYS.monthly.live,
  ]);
  const set = new Set<string>();
  for (const k of Array.from(names)) {
    const t = process.env[k]?.trim();
    if (t) set.add(t);
  }
  return Array.from(set);
}

/** All configured export / one-time price IDs (webhooks). */
export function getAllExportPriceIds(): string[] {
  const names = new Set<string>([
    ...PRICE_ENV_KEYS.export.test,
    ...PRICE_ENV_KEYS.export.live,
  ]);
  const set = new Set<string>();
  for (const k of Array.from(names)) {
    const t = process.env[k]?.trim();
    if (t) set.add(t);
  }
  return Array.from(set);
}

export function planIntervalFromProPriceId(
  priceId: string | null
): "monthly" | "annual" | null {
  if (!priceId) return null;
  if (getAllProAnnualPriceIds().includes(priceId)) return "annual";
  if (getAllProMonthlyPriceIds().includes(priceId)) return "monthly";
  return null;
}
