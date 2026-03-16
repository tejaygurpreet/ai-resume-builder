import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getStripe, PLANS } from "@/lib/stripe";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "You must be logged in to upgrade" },
        { status: 401 }
      );
    }

    const { plan } = await req.json();
    if (plan !== "pro") {
      return NextResponse.json(
        { error: "Invalid plan" },
        { status: 400 }
      );
    }

    const priceId = PLANS.pro.stripePriceId;
    if (!priceId) {
      return NextResponse.json(
        { error: "Pro plan is not configured" },
        { status: 500 }
      );
    }

    const baseUrl =
      process.env.NEXTAUTH_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
      "http://localhost:3000";

    const checkoutSession = await getStripe().checkout.sessions.create({
      mode: "subscription",
      line_items: [
        {
          price: priceId as string,
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/dashboard?upgraded=true`,
      cancel_url: `${baseUrl}/pricing`,
      customer_email: session.user.email,
      metadata: {
        userId: (session.user as any).id || "",
      },
    });

    return NextResponse.json({
      url: checkoutSession.url,
    });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Checkout failed" },
      { status: 500 }
    );
  }
}
