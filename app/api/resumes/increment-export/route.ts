import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const MAX_EXPORTS_FREE = 10;

function getUserId(session: unknown): string | undefined {
  const s = session as { user?: { id?: string } } | null;
  return s?.user?.id;
}

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    const userId = getUserId(session);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const subscription = await prisma.subscription.findUnique({
      where: { userId },
    });

    if (!subscription) {
      await prisma.subscription.create({
        data: {
          userId,
          plan: "free",
          status: "active",
          exportsUsed: 1,
          exportsResetAt: new Date(),
        },
      });
      return NextResponse.json({ exportsUsed: 1, success: true });
    }

    if (subscription.plan === "pro" || subscription.oneTimeExport) {
      return NextResponse.json({ exportsUsed: subscription.exportsUsed, success: true });
    }

    const now = new Date();
    const resetAt = subscription.exportsResetAt ?? now;
    const isNewMonth = resetAt.getMonth() !== now.getMonth() || resetAt.getFullYear() !== now.getFullYear();
    const currentUsed = isNewMonth ? 0 : (subscription.exportsUsed ?? 0);
    if (currentUsed >= MAX_EXPORTS_FREE) {
      return NextResponse.json(
        { error: "Export limit reached", exportsUsed: currentUsed },
        { status: 429 }
      );
    }

    const updates: { exportsUsed: number; exportsResetAt?: Date } = isNewMonth
      ? { exportsUsed: 1, exportsResetAt: now }
      : { exportsUsed: Math.min((subscription.exportsUsed ?? 0) + 1, MAX_EXPORTS_FREE) };

    const updated = await prisma.subscription.update({
      where: { userId },
      data: updates,
    });

    return NextResponse.json({
      exportsUsed: updated.exportsUsed,
      success: true,
    });
  } catch (error) {
    console.error("increment-export error:", error);
    return NextResponse.json(
      { error: "Failed to increment export count" },
      { status: 500 }
    );
  }
}
