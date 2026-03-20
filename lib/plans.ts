/**
 * OptimaCV pricing & limits — single source of truth for UI and server checks.
 * Stripe Price IDs: see lib/stripe-prices.ts (STRIPE_LIFETIME_PRICE_ID + STRIPE_PRO_LIFETIME_PRICE_ID).
 */

export const FREE_EXPORTS_PER_MONTH = 2;
export const FREE_AI_GENERATIONS_PER_RESUME = 3;
export const FREE_BASIC_TEMPLATES = 10;

/** Display amounts (create matching Stripe prices in Dashboard). */
export const PRICING = {
  proMonthly: 9.99,
  proAnnual: 79.99,
  proLifetime: 199.99,
  exportOneTime: 29.99,
} as const;

/** vs 12 × monthly (rounded for marketing). */
export const ANNUAL_SAVE_VS_MONTHLY_DOLLARS = Math.round(
  PRICING.proMonthly * 12 - PRICING.proAnnual
);

/** Marketing line for Lifetime. */
export const LIFETIME_VS_MONTHLY_TAGLINE =
  "All Pro features forever — future premium templates included";

export const PLANS_COPY = {
  free: {
    name: "Free",
    features: [
      `${FREE_EXPORTS_PER_MONTH} exports/month`,
      "Sponsored message before each export",
      `${FREE_AI_GENERATIONS_PER_RESUME} AI generations per resume (basic only)`,
      `${FREE_BASIC_TEMPLATES} basic templates`,
      "PDF, DOCX, TXT, JSON, Markdown export",
      "No advanced AI (tailoring, ATS, cover letter)",
    ],
  },
  export: {
    name: "Export Access",
    priceLabel: `$${PRICING.exportOneTime} one-time`,
    features: [
      "Unlimited exports forever",
      "No ads",
      "All export formats",
      "No AI features (tailoring, cover letter, ATS, advanced generation)",
      `${FREE_BASIC_TEMPLATES} basic templates only`,
    ],
  },
  pro: {
    name: "Pro",
    features: [
      "Unlimited AI generations",
      "All 50+ premium templates",
      "Job tailoring",
      "Cover letter generator",
      "ATS score analysis",
      "Unlimited clean exports (no ads)",
      "Priority support",
      "All export formats",
    ],
  },
} as const;
