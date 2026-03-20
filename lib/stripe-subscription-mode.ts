import Stripe from "stripe";

const API_VERSION = "2025-02-24.acacia" as const;

export type StripeMode = "test" | "live";

/**
 * Stripe uses the same `sub_…` id in test and live. Mode is determined by which secret key
 * successfully retrieves the subscription (never from the id string).
 */
export function stripeModeFromSecretKey(key: string): StripeMode {
  const k = key.trim();
  if (k.startsWith("sk_test") || k.startsWith("rk_test")) return "test";
  return "live";
}

function newStripe(secret: string): Stripe {
  return new Stripe(secret, {
    apiVersion: API_VERSION,
    typescript: true,
  });
}

/**
 * Keys used to probe which Stripe account owns a subscription (upgrades / cross-mode DB).
 * Order: STRIPE_SECRET_KEY first (common single-key setups), then explicit test/live keys.
 * Independent of NODE_ENV so production can still update a test-mode sub if both keys are set.
 */
function collectStripeSecretsForProbe(): string[] {
  const legacy = process.env.STRIPE_SECRET_KEY?.trim();
  const test =
    process.env.STRIPE_TEST_SECRET_KEY?.trim() ||
    process.env.STRIPE_SECRET_KEY_TEST?.trim();
  const live =
    process.env.STRIPE_LIVE_SECRET_KEY?.trim() ||
    process.env.STRIPE_SECRET_KEY_LIVE?.trim();

  const keys: string[] = [];
  if (legacy) keys.push(legacy);
  if (test && test !== legacy) keys.push(test);
  if (live && live !== legacy && live !== test) keys.push(live);

  return Array.from(new Set(keys));
}

function isMissingSubscriptionError(err: unknown): boolean {
  const e = err as { code?: string; type?: string; message?: string };
  if (e?.code === "resource_missing") return true;
  const msg = (e?.message ?? "").toLowerCase();
  return (
    msg.includes("no such subscription") ||
    msg.includes("test mode") ||
    msg.includes("live mode")
  );
}

/**
 * Returns the Stripe client + mode for the account that owns this subscription id.
 */
export async function resolveStripeForSubscriptionId(
  subscriptionId: string
): Promise<{ stripe: Stripe; mode: StripeMode } | null> {
  const secrets = collectStripeSecretsForProbe();
  if (secrets.length === 0) return null;

  for (const secret of secrets) {
    const stripe = newStripe(secret);
    try {
      await stripe.subscriptions.retrieve(subscriptionId);
      return { stripe, mode: stripeModeFromSecretKey(secret) };
    } catch (err) {
      if (isMissingSubscriptionError(err)) continue;
      throw err;
    }
  }
  return null;
}
