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
 * Order: STRIPE_TEST_SECRET_KEY → STRIPE_LIVE_SECRET_KEY → optional STRIPE_SECRET_KEY.
 * Monthly→annual upgrades need the key for the account that owns the sub; two-key setups need no STRIPE_SECRET_KEY.
 */
function collectStripeSecretsForProbe(): string[] {
  const keys: string[] = [];
  const add = (s: string | undefined) => {
    const t = s?.trim();
    if (t && !keys.includes(t)) keys.push(t);
  };
  add(
    process.env.STRIPE_TEST_SECRET_KEY || process.env.STRIPE_SECRET_KEY_TEST
  );
  add(
    process.env.STRIPE_LIVE_SECRET_KEY || process.env.STRIPE_SECRET_KEY_LIVE
  );
  add(process.env.STRIPE_SECRET_KEY);
  return keys;
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
      console.warn(
        "[stripe-subscription-mode] subscriptions.retrieve failed while probing keys (trying next)",
        {
          subscriptionId,
          modeGuess: stripeModeFromSecretKey(secret),
          message: err instanceof Error ? err.message : String(err),
        }
      );
      continue;
    }
  }
  return null;
}
