/**
 * Resolve Stripe Price IDs — prefer new env names, fall back to legacy.
 */

import type { StripeMode } from "@/lib/stripe-subscription-mode";

/** Annual price for the Stripe account mode (test vs live). Falls back to STRIPE_PRO_ANNUAL_PRICE_ID. */
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

/** Monthly price for the Stripe account mode. Falls back to shared monthly env. */
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

export function getProMonthlyPriceId(): string | null {
  return (
    process.env.STRIPE_PRO_MONTHLY_PRICE_ID?.trim() ||
    process.env.STRIPE_PRO_PRICE_ID?.trim() ||
    null
  );
}

export function getProAnnualPriceId(): string | null {
  return process.env.STRIPE_PRO_ANNUAL_PRICE_ID?.trim() || null;
}

export function getProLifetimePriceId(): string | null {
  return (
    process.env.STRIPE_LIFETIME_PRICE_ID?.trim() ||
    process.env.STRIPE_PRO_LIFETIME_PRICE_ID?.trim() ||
    null
  );
}

export function getExportPriceId(): string | null {
  return (
    process.env.STRIPE_EXPORT_PRICE_ID?.trim() ||
    process.env.STRIPE_ONE_TIME_PRICE_ID?.trim() ||
    null
  );
}
