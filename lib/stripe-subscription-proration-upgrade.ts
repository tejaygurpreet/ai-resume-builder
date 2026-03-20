import type Stripe from "stripe";

/**
 * Switch an existing subscription to a new recurring price with proration.
 * If Stripe opens an invoice (e.g. payment requires confirmation), returns hosted_invoice_url.
 */
export async function applySubscriptionProrationPriceChange(
  stripe: Stripe,
  subscriptionId: string,
  targetPriceId: string
): Promise<{
  subscription: Stripe.Subscription;
  paymentUrl: string | null;
  message: string;
}> {
  const sub = await stripe.subscriptions.retrieve(subscriptionId, {
    expand: ["items.data.price"],
  });

  const first = sub.items.data[0];
  if (!first) {
    throw new Error("Subscription has no items.");
  }

  const currentPriceId =
    typeof first.price === "string" ? first.price : first.price?.id;
  if (currentPriceId === targetPriceId) {
    return {
      subscription: sub,
      paymentUrl: null,
      message: "You're already on this plan.",
    };
  }

  const items: Stripe.SubscriptionUpdateParams.Item[] = sub.items.data.map((it, idx) =>
    idx === 0 ? { id: it.id, price: targetPriceId } : { id: it.id }
  );

  const updated = await stripe.subscriptions.update(subscriptionId, {
    items,
    proration_behavior: "always_invoice",
    expand: ["latest_invoice"],
  });

  let invoice: Stripe.Invoice | null = null;
  const li = updated.latest_invoice;
  if (typeof li === "object" && li !== null && "id" in li) {
    invoice = li as Stripe.Invoice;
  } else if (typeof li === "string") {
    invoice = await stripe.invoices.retrieve(li, {
      expand: ["payment_intent"],
    });
  }

  let paymentUrl: string | null = null;
  if (invoice?.status === "open" && invoice.hosted_invoice_url) {
    paymentUrl = invoice.hosted_invoice_url;
  }

  const message = paymentUrl
    ? "Complete payment on the next screen to confirm your plan change."
    : "Your plan has been updated.";

  return {
    subscription: updated,
    paymentUrl,
    message,
  };
}
