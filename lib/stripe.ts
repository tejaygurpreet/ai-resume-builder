import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error(
        "STRIPE_SECRET_KEY is not set. Add it to your environment variables."
      );
    }
    _stripe = new Stripe(key, { typescript: true });
  }
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
    templates: Infinity,
    maxExportsPerMonth: Infinity,
    aiGenerationsPerResume: Infinity,
    aiFeatures: true,
    adsBeforeExport: 0,
    stripePriceId: process.env.STRIPE_PRO_PRICE_ID || "price_pro_monthly",
    stripeAnnualPriceId: process.env.STRIPE_PRO_ANNUAL_PRICE_ID || null,
    stripeLifetimePriceId: process.env.STRIPE_PRO_LIFETIME_PRICE_ID || null,
  },
  oneTimeExport: {
    name: "One-Time Export",
    price: 19.99,
    stripePriceId: process.env.STRIPE_ONE_TIME_PRICE_ID || "price_one_time_export",
  },
} as const;
