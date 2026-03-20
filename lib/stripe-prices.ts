/**
 * Stripe Price IDs — subscription upgrades use per-mode IDs from resolveStripeForSubscriptionId;
 * new checkout uses NODE_ENV (test vs live) via getRuntimeStripeMode().
 */

import type { StripeMode } from "@/lib/stripe-subscription-mode";
import { isStripeLiveRuntime } from "@/lib/stripe-env";

export function getRuntimeStripeMode(): StripeMode {
  return isStripeLiveRuntime() ? "live" : "test";
}

/** Annual price for the Stripe account mode (from subscription probe or explicit mode). */
export function getProAnnualPriceIdForStripeMode(mode: StripeMode): string | null {
  if (mode === "test") {
    return (
      process.env.STRIPE_TEST_PRO_ANNUAL_PRICE_ID?.trim() ||
      process.env.STRIPE_PRO_ANNUAL_PRICE_ID?.trim() ||
      null
    );
  }
  return (
    process.env.STRIPE_LIVE_PRO_ANNUAL_PRICE_ID?.trim() ||
    process.env.STRIPE_PRO_ANNUAL_PRICE_ID?.trim() ||
    null
  );
}

/** Monthly price for the Stripe account mode. */
export function getProMonthlyPriceIdForStripeMode(mode: StripeMode): string | null {
  if (mode === "test") {
    return (
      process.env.STRIPE_TEST_PRO_MONTHLY_PRICE_ID?.trim() ||
      process.env.STRIPE_PRO_MONTHLY_PRICE_ID?.trim() ||
      process.env.STRIPE_PRO_PRICE_ID?.trim() ||
      null
    );
  }
  return (
    process.env.STRIPE_LIVE_PRO_MONTHLY_PRICE_ID?.trim() ||
    process.env.STRIPE_PRO_MONTHLY_PRICE_ID?.trim() ||
    process.env.STRIPE_PRO_PRICE_ID?.trim() ||
    null
  );
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
  if (mode === "test") {
    return (
      process.env.STRIPE_TEST_PRO_LIFETIME_PRICE_ID?.trim() ||
      process.env.STRIPE_TEST_LIFETIME_PRICE_ID?.trim() ||
      process.env.STRIPE_LIFETIME_PRICE_ID?.trim() ||
      process.env.STRIPE_PRO_LIFETIME_PRICE_ID?.trim() ||
      null
    );
  }
  return (
    process.env.STRIPE_LIVE_PRO_LIFETIME_PRICE_ID?.trim() ||
    process.env.STRIPE_LIVE_LIFETIME_PRICE_ID?.trim() ||
    process.env.STRIPE_LIFETIME_PRICE_ID?.trim() ||
    process.env.STRIPE_PRO_LIFETIME_PRICE_ID?.trim() ||
    null
  );
}

export function getProLifetimePriceId(): string | null {
  return getProLifetimePriceIdForStripeMode(getRuntimeStripeMode());
}

/** One-time export price for a given Stripe account mode. */
export function getExportPriceIdForStripeMode(mode: StripeMode): string | null {
  if (mode === "test") {
    return (
      process.env.STRIPE_TEST_EXPORT_PRICE_ID?.trim() ||
      process.env.STRIPE_EXPORT_PRICE_ID?.trim() ||
      process.env.STRIPE_ONE_TIME_PRICE_ID?.trim() ||
      null
    );
  }
  return (
    process.env.STRIPE_LIVE_EXPORT_PRICE_ID?.trim() ||
    process.env.STRIPE_EXPORT_PRICE_ID?.trim() ||
    process.env.STRIPE_ONE_TIME_PRICE_ID?.trim() ||
    null
  );
}

export function getExportPriceId(): string | null {
  return getExportPriceIdForStripeMode(getRuntimeStripeMode());
}

/** All configured annual price IDs (for webhooks / cross-mode rows). */
export function getAllProAnnualPriceIds(): string[] {
  const set = new Set<string>();
  for (const id of [
    process.env.STRIPE_TEST_PRO_ANNUAL_PRICE_ID,
    process.env.STRIPE_LIVE_PRO_ANNUAL_PRICE_ID,
    process.env.STRIPE_PRO_ANNUAL_PRICE_ID,
  ]) {
    const t = id?.trim();
    if (t) set.add(t);
  }
  return Array.from(set);
}

/** All configured monthly price IDs (for webhooks / cross-mode rows). */
export function getAllProMonthlyPriceIds(): string[] {
  const set = new Set<string>();
  for (const id of [
    process.env.STRIPE_TEST_PRO_MONTHLY_PRICE_ID,
    process.env.STRIPE_LIVE_PRO_MONTHLY_PRICE_ID,
    process.env.STRIPE_PRO_MONTHLY_PRICE_ID,
    process.env.STRIPE_PRO_PRICE_ID,
  ]) {
    const t = id?.trim();
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
