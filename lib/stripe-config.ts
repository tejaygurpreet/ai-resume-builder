/**
 * Central Stripe helpers: account mode, price IDs per mode, clients for that mode.
 * Stripe subscription IDs are always `sub_…` in test and live — mode comes from which
 * secret key can retrieve the subscription, never from a `sub_test_` prefix (invalid).
 */

import Stripe from "stripe";
import { getStripeSecretKeyForStripeAccountMode } from "@/lib/stripe-env";
import type { StripeMode } from "@/lib/stripe-subscription-mode";
import { resolveStripeForSubscriptionId } from "@/lib/stripe-subscription-mode";
import {
  getExportPriceIdForStripeMode,
  getProAnnualPriceIdForStripeMode,
  getProLifetimePriceIdForStripeMode,
  getProMonthlyPriceIdForStripeMode,
} from "@/lib/stripe-prices";
import { isStripeLiveRuntime } from "@/lib/stripe-env";

const API_VERSION = "2025-02-24.acacia" as const;

const stripeClientBySecret = new Map<string, Stripe>();

function createStripe(secret: string): Stripe {
  return new Stripe(secret, {
    apiVersion: API_VERSION,
    typescript: true,
  });
}

/** Stripe REST client for the secret key that matches this account mode (test vs live). */
export function getStripeClientForMode(mode: StripeMode): Stripe {
  const key = getStripeSecretKeyForStripeAccountMode(mode);
  if (!key) {
    throw new Error(
      mode === "test"
        ? "Stripe test mode is not configured. Set STRIPE_TEST_SECRET_KEY or STRIPE_SECRET_KEY (sk_test…)."
        : "Stripe live mode is not configured. Set STRIPE_LIVE_SECRET_KEY or STRIPE_SECRET_KEY (sk_live…)."
    );
  }
  let client = stripeClientBySecret.get(key);
  if (!client) {
    client = createStripe(key);
    stripeClientBySecret.set(key, client);
  }
  return client;
}

export type CheckoutPlanType = "monthly" | "annual" | "export" | "lifetime";

/**
 * Price ID for checkout / upgrades, using the same fallbacks as `lib/stripe-prices.ts`
 * (STRIPE_TEST_* / STRIPE_LIVE_* plus shared STRIPE_PRO_* / STRIPE_EXPORT_* names).
 */
export function getCheckoutPlanPriceId(
  planType: CheckoutPlanType,
  mode: StripeMode
): string | null {
  switch (planType) {
    case "monthly":
      return getProMonthlyPriceIdForStripeMode(mode);
    case "annual":
      return getProAnnualPriceIdForStripeMode(mode);
    case "export":
      return getExportPriceIdForStripeMode(mode);
    case "lifetime":
      return getProLifetimePriceIdForStripeMode(mode);
    default:
      return null;
  }
}

/** NODE_ENV-based account mode for net-new checkouts (no existing subscription row). */
export function getDefaultCheckoutStripeMode(): StripeMode {
  return isStripeLiveRuntime() ? "live" : "test";
}

export { resolveStripeForSubscriptionId };

/** Alias: resolve mode + client from an existing subscription id (probe keys). */
export const detectStripeModeFromSubscriptionId = resolveStripeForSubscriptionId;
