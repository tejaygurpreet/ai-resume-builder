import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAiBlockedForExportOnly } from "@/lib/membership";

const EXPORT_AI_MESSAGE =
  "AI features require Pro. Export Access includes unlimited exports only.";

/** Returns 403 NextResponse if user has Export-only plan, else null. */
export async function blockAiIfExportOnly(
  userId: string | undefined
): Promise<NextResponse | null> {
  if (!userId) {
    return NextResponse.json({ error: "Invalid session" }, { status: 401 });
  }
  const sub = await prisma.subscription.findUnique({
    where: { userId },
    select: { plan: true, oneTimeExport: true },
  });
  if (isAiBlockedForExportOnly(sub)) {
    return NextResponse.json(
      {
        error: EXPORT_AI_MESSAGE,
        code: "EXPORT_NO_AI",
        exportOnlyNoAI: true,
      },
      { status: 403 }
    );
  }
  return null;
}
