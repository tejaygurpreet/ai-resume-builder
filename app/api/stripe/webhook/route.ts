import { NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { getStripeWebhookSecretForNodeEnv } from "@/lib/stripe-env";
import { prisma } from "@/lib/prisma";
import {
  getAllExportPriceIds,
  getExportPriceId,
  getProLifetimePriceId,
  planIntervalFromProPriceId,
} from "@/lib/stripe-prices";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type PlanType = "pro_monthly" | "pro_annual" | "pro_lifetime" | "one_time_export";

function getMetadata(session: Stripe.Checkout.Session): {
  userId: string | null;
  userEmail: string | null;
  planType: PlanType | null;
} {
  const meta = session.metadata as Record<string, string> | null;
  if (!meta) return { userId: null, userEmail: null, planType: null };
  const planType = meta.planType ?? meta.purchaseType ?? null;
  const validPlanTypes: PlanType[] = [
    "pro_monthly",
    "pro_annual",
    "pro_lifetime",
    "one_time_export",
  ];
  return {
    userId: meta.userId?.trim() || null,
    userEmail: meta.userEmail?.trim() || null,
    planType: validPlanTypes.includes(planType as PlanType)
      ? (planType as PlanType)
      : null,
  };
}

/**
 * Resolve app user from Checkout session: metadata.userId, client_reference_id (we set = userId),
 * then metadata email, then Stripe customer email.
 * Note: there is no User.subscriptionTier — plan lives on Subscription.
 */
async function findUserForCheckoutSession(
  session: Stripe.Checkout.Session,
  metadata: ReturnType<typeof getMetadata>,
  customerEmail: string | null
): Promise<{ id: string; email: string } | null> {
  const clientRef = session.client_reference_id?.trim() || null;

  if (metadata.userId) {
    const user = await prisma.user.findUnique({
      where: { id: metadata.userId },
      select: { id: true, email: true },
    });
    if (user) {
      console.log("[webhook] user resolved by metadata.userId", {
        userId: user.id,
      });
      return user;
    }
  }

  if (clientRef) {
    const user = await prisma.user.findUnique({
      where: { id: clientRef },
      select: { id: true, email: true },
    });
    if (user) {
      console.log("[webhook] user resolved by client_reference_id", {
        userId: user.id,
      });
      return user;
    }
  }

  const emailToTry = metadata.userEmail || customerEmail;
  if (emailToTry) {
    const user = await prisma.user.findUnique({
      where: { email: emailToTry },
      select: { id: true, email: true },
    });
    if (user) {
      console.log("[webhook] user resolved by email", { email: user.email });
      return user;
    }
  }

  return null;
}

function priceIdFromStripePrice(
  price: string | Stripe.Price | null | undefined
): string | null {
  if (!price) return null;
  return typeof price === "string" ? price : price.id;
}

async function upsertRecurringProSubscription(params: {
  userId: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  planType: PlanType | null;
}): Promise<void> {
  const { userId, stripeCustomerId, stripeSubscriptionId, planType } = params;

  const stripeSub = await getStripe().subscriptions.retrieve(
    stripeSubscriptionId,
    { expand: ["items.data.price"] }
  );

  const firstItem = stripeSub.items?.data?.[0];
  const priceId = priceIdFromStripePrice(firstItem?.price);
  const inferredInterval = planIntervalFromProPriceId(priceId);

  let planInterval: string;
  if (planType === "pro_annual") planInterval = "annual";
  else if (planType === "pro_monthly") planInterval = "monthly";
  else if (inferredInterval) planInterval = inferredInterval;
  else planInterval = "monthly";

  const currentPeriodEnd = stripeSub.current_period_end
    ? new Date(stripeSub.current_period_end * 1000)
    : null;

  const status =
    stripeSub.status === "trialing" || stripeSub.status === "active"
      ? "active"
      : stripeSub.status;

  await prisma.subscription.upsert({
    where: { userId },
    create: {
      userId,
      stripeCustomerId,
      stripeSubscriptionId,
      stripePriceId: priceId,
      plan: "pro",
      planInterval,
      status,
      currentPeriodEnd,
    },
    update: {
      stripeCustomerId,
      stripeSubscriptionId,
      stripePriceId: priceId ?? undefined,
      plan: "pro",
      planInterval,
      status,
      currentPeriodEnd: currentPeriodEnd ?? undefined,
    },
  });

  console.log("[webhook] Access updated: recurring Pro (Subscription row)", {
    planType,
    planInterval,
    userId,
    stripeSubscriptionId,
    currentPeriodEnd: currentPeriodEnd?.toISOString() ?? null,
  });
}

async function handleCheckoutSessionCompleted(
  event: Stripe.Event
): Promise<void> {
  const session = event.data.object as Stripe.Checkout.Session;
  const metadata = getMetadata(session);
  const customerEmail =
    session.customer_details?.email ?? session.customer_email ?? null;

  console.log("[webhook] checkout.session.completed detail", {
    sessionId: session.id,
    mode: session.mode,
    paymentStatus: session.payment_status,
    clientReferenceId: session.client_reference_id
      ? "present"
      : "missing",
    planType: metadata.planType,
    metadataUserId: metadata.userId ? "present" : "missing",
    metadataUserEmail: metadata.userEmail ? "present" : "missing",
  });

  const user = await findUserForCheckoutSession(
    session,
    metadata,
    customerEmail
  );

  if (!user) {
    console.error("[webhook] User not found for checkout.session.completed", {
      metadataUserId: metadata.userId,
      metadataUserEmail: metadata.userEmail,
      clientReferenceId: session.client_reference_id,
      customerEmail,
    });
    return;
  }

  const stripeCustomerId =
    typeof session.customer === "string"
      ? session.customer
      : session.customer?.id ?? null;
  const stripeSubscriptionId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id ?? null;

  const planType = metadata.planType;

  if (session.mode === "payment") {
    if (planType === "pro_lifetime") {
      const existingSub = await prisma.subscription.findUnique({
        where: { userId: user.id },
      });
      if (existingSub?.stripeSubscriptionId) {
        try {
          await getStripe().subscriptions.cancel(
            existingSub.stripeSubscriptionId
          );
          console.log(
            "[webhook] Canceled existing subscription for lifetime upgrade",
            { subscriptionId: existingSub.stripeSubscriptionId }
          );
        } catch (cancelErr) {
          console.error(
            "[webhook] Failed to cancel existing subscription:",
            cancelErr
          );
        }
      }
      await prisma.subscription.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          stripeCustomerId,
          plan: "pro",
          planInterval: "lifetime",
          status: "active",
          stripeSubscriptionId: null,
        },
        update: {
          stripeCustomerId,
          plan: "pro",
          planInterval: "lifetime",
          status: "active",
          stripeSubscriptionId: null,
        },
      });
      console.log("[webhook] Access updated: pro_lifetime", {
        userId: user.id,
        userEmail: user.email,
      });
      return;
    }

    if (planType === "one_time_export") {
      const existingSub = await prisma.subscription.findUnique({
        where: { userId: user.id },
      });
      if (existingSub?.stripeSubscriptionId) {
        try {
          await getStripe().subscriptions.update(
            existingSub.stripeSubscriptionId,
            { cancel_at_period_end: true }
          );
          console.log(
            "[webhook] Set Pro subscription to cancel at period end for Export purchase",
            { subscriptionId: existingSub.stripeSubscriptionId }
          );
        } catch (cancelErr) {
          console.error(
            "[webhook] Failed to cancel Pro for Export purchase:",
            cancelErr
          );
        }
      }
      await prisma.subscription.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          stripeCustomerId,
          plan: "export",
          planInterval: null,
          status: "active",
          oneTimeExport: true,
        },
        update: {
          stripeCustomerId,
          plan: "export",
          planInterval: null,
          oneTimeExport: true,
          stripeSubscriptionId: existingSub?.stripeSubscriptionId ?? undefined,
        },
      });
      console.log("[webhook] Access updated: one_time_export", {
        userId: user.id,
        userEmail: user.email,
      });
      return;
    }

    const lifetimePriceId = getProLifetimePriceId();
    const exportPriceIds = getAllExportPriceIds();
    const oneTimePriceId = getExportPriceId();
    let linePriceId: string | undefined;
    if (session.line_items?.data?.[0]?.price) {
      const p = session.line_items.data[0].price;
      linePriceId = typeof p === "string" ? p : p.id;
    }
    if (!linePriceId && session.id) {
      const items = await getStripe().checkout.sessions.listLineItems(
        session.id,
        { limit: 1 }
      );
      const p = items.data[0]?.price;
      linePriceId = typeof p === "string" ? p : p?.id;
    }

    if (lifetimePriceId && linePriceId === lifetimePriceId) {
      const existingSub = await prisma.subscription.findUnique({
        where: { userId: user.id },
      });
      if (existingSub?.stripeSubscriptionId) {
        try {
          await getStripe().subscriptions.cancel(
            existingSub.stripeSubscriptionId
          );
        } catch {
          /* ignore */
        }
      }
      await prisma.subscription.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          stripeCustomerId,
          plan: "pro",
          planInterval: "lifetime",
          status: "active",
          stripeSubscriptionId: null,
        },
        update: {
          stripeCustomerId,
          plan: "pro",
          planInterval: "lifetime",
          status: "active",
          stripeSubscriptionId: null,
        },
      });
      console.log("[webhook] Access updated: pro_lifetime (inferred)", {
        userId: user.id,
      });
      return;
    }

    if (
      linePriceId &&
      (exportPriceIds.includes(linePriceId) ||
        (!!oneTimePriceId && linePriceId === oneTimePriceId))
    ) {
      const existingSubForExport = await prisma.subscription.findUnique({
        where: { userId: user.id },
      });
      if (existingSubForExport?.stripeSubscriptionId) {
        try {
          await getStripe().subscriptions.update(
            existingSubForExport.stripeSubscriptionId,
            { cancel_at_period_end: true }
          );
        } catch {
          /* ignore */
        }
      }
      await prisma.subscription.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          stripeCustomerId,
          plan: "export",
          status: "active",
          oneTimeExport: true,
        },
        update: {
          stripeCustomerId,
          plan: "export",
          planInterval: null,
          oneTimeExport: true,
        },
      });
      console.log("[webhook] Access updated: one_time_export (inferred)", {
        userId: user.id,
      });
      return;
    }

    console.warn(
      "[webhook] checkout payment mode: no planType and price did not match lifetime/export — Subscription unchanged",
      { sessionId: session.id, planType }
    );
    return;
  }

  const isRecurringPro =
    planType === "pro_monthly" ||
    planType === "pro_annual" ||
    (session.mode === "subscription" && !planType);

  if (!isRecurringPro) {
    console.warn(
      "[webhook] checkout.session.completed: subscription mode but not recognized as Pro recurring",
      { mode: session.mode, planType }
    );
    return;
  }

  if (!stripeCustomerId || !stripeSubscriptionId) {
    console.error(
      "[webhook] Missing customer or subscription ID for recurring plan",
      {
        stripeCustomerId: !!stripeCustomerId,
        stripeSubscriptionId: !!stripeSubscriptionId,
        userId: user.id,
      }
    );
    return;
  }

  await upsertRecurringProSubscription({
    userId: user.id,
    stripeCustomerId,
    stripeSubscriptionId,
    planType,
  });
}

