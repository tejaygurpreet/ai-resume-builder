/**
 * Resolve Stripe Price IDs — prefer new env names, fall back to legacy.
 */

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
