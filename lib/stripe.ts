import Stripe from "stripe";
import {
  FREE_AI_GENERATIONS_PER_RESUME,
  FREE_EXPORTS_PER_MONTH,
  PRICING,
} from "@/lib/plans";

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

/**
 * Plan metadata for limits & UI. Stripe Price IDs live in `lib/stripe-prices.ts`
 * (use STRIPE_PRO_MONTHLY_PRICE_ID, STRIPE_EXPORT_PRICE_ID, etc.).
 */
export const PLANS = {
  free: {
    name: "Free",
    price: 0,
    templates: 10,
    maxExportsPerMonth: FREE_EXPORTS_PER_MONTH,
    aiGenerationsPerResume: FREE_AI_GENERATIONS_PER_RESUME,
    adsBeforeExport: true,
  },
  pro: {
    name: "Pro",
    price: PRICING.proMonthly,
    priceAnnual: PRICING.proAnnual,
    priceLifetime: PRICING.proLifetime,
    templates: Number.POSITIVE_INFINITY,
    maxExportsPerMonth: Number.POSITIVE_INFINITY,
    aiGenerationsPerResume: Number.POSITIVE_INFINITY,
    adsBeforeExport: false,
  },
  oneTimeExport: {
    name: "Export Access",
    price: PRICING.exportOneTime,
  },
} as const;