async function handleInvoicePaid(event: Stripe.Event): Promise<void> {
  const invoice = event.data.object as Stripe.Invoice;
  const subRef = invoice.subscription;
  const subscriptionId =
    typeof subRef === "string" ? subRef : subRef?.id ?? null;

  console.log("[webhook] invoice paid/succeeded", {
    type: event.type,
    invoiceId: invoice.id,
    subscriptionId: subscriptionId ?? "none",
    amountPaid: invoice.amount_paid,
  });

  if (!subscriptionId) {
    console.log("[webhook] invoice has no subscription — skipping DB update");
    return;
  }

  let stripeSubscription: Stripe.Subscription;
  try {
    stripeSubscription = await getStripe().subscriptions.retrieve(
      subscriptionId,
      { expand: ["items.data.price"] }
    );
  } catch (e) {
    console.error(
      "[webhook] invoice: failed to retrieve subscription",
      subscriptionId,
      e
    );
    return;
  }

  const firstItem = stripeSubscription.items?.data?.[0];
  const priceId = priceIdFromStripePrice(firstItem?.price);
  const planInterval = planIntervalFromProPriceId(priceId);

  const currentPeriodEnd = stripeSubscription.current_period_end
    ? new Date(stripeSubscription.current_period_end * 1000)
    : null;

  const status =
    stripeSubscription.status === "trialing" ||
    stripeSubscription.status === "active"
      ? "active"
      : stripeSubscription.status;

  const result = await prisma.subscription.updateMany({
    where: { stripeSubscriptionId: subscriptionId },
    data: {
      status,
      currentPeriodEnd: currentPeriodEnd ?? undefined,
      ...(planInterval ? { planInterval } : {}),
      ...(priceId ? { stripePriceId: priceId } : {}),
    },
  });

  if (result.count === 0) {
    console.warn(
      "[webhook] invoice paid: no Subscription row matched stripeSubscriptionId (checkout.session.completed may not have run yet)",
      { subscriptionId }
    );
  } else {
    console.log("[webhook] Subscription refreshed from invoice", {
      subscriptionId,
      rowsUpdated: result.count,
      planInterval,
      currentPeriodEnd: currentPeriodEnd?.toISOString() ?? null,
    });
  }
}

