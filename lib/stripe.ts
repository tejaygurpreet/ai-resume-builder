import Stripe from "stripe";
import {
  FREE_AI_GENERATIONS_PER_RESUME,
  FREE_EXPORTS_PER_MONTH,
  PRICING,
} from "@/lib/plans";
import { getStripeSecretKeyForNodeEnv } from "@/lib/stripe-env";

const API_VERSION = "2025-02-24.acacia" as const;

let _stripe: Stripe | null = null;
let _cachedSecretKey: string | null = null;

function createStripeClient(secretKey: string): Stripe {
  return new Stripe(secretKey, {
    apiVersion: API_VERSION,
    typescript: true,
  });
}

/**
 * Stripe client for this process: STRIPE_LIVE_SECRET_KEY in production,
 * STRIPE_TEST_SECRET_KEY in development. STRIPE_SECRET_KEY is optional if those are set.
 */
export function getStripe(): Stripe {
  const key = getStripeSecretKeyForNodeEnv();
  if (!key) {
    throw new Error(
      "Stripe is not configured. Set STRIPE_TEST_SECRET_KEY for local/dev and STRIPE_LIVE_SECRET_KEY for production (optional: STRIPE_SECRET_KEY as fallback)."
    );
  }
  if (_stripe && _cachedSecretKey === key) {
    return _stripe;
  }
  _stripe = createStripeClient(key);
  _cachedSecretKey = key;
  return _stripe;
}

/** Safe check: returns null if no secret key for current NODE_ENV. */
export function getStripeOrNull(): Stripe | null {
  const key = getStripeSecretKeyForNodeEnv();
  if (!key) return null;
  if (_stripe && _cachedSecretKey === key) {
    return _stripe;
  }
  _stripe = createStripeClient(key);
  _cachedSecretKey = key;
  return _stripe;
}

/**
 * Plan metadata for limits & UI. Stripe Price IDs live in `lib/stripe-prices.ts`
 * (NODE_ENV selects STRIPE_TEST_* vs STRIPE_LIVE_*).
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
