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
    templates: 2,
    downloads: Infinity,
    aiFeatures: true,
    adsBeforeExport: 3,
    stripePriceId: null,
  },
  pro: {
    name: "Pro",
    price: 2.99,
    templates: Infinity,
    downloads: Infinity,
    aiFeatures: true,
    adsBeforeExport: 0,
    stripePriceId: process.env.STRIPE_PRO_PRICE_ID || "price_pro_monthly",
  },
} as const;