async function handleSubscriptionUpdated(
  event: Stripe.Event
): Promise<void> {
  const subscription = event.data.object as Stripe.Subscription;
  const item = subscription.items?.data?.[0];
  const priceId = priceIdFromStripePrice(item?.price);
  const planInterval = planIntervalFromProPriceId(priceId);

  const currentPeriodEnd = subscription.current_period_end
    ? new Date(subscription.current_period_end * 1000)
    : null;

  const result = await prisma.subscription.updateMany({
    where: { stripeSubscriptionId: subscription.id },
    data: {
      status: subscription.status,
      currentPeriodEnd: currentPeriodEnd ?? undefined,
      ...(planInterval ? { planInterval } : {}),
      ...(priceId ? { stripePriceId: priceId } : {}),
    },
  });

  console.log("[webhook] customer.subscription.updated", {
    stripeSubscriptionId: subscription.id,
    status: subscription.status,
    rowsUpdated: result.count,
  });
}

async function handleSubscriptionDeleted(
  event: Stripe.Event
): Promise<void> {
  const subscription = event.data.object as Stripe.Subscription;
  const result = await prisma.subscription.updateMany({
    where: { stripeSubscriptionId: subscription.id },
    data: {
      plan: "free",
      status: "canceled",
    },
  });
  console.log("[webhook] customer.subscription.deleted", {
    stripeSubscriptionId: subscription.id,
    rowsUpdated: result.count,
  });
}

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  const webhookSecret = getStripeWebhookSecretForNodeEnv();
  if (!signature || !webhookSecret) {
    console.error("[webhook] Missing stripe-signature header or webhook secret", {
      hasSignature: !!signature,
      hasSecret: !!webhookSecret,
      hint:
        "Set STRIPE_TEST_WEBHOOK_SECRET (dev) or STRIPE_LIVE_WEBHOOK_SECRET (prod), or STRIPE_WEBHOOK_SECRET",
    });
    return NextResponse.json(
      { error: "Missing webhook signature or secret" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[webhook] Signature verification failed:", message);
    return NextResponse.json(
      { error: `Webhook Error: ${message}` },
      { status: 400 }
    );
  }

  console.log("[webhook] event received", {
    type: event.type,
    id: event.id,
    livemode: event.livemode,
  });

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(event);
        break;

      case "invoice.paid":
      case "invoice.payment_succeeded":
        await handleInvoicePaid(event);
        break;

      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event);
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event);
        break;

      default:
        console.log("[webhook] unhandled event type (ignored)", event.type);
    }
  } catch (handlerErr) {
    console.error(
      "[webhook] Handler error — returning 200 to Stripe to avoid retry storms; fix the bug and replay from Dashboard if needed",
      {
        eventType: event.type,
        eventId: event.id,
        error:
          handlerErr instanceof Error ? handlerErr.message : String(handlerErr),
        stack: handlerErr instanceof Error ? handlerErr.stack : undefined,
      }
    );
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
