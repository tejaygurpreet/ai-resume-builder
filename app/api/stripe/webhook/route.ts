import { NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function getPurchaseType(session: Stripe.Checkout.Session): string | null {
  const meta = session.metadata as Record<string, string> | null;
  return meta?.purchaseType ?? meta?.type ?? null;
}

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get("stripe-signature");

    if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
      return NextResponse.json(
        { error: "Missing webhook signature or secret" },
        { status: 400 }
      );
    }

    let event: Stripe.Event;
    try {
      event = getStripe().webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error("Webhook signature verification failed:", message);
      return NextResponse.json(
        { error: `Webhook Error: ${message}` },
        { status: 400 }
      );
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const email = session.customer_details?.email ?? session.customer_email;

        if (!email) {
          console.error("No email in checkout.session.completed");
          return NextResponse.json({ received: true }, { status: 200 });
        }

        const user = await prisma.user.findUnique({
          where: { email },
          include: { subscription: true },
        });

        if (!user) {
          console.error(`User not found for email: ${email}`);
          return NextResponse.json({ received: true }, { status: 200 });
        }

        const purchaseType = getPurchaseType(session);
        const stripeCustomerId =
          typeof session.customer === "string"
            ? session.customer
            : session.customer?.id ?? null;
        const stripeSubscriptionId =
          typeof session.subscription === "string"
            ? session.subscription
            : session.subscription?.id ?? null;

        // One-time payment (lifetime or one-time export) — no subscription
        if (session.mode === "payment") {
          if (purchaseType === "pro_lifetime") {
            await prisma.subscription.upsert({
              where: { userId: user.id },
              create: {
                userId: user.id,
                stripeCustomerId,
                plan: "pro",
                status: "active",
                stripeSubscriptionId: null,
              },
              update: {
                stripeCustomerId,
                plan: "pro",
                status: "active",
                stripeSubscriptionId: null,
              },
            });
          } else if (purchaseType === "one_time_export") {
            await prisma.subscription.upsert({
              where: { userId: user.id },
              create: {
                userId: user.id,
                stripeCustomerId,
                plan: "free",
                status: "active",
                oneTimeExport: true,
              },
              update: {
                stripeCustomerId,
                oneTimeExport: true,
              },
            });
          } else {
            // Fallback: infer from price ID when metadata is missing
            let priceId: string | undefined;
            if (session.line_items?.data?.[0]?.price) {
              const p = session.line_items.data[0].price;
              priceId = typeof p === "string" ? p : p.id;
            }
            if (!priceId && session.id) {
              const items = await getStripe().checkout.sessions.listLineItems(
                session.id,
                { limit: 1 }
              );
              const p = items.data[0]?.price;
              priceId = typeof p === "string" ? p : p?.id;
            }
            const lifetimePriceId = process.env.STRIPE_PRO_LIFETIME_PRICE_ID;
            const oneTimePriceId = process.env.STRIPE_ONE_TIME_PRICE_ID;

            if (lifetimePriceId && priceId === lifetimePriceId) {
              await prisma.subscription.upsert({
                where: { userId: user.id },
                create: {
                  userId: user.id,
                  stripeCustomerId,
                  plan: "pro",
                  status: "active",
                  stripeSubscriptionId: null,
                },
                update: {
                  stripeCustomerId,
                  plan: "pro",
                  status: "active",
                  stripeSubscriptionId: null,
                },
              });
            } else if (oneTimePriceId && priceId === oneTimePriceId) {
              await prisma.subscription.upsert({
                where: { userId: user.id },
                create: {
                  userId: user.id,
                  stripeCustomerId,
                  plan: "free",
                  status: "active",
                  oneTimeExport: true,
                },
                update: {
                  stripeCustomerId,
                  oneTimeExport: true,
                },
              });
            }
          }
          break;
        }

        // Subscription (monthly or annual)
        if (!stripeCustomerId || !stripeSubscriptionId) {
          console.error("Missing customer or subscription ID in session");
          return NextResponse.json({ received: true }, { status: 200 });
        }

        await prisma.subscription.upsert({
          where: { userId: user.id },
          create: {
            userId: user.id,
            stripeCustomerId,
            stripeSubscriptionId,
            plan: "pro",
            status: "active",
          },
          update: {
            stripeCustomerId,
            stripeSubscriptionId,
            plan: "pro",
            status: "active",
          },
        });
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;

        if (!invoice.subscription) break;

        const subscriptionId =
          typeof invoice.subscription === "string"
            ? invoice.subscription
            : invoice.subscription.id;

        const stripeSubscription = await getStripe().subscriptions.retrieve(
          subscriptionId
        );

        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: subscriptionId },
          data: {
            currentPeriodEnd: new Date(
              stripeSubscription.current_period_end * 1000
            ),
          },
        });
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;

        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: subscription.id },
          data: {
            status: subscription.status,
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          },
        });
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;

        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: subscription.id },
          data: {
            plan: "free",
            status: "canceled",
          },
        });
        break;
      }

      default:
        break;
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err) {
    console.error("Webhook handler error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Webhook handler failed" },
      { status: 500 }
    );
  }
}
