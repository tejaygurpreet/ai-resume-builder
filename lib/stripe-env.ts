/**
 * Stripe environment selection by NODE_ENV.
 * - Non-production (development, test): STRIPE_TEST_SECRET_KEY + test price IDs + test publishable key
 * - production: STRIPE_LIVE_SECRET_KEY + live price IDs + live publishable key
 *
 * Legacy fallbacks: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
 */

/** True when running a production Next.js build (NODE_ENV === "production"). */
export function isStripeLiveRuntime(): boolean {
  return process.env.NODE_ENV === "production";
}

/** Secret API key for this deployment’s Stripe mode (test vs live). */
export function getStripeSecretKeyForNodeEnv(): string | null {
  const test = process.env.STRIPE_TEST_SECRET_KEY?.trim();
  const live = process.env.STRIPE_LIVE_SECRET_KEY?.trim();
  const legacy = process.env.STRIPE_SECRET_KEY?.trim();

  if (isStripeLiveRuntime()) {
    return live || legacy || null;
  }
  return test || legacy || null;
}

/** Webhook signing secret for the Stripe account that matches this NODE_ENV. */
export function getStripeWebhookSecretForNodeEnv(): string | null {
  const test = process.env.STRIPE_TEST_WEBHOOK_SECRET?.trim();
  const live = process.env.STRIPE_LIVE_WEBHOOK_SECRET?.trim();
  const legacy = process.env.STRIPE_WEBHOOK_SECRET?.trim();

  if (isStripeLiveRuntime()) {
    return live || legacy || null;
  }
  return test || legacy || null;
}
