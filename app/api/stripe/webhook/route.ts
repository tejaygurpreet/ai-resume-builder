import { NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { getStripeWebhookSecretForNodeEnv } from "@/lib/stripe-env";
import { prisma } from "@/lib/prisma";
import {
  getExportPriceId,
  getProAnnualPriceId,
  getProLifetimePriceId,
  getProMonthlyPriceId,
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
  const validPlanTypes: PlanType[] = ["pro_monthly", "pro_annual", "pro_lifetime", "one_time_export"];
  return {
    userId: meta.userId?.trim() || null,
    userEmail: meta.userEmail?.trim() || null,
    planType: validPlanTypes.includes(planType as PlanType) ? (planType as PlanType) : null,
  };
}

async function findUser(
  metadata: { userId: string | null; userEmail: string | null },
  customerEmail: string | null
): Promise<{ id: string; email: string } | null> {
  if (metadata.userId) {
    const user = await prisma.user.findUnique({
      where: { id: metadata.userId },
      select: { id: true, email: true },
    });
    if (user) return user;
  }
  const emailToTry = metadata.userEmail || customerEmail;
  if (emailToTry) {
    const user = await prisma.user.findUnique({
      where: { email: emailToTry },
      select: { id: true, email: true },
    });
    if (user) return user;
  }
  return null;
}

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get("stripe-signature");

    const webhookSecret = getStripeWebhookSecretForNodeEnv();
    if (!signature || !webhookSecret) {
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
        webhookSecret
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
        const metadata = getMetadata(session);
        const customerEmail =
          session.customer_details?.email ?? session.customer_email ?? null;

        console.log("[webhook] checkout.session.completed", {
          planType: metadata.planType,
          metadataUserId: metadata.userId ? "present" : "missing",
          metadataUserEmail: metadata.userEmail ? "present" : "missing",
        });

        const user = await findUser(metadata, customerEmail);

        if (!user) {
          console.error("[webhook] User not found", {
            metadataUserId: metadata.userId,
            metadataUserEmail: metadata.userEmail,
            customerEmail,
          });
          return NextResponse.json({ received: true }, { status: 200 });
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
                console.log("[webhook] Canceled existing subscription for lifetime upgrade", {
                  subscriptionId: existingSub.stripeSubscriptionId,
                });
              } catch (cancelErr) {
                console.error("[webhook] Failed to cancel existing subscription:", cancelErr);
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
          } else if (planType === "one_time_export") {
            const existingSub = await prisma.subscription.findUnique({
              where: { userId: user.id },
            });
            if (existingSub?.stripeSubscriptionId) {
              try {
                await getStripe().subscriptions.update(
                  existingSub.stripeSubscriptionId,
                  { cancel_at_period_end: true }
                );
                console.log("[webhook] Set Pro subscription to cancel at period end for Export purchase", {
                  subscriptionId: existingSub.stripeSubscriptionId,
                });
              } catch (cancelErr) {
                console.error("[webhook] Failed to cancel Pro for Export purchase:", cancelErr);
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
          } else {
            const lifetimePriceId = getProLifetimePriceId();
            const oneTimePriceId = getExportPriceId();
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
            if (lifetimePriceId && priceId === lifetimePriceId) {
              const existingSub = await prisma.subscription.findUnique({
                where: { userId: user.id },
              });
              if (existingSub?.stripeSubscriptionId) {
                try {
                  await getStripe().subscriptions.cancel(
                    existingSub.stripeSubscriptionId
                  );
                } catch {}
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
            } else if (oneTimePriceId && priceId === oneTimePriceId) {
              const existingSubForExport = await prisma.subscription.findUnique({
                where: { userId: user.id },
              });
              if (existingSubForExport?.stripeSubscriptionId) {
                try {
                  await getStripe().subscriptions.update(
                    existingSubForExport.stripeSubscriptionId,
                    { cancel_at_period_end: true }
                  );
                } catch {}
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
            }
          }
          break;
        }

        const isRecurringPro =
          planType === "pro_monthly" ||
          planType === "pro_annual" ||
          (session.mode === "subscription" && !planType);
        if (isRecurringPro) {
          if (!stripeCustomerId || !stripeSubscriptionId) {
            console.error("[webhook] Missing customer or subscription ID for recurring plan");
            return NextResponse.json({ received: true }, { status: 200 });
          }
          const planInterval =
            planType === "pro_annual" ? "annual" : planType === "pro_monthly" ? "monthly" : "monthly";
          await prisma.subscription.upsert({
            where: { userId: user.id },
            create: {
              userId: user.id,
              stripeCustomerId,
              stripeSubscriptionId,
              plan: "pro",
              planInterval,
              status: "active",
            },
            update: {
              stripeCustomerId,
              stripeSubscriptionId,
              plan: "pro",
              planInterval,
              status: "active",
            },
          });
          console.log("[webhook] Access updated: recurring Pro", {
            planType,
            planInterval,
            userId: user.id,
            userEmail: user.email,
          });
        }
        break;
      }

      case "invoice.paid":
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
        const line = invoice.lines?.data?.[0];
        const priceId =
          line?.price && typeof line.price !== "string"
            ? line.price.id
            : typeof line?.price === "string"
              ? line.price
              : null;
        const planInterval = planIntervalFromProPriceId(priceId);
        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: subscriptionId },
          data: {
            currentPeriodEnd: new Date(
              stripeSubscription.current_period_end * 1000
            ),
            ...(planInterval && { planInterval }),
          },
        });
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const item = subscription.items?.data?.[0];
        const priceId =
          item?.price && typeof item.price !== "string"
            ? item.price.id
            : typeof item?.price === "string"
              ? item.price
              : null;
        const planInterval = planIntervalFromProPriceId(priceId);
        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: subscription.id },
          data: {
            status: subscription.status,
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            ...(planInterval && { planInterval }),
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
