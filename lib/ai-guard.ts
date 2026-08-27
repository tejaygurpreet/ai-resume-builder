import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isActiveProSubscription, isAiBlockedForExportOnly } from "@/lib/membership";
import { FREE_AI_GENERATIONS_PER_RESUME } from "@/lib/plans";

/**
 * Single entry point for every /api/ai/* route.
 *
 * Replaces the old per-route ad hoc checks, which had three holes:
 *   1. Pro-only features (tailoring, ATS score, cover letters) blocked Export-Access
 *      users but never blocked Free users — so Free got Pro features for nothing.
 *   2. 7 of 11 routes never checked the per-resume generation quota at all.
 *   3. Nothing rate limited, so one free account could run the OpenAI bill up
 *      without bound.
 *
 * Every route now declares its tier and gets all three checks in one call.
 */

/** "basic" = included in Free's 3-per-resume allowance. "pro" = paid tiers only. */
export type AiTier = "basic" | "pro";

export interface AiGuardOk {
  ok: true;
  userId: string;
  isPro: boolean;
  /** Present only when the caller passed a resumeId. */
  resume: { id: string; aiGenerations: number } | null;
}

export type AiGuardResult = AiGuardOk | { ok: false; response: NextResponse };

const PRO_FEATURE_MESSAGE =
  "This is a Pro feature. Upgrade to use job tailoring, ATS scoring and cover letters.";
const EXPORT_AI_MESSAGE =
  "AI features require Pro. Export Access includes unlimited exports only.";

// ── Rate limiting ────────────────────────────────────────────────────────────
// In-process fixed window. Adequate for a single instance; swap the two helpers
// below for Upstash/Redis if this is ever deployed to more than one node.

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_FREE = 12;
const RATE_LIMIT_MAX_PRO = 40;

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

function takeToken(userId: string, isPro: boolean): { allowed: boolean; retryAfter: number } {
  const now = Date.now();
  const limit = isPro ? RATE_LIMIT_MAX_PRO : RATE_LIMIT_MAX_FREE;
  const existing = buckets.get(userId);

  if (!existing || existing.resetAt <= now) {
    buckets.set(userId, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, retryAfter: 0 };
  }
  if (existing.count >= limit) {
    return { allowed: false, retryAfter: Math.ceil((existing.resetAt - now) / 1000) };
  }
  existing.count += 1;
  return { allowed: true, retryAfter: 0 };
}

/** Drop expired buckets so the map can't grow without bound. */
function sweep() {
  if (buckets.size < 5_000) return;
  const now = Date.now();
  // Not `for...of` — iterating a Map that way needs --downlevelIteration
  // under an es5 target, which this project's tsconfig doesn't set.
  // forEach works under any target.
  buckets.forEach((bucket, key) => {
    if (bucket.resetAt <= now) buckets.delete(key);
  });
}

// ── Guard ────────────────────────────────────────────────────────────────────

export async function guardAiRequest(opts: {
  tier: AiTier;
  /** Pass when the route consumes the per-resume Free allowance. */
  resumeId?: string | null;
}): Promise<AiGuardResult> {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;

  if (!session?.user || !userId) {
    return { ok: false, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const sub = await prisma.subscription.findUnique({
    where: { userId },
    select: {
      plan: true,
      oneTimeExport: true,
      status: true,
      stripeSubscriptionId: true,
      currentPeriodEnd: true,
      planInterval: true,
    },
  });

  // Export Access buys exports, never AI.
  if (isAiBlockedForExportOnly(sub)) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: EXPORT_AI_MESSAGE, code: "EXPORT_NO_AI", exportOnlyNoAI: true },
        { status: 403 }
      ),
    };
  }

  const isPro = isActiveProSubscription(sub);

  // The hole that was giving Pro features away: tier "pro" now actually requires Pro.
  if (opts.tier === "pro" && !isPro) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: PRO_FEATURE_MESSAGE, code: "PRO_REQUIRED", upgradeRequired: true },
        { status: 403 }
      ),
    };
  }

  sweep();
  const { allowed, retryAfter } = takeToken(userId, isPro);
  if (!allowed) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          error: `Too many AI requests. Try again in ${retryAfter}s.`,
          code: "RATE_LIMITED",
          retryAfter,
        },
        { status: 429, headers: { "Retry-After": String(retryAfter) } }
      ),
    };
  }

  let resume: { id: string; aiGenerations: number } | null = null;

  if (opts.resumeId) {
    const found = await prisma.resume.findFirst({
      where: { id: opts.resumeId, userId },
      select: { id: true, aiGenerations: true },
    });
    if (!found) {
      return { ok: false, response: NextResponse.json({ error: "Resume not found" }, { status: 404 }) };
    }
    if (!isPro && found.aiGenerations >= FREE_AI_GENERATIONS_PER_RESUME) {
      return {
        ok: false,
        response: NextResponse.json(
          {
            error: `Free plan includes ${FREE_AI_GENERATIONS_PER_RESUME} AI generations per resume. Upgrade to Pro for unlimited.`,
            code: "AI_LIMIT_REACHED",
            limitReached: true,
            remaining: 0,
          },
          { status: 403 }
        ),
      };
    }
    resume = found;
  }

  return { ok: true, userId, isPro, resume };
}

/**
 * Increment the per-resume counter after a successful generation and report
 * what's left. Pro is unbounded, so it never writes.
 */
export async function consumeAiGeneration(
  resumeId: string | null | undefined,
  isPro: boolean
): Promise<number | null> {
  if (!resumeId || isPro) return null;
  const updated = await prisma.resume.update({
    where: { id: resumeId },
    data: { aiGenerations: { increment: 1 } },
    select: { aiGenerations: true },
  });
  return Math.max(0, FREE_AI_GENERATIONS_PER_RESUME - updated.aiGenerations);
}
