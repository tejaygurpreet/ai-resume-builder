/**
 * Alias for POST /api/stripe/checkout — same Pro / Export checkout session creation.
 * Uses NODE_ENV-scoped keys from lib/stripe.ts and price IDs from lib/stripe-prices.ts.
 */
export { POST } from "../checkout/route";
