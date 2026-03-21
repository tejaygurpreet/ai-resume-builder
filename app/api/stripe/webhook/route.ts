/**
 * Stripe webhooks — App Router: POST /api/stripe/webhook
 *
 * Dashboard URL (example): https://optimacv.io/api/stripe/webhook
 * Local: stripe listen --forward-to localhost:3000/api/stripe/webhook
 *
 * **Pages Router vs App Router (raw body):**
 * `import { buffer } from 'micro'` and `export const config = { api: { bodyParser: false } }`
 * only work under `pages/api/...`. This handler is `app/api/.../route.ts` — there is no
 * `bodyParser` flag; read the body **once** as bytes: `Buffer.from(await request.arrayBuffer())`
 * and pass that Buffer to `stripe.webhooks.constructEvent` (same outcome as `micro`).
 *
 * Webhook signing secret: `STRIPE_LIVE_WEBHOOK_SECRET` (prod) / `STRIPE_TEST_WEBHOOK_SECRET` (dev),
 * or legacy `STRIPE_WEBHOOK_SECRET` (see `getStripeWebhookSecretForNodeEnv`).
 */

import { NextResponse } from "next/server";
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

/** Prevent static optimization / caching so Stripe POST always hits this route handler. */
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
 * Safe summary for logs (no full card / PII dumps).
 */
function summarizeStripeEvent(event: Stripe.Event): Record<string, unknown> {
  const common = {
    eventId: event.id,
    type: event.type,
    livemode: event.livemode,
    apiVersion: event.api_version,
    created: event.created,
  };

  switch (event.type) {
    case "checkout.session.completed": {
      const s = event.data.object as Stripe.Checkout.Session;
      return {
        ...common,
        sessionId: s.id,
        mode: s.mode,
        paymentStatus: s.payment_status,
        customer:
          typeof s.customer === "string" ? s.customer : s.customer?.id ?? null,
        subscription:
          typeof s.subscription === "string"
            ? s.subscription
            : s.subscription?.id ?? null,
        clientReferenceId: s.client_reference_id ? "present" : "missing",
        metadataKeys: s.metadata ? Object.keys(s.metadata) : [],
      };
    }
    case "invoice.paid":
    case "invoice.payment_succeeded": {
      const inv = event.data.object as Stripe.Invoice;
      return {
        ...common,
        invoiceId: inv.id,
        subscription:
          typeof inv.subscription === "string"
            ? inv.subscription
            : inv.subscription?.id ?? null,
        amountPaid: inv.amount_paid,
        currency: inv.currency,
      };
    }
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      return {
        ...common,
        subscriptionId: sub.id,
        status: sub.status,
        customer:
          typeof sub.customer === "string"
            ? sub.customer
            : sub.customer?.id ?? null,
        metadataKeys: sub.metadata ? Object.keys(sub.metadata) : [],
      };
    }
    default: {
      const obj = event.data?.object as { object?: string; id?: string } | null;
      return {
        ...common,
        objectType: obj?.object ?? "unknown",
        objectId: obj?.id ?? null,
      };
    }
  }
}

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
    eventType: "checkout.session.completed",
    sessionId: session.id,
    metadataUserId: metadata.userId ?? null,
    mode: session.mode,
    paymentStatus: session.payment_status,
    clientReferenceId: session.client_reference_id ? "present" : "missing",
    planType: metadata.planType,
    metadataUserEmail: metadata.userEmail ? "present" : "missing",
    subscriptionId:
      typeof session.subscription === "string"
        ? session.subscription
        : session.subscription?.id ?? null,
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
    eventType: event.type,
    invoiceId: invoice.id,
    subscriptionId: subscriptionId ?? null,
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
      ...(planInterval ? { planInterval, plan: "pro" } : {}),
      ...(priceId ? { stripePriceId: priceId } : {}),
    },
  });

  if (result.count === 0) {
    console.warn(
      "[webhook] invoice paid: no Subscription row matched stripeSubscriptionId (checkout.session.completed may not have run yet)",
      { subscriptionId }
    );
  } else {
    const rows = await prisma.subscription.findMany({
      where: { stripeSubscriptionId: subscriptionId },
      select: { userId: true },
      take: 5,
    });
    console.log("[webhook] Subscription refreshed from invoice", {
      eventType: event.type,
      subscriptionId,
      userIds: rows.map((r) => r.userId),
      rowsUpdated: result.count,
      planInterval,
      currentPeriodEnd: currentPeriodEnd?.toISOString() ?? null,
      status,
    });
  }
}

/**
 * customer.subscription.created / .updated — keep Prisma in sync; if no row yet,
 * upsert using subscription.metadata.userId (set via subscription_data on Checkout).
 */
