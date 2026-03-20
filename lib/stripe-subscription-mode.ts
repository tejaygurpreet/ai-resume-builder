import Stripe from "stripe";

const API_VERSION = "2025-02-24.acacia" as const;

export type StripeMode = "test" | "live";

/**
 * Stripe uses the same `sub_…` id shape in test and live; mode is determined by which
 * secret key can retrieve the subscription — never by a `sub_test_` prefix (not used by Stripe).
 */
export function stripeModeFromSecretKey(key: string): StripeMode {
  const k = key.trim();
  if (k.startsWith("sk_test_")) return "test";
  return "live";
}

function newStripe(secret: string): Stripe {
  return new Stripe(secret, {
    apiVersion: API_VERSION,
    typescript: true,
  });
}

/**
 * Collect distinct API keys to probe. Order: explicit test, explicit live, then primary.
 * Use STRIPE_SECRET_KEY_TEST + STRIPE_SECRET_KEY_LIVE when one deployment must upgrade
 * subscriptions created under either mode.
 */
function collectStripeSecrets(): string[] {
  const test = process.env.STRIPE_SECRET_KEY_TEST?.trim();
  const live = process.env.STRIPE_SECRET_KEY_LIVE?.trim();
  const primary = process.env.STRIPE_SECRET_KEY?.trim();

  const keys: string[] = [];
  if (test) keys.push(test);
  if (live) keys.push(live);
  if (!test && !live && primary) keys.push(primary);
  if ((test || live) && primary && !keys.includes(primary)) keys.push(primary);

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
  const secrets = collectStripeSecrets();
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
