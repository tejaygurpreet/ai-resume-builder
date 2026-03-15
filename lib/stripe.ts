import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  typescript: true,
});

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