async function handleSubscriptionCreatedOrUpdated(
  event: Stripe.Event
): Promise<void> {
  const subscription = event.data.object as Stripe.Subscription;
  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer?.id ?? null;
  const metaUserId = subscription.metadata?.userId?.trim() || null;

  const item = subscription.items?.data?.[0];
  const priceId = priceIdFromStripePrice(item?.price);
  const planInterval = planIntervalFromProPriceId(priceId);

  const currentPeriodEnd = subscription.current_period_end
    ? new Date(subscription.current_period_end * 1000)
    : null;

  const status =
    subscription.status === "trialing" || subscription.status === "active"
      ? "active"
      : subscription.status;

  const result = await prisma.subscription.updateMany({
    where: { stripeSubscriptionId: subscription.id },
    data: {
      status,
      ...(currentPeriodEnd ? { currentPeriodEnd } : {}),
      ...(planInterval ? { planInterval, plan: "pro" } : {}),
      ...(priceId ? { stripePriceId: priceId } : {}),
      ...(customerId ? { stripeCustomerId: customerId } : {}),
    },
  });

  if (result.count === 0 && metaUserId && customerId) {
    await prisma.subscription.upsert({
      where: { userId: metaUserId },
      create: {
        userId: metaUserId,
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscription.id,
        stripePriceId: priceId,
        plan: "pro",
        planInterval: planInterval ?? "monthly",
        status,
        currentPeriodEnd,
      },
      update: {
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscription.id,
        stripePriceId: priceId ?? undefined,
        plan: "pro",
        ...(planInterval ? { planInterval } : {}),
        status,
        ...(currentPeriodEnd ? { currentPeriodEnd } : {}),
      },
    });
    console.log("[webhook] subscription row upserted from subscription metadata", {
      type: event.type,
      subscriptionId: subscription.id,
      userId: metaUserId,
    });
    return;
  }

  console.log("[webhook] customer.subscription sync", {
    eventType: event.type,
    subscriptionId: subscription.id,
    metadataUserId: metaUserId,
    stripeStatus: subscription.status,
    rowsUpdated: result.count,
    currentPeriodEnd: subscription.current_period_end
      ? new Date(subscription.current_period_end * 1000).toISOString()
      : null,
  });
}

async function handleSubscriptionDeleted(event: Stripe.Event): Promise<void> {
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

/**
 * Stripe only POSTs events. Expose GET so visiting the URL in a browser or uptime
 * checker does not return 404 (common confusion vs failed POST).
 */
export async function GET() {
  return NextResponse.json(
    {
      ok: true,
      service: "stripe-webhook",
      hint: "Stripe sends signed POST requests to this path.",
      expectedDashboardUrl: "https://optimacv.io/api/stripe/webhook",
    },
    { status: 200 }
  );
}

export async function POST(req: Request) {
  // App Router raw body (equivalent to `micro` buffer + bodyParser: false on pages/api).
  const rawBody = Buffer.from(await req.arrayBuffer());
  const signature = req.headers.get("stripe-signature");

  const webhookSecret =
    getStripeWebhookSecretForNodeEnv() ??
    process.env.STRIPE_WEBHOOK_SECRET?.trim() ??
    null;

  if (!signature || !webhookSecret) {
    console.error("[webhook] Missing stripe-signature header or webhook secret", {
      hasSignature: !!signature,
      hasSecret: !!webhookSecret,
      bodyBytes: rawBody.length,
      hint:
        "Set STRIPE_TEST_WEBHOOK_SECRET (dev) or STRIPE_LIVE_WEBHOOK_SECRET (prod), or STRIPE_WEBHOOK_SECRET",
    });
    return NextResponse.json(
      { error: "Missing webhook signature or secret" },
      { status: 400 }
    );
  }

  const stripe = getStripe();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[webhook] Signature verification failed:", message, {
      bodyBytes: rawBody.length,
    });
    return NextResponse.json(
      { error: `Webhook Error: ${message}` },
      { status: 400 }
    );
  }

  console.log("Webhook hit:", event.type);
  console.log("[webhook] payload summary:", summarizeStripeEvent(event));

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(event);
        break;

      case "invoice.paid":
      case "invoice.payment_succeeded":
        await handleInvoicePaid(event);
        break;

      case "customer.subscription.created":
      case "customer.subscription.updated":
        await handleSubscriptionCreatedOrUpdated(event);
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event);
        break;

      default:
        console.log("[webhook] unhandled event type (ignored)", event.type, {
          eventId: event.id,
        });
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

/* === WEBHOOK 404 FIXED + RAW BODY + METADATA + EVENT HANDLING === */
