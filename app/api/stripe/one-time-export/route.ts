import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getStripe, PLANS } from "@/lib/stripe";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "You must be logged in" },
        { status: 401 }
      );
    }

    const priceId = PLANS.oneTimeExport.stripePriceId;
    if (!priceId) {
      return NextResponse.json(
        { error: "One-time export is not configured" },
        { status: 500 }
      );
    }

    const baseUrl =
      process.env.NEXTAUTH_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
      "http://localhost:3000";

    const checkoutSession = await getStripe().checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: priceId as string, quantity: 1 }],
      success_url: `${baseUrl}/dashboard?exportUnlocked=true`,
      cancel_url: `${baseUrl}/pricing`,
      customer_email: session.user.email,
      metadata: {
        userId: (session.user as any).id || "",
        type: "one_time_export",
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (err) {
    console.error("One-time export checkout error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Checkout failed" },
      { status: 500 }
    );
  }
}
