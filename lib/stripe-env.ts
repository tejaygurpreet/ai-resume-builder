/**
 * Stripe environment selection by NODE_ENV.
 * - Development (NODE_ENV !== production): STRIPE_TEST_SECRET_KEY (+ test price IDs, test webhook, pk_test)
 * - Production: STRIPE_LIVE_SECRET_KEY (+ live price IDs, live webhook, pk_live)
 *
 * You do **not** need STRIPE_SECRET_KEY if you set both keys above. Optional legacy fallback:
 * STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
 */

import type { StripeMode } from "@/lib/stripe-subscription-mode";

/** True when running a production Next.js build (NODE_ENV === "production"). */
export function isStripeLiveRuntime(): boolean {
  return process.env.NODE_ENV === "production";
}

/**
 * Secret key for a specific Stripe **account mode** (test vs live), independent of NODE_ENV.
 * Use when creating Checkout sessions or API calls that must match subscription/price mode.
 *
 * - Uses STRIPE_TEST_SECRET_KEY (test) or STRIPE_LIVE_SECRET_KEY (live) when set — **this is enough**; no STRIPE_SECRET_KEY required.
 * - Optional: STRIPE_SECRET_KEY when it matches the mode (sk_test… / sk_live…) or as last resort.
 */
export function getStripeSecretKeyForStripeAccountMode(
  mode: StripeMode
): string | null {
  const test = process.env.STRIPE_TEST_SECRET_KEY?.trim();
  const live = process.env.STRIPE_LIVE_SECRET_KEY?.trim();
  const legacy = process.env.STRIPE_SECRET_KEY?.trim();

  if (mode === "test") {
    if (test) return test;
    if (legacy?.startsWith("sk_test")) return legacy;
    return legacy || null;
  }
  if (live) return live;
  if (legacy?.startsWith("sk_live")) return legacy;
  return legacy || null;
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
