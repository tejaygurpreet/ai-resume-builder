/**
 * Publishable keys for Stripe.js / Elements (NEXT_PUBLIC_* only — safe for client bundles).
 * Picks test vs live from NODE_ENV, same rules as lib/stripe-env.ts.
 */

export function getStripePublishableKeyForRuntime(): string {
  const test =
    process.env.NEXT_PUBLIC_STRIPE_TEST_PUBLISHABLE_KEY?.trim() ||
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_TEST?.trim() ||
    "";
  const live =
    process.env.NEXT_PUBLIC_STRIPE_LIVE_PUBLISHABLE_KEY?.trim() ||
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_LIVE?.trim() ||
    "";
  const legacy = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim() || "";

  if (process.env.NODE_ENV === "production") {
    return live || legacy;
  }
  return test || legacy;
}
