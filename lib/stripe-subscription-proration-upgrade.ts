import type Stripe from "stripe";

/**
 * Switch an existing subscription to a new recurring price with proration.
 * Returns the updated subscription and its latest invoice (expanded when possible).
 * Throws if already on the target price.
 */
export async function applySubscriptionProrationPriceChange(
  stripe: Stripe,
  subscriptionId: string,
  targetPriceId: string
): Promise<{
  subscription: Stripe.Subscription;
  invoice: Stripe.Invoice | null;
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
    throw new Error("You're already on this billing interval.");
  }

  const items: Stripe.SubscriptionUpdateParams.Item[] = sub.items.data.map(
    (it, idx) => (idx === 0 ? { id: it.id, price: targetPriceId } : { id: it.id })
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

  return { subscription: updated, invoice };
}

/**
 * After proration, always return a Stripe-hosted URL (Checkout or invoice page).
 * Never return “success” without a URL for the client to open.
 */
export async function resolveUpgradePaymentUrl(params: {
  stripe: Stripe;
  subscription: Stripe.Subscription;
  invoice: Stripe.Invoice | null;
  baseUrl: string;
  userId: string;
  userEmail: string | null | undefined;
}): Promise<string> {
  const { stripe, subscription, invoice: invMaybe, baseUrl, userId, userEmail } =
    params;

  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer?.id;
  if (!customerId) {
    throw new Error("Subscription has no customer.");
  }

  let invoice = invMaybe;
  if (!invoice && subscription.latest_invoice) {
    const lid = subscription.latest_invoice;
    const id = typeof lid === "string" ? lid : lid?.id;
    if (id) {
      invoice = await stripe.invoices.retrieve(id, {
        expand: ["payment_intent"],
      });
    }
  }

  if (invoice?.status === "draft" && invoice.id) {
    invoice = await stripe.invoices.finalizeInvoice(invoice.id);
  }

  const successUrl = `${baseUrl.replace(/\/$/, "")}/dashboard?upgraded=true`;
  const cancelUrl = `${baseUrl.replace(/\/$/, "")}/pricing?canceled=true`;

  // Open invoice → Stripe Checkout (payment) tied to that invoice (preferred UX).
  // `invoice` on SessionCreateParams is valid in Stripe API; SDK types can lag.
  if (invoice?.id && invoice.status === "open") {
    try {
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        customer: customerId,
        success_url: successUrl,
        cancel_url: cancelUrl,
        client_reference_id: userId,
        metadata: {
          userId,
          userEmail: userEmail ?? "",
        },
        invoice: invoice.id,
      } as unknown as Stripe.Checkout.SessionCreateParams);
      if (session.url) {
        console.log("Upgrade session created. URL:", session.url);
        return session.url;
      }
    } catch (e) {
      console.warn(
        "[resolveUpgradePaymentUrl] Checkout Session for invoice failed; falling back to hosted invoice URL",
        e instanceof Error ? e.message : e
      );
      if (invoice.hosted_invoice_url) {
        console.log(
          "Upgrade payment URL (hosted invoice fallback):",
          invoice.hosted_invoice_url
        );
        return invoice.hosted_invoice_url;
      }
      throw e;
    }
  }

  if (invoice?.hosted_invoice_url) {
    console.log(
      "Upgrade payment URL (hosted invoice):",
      invoice.hosted_invoice_url
    );
    return invoice.hosted_invoice_url;
  }

  if (invoice?.status === "paid") {
    throw new Error(
      "Your plan change was applied and charged on file. Refresh this page in a moment to see your updated billing. If totals look wrong, contact support."
    );
  }

  throw new Error(
    "Could not open a Stripe payment page for this upgrade. Please try again or contact support."
  );
}
