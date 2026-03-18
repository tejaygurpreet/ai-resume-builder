import Stripe from "stripe";

let _stripe: Stripe | null = null;

/** Returns Stripe client. Throws only when actually used for API calls if key is missing. */
export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error(
        "STRIPE_SECRET_KEY is not set. Add it to your environment variables."
      );
    }
    _stripe = new Stripe(key, {
      apiVersion: "2025-02-24.acacia",
      typescript: true,
    });
  }
  return _stripe;
}

/** Safe check: returns null if Stripe is not configured (e.g. during build). */
export function getStripeOrNull(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  if (!_stripe)
    _stripe = new Stripe(key, {
      apiVersion: "2025-02-24.acacia",
      typescript: true,
    });
  return _stripe;
}

export const PLANS = {
  free: {
    name: "Free",
    price: 0,
    templates: 10,
    maxExportsPerMonth: 5,
    aiGenerationsPerResume: 3,
    aiFeatures: true,
    adsBeforeExport: 0,
    stripePriceId: null,
  },
  pro: {
    name: "Pro",
    price: 7.99,
    priceAnnual: 69.99,
    priceLifetime: 129.99,
    templates: Infinity,
    maxExportsPerMonth: Infinity,
    aiGenerationsPerResume: Infinity,
    aiFeatures: true,
    adsBeforeExport: 0,
    stripePriceId: process.env.STRIPE_PRO_PRICE_ID ?? null,
    stripeAnnualPriceId: process.env.STRIPE_PRO_ANNUAL_PRICE_ID ?? null,
    stripeLifetimePriceId: process.env.STRIPE_PRO_LIFETIME_PRICE_ID ?? null,
  },
  oneTimeExport: {
    name: "One-Time Export",
    price: 19.99,
    stripePriceId: process.env.STRIPE_ONE_TIME_PRICE_ID ?? null,
  },
} as const;
