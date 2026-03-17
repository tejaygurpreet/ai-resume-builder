import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getOpenAI } from "@/lib/openai";
import { prisma } from "@/lib/prisma";

const FREE_AI_LIMIT = 3;
const MODEL = "gpt-4o-mini";
const MAX_TOKENS = 400;

type TransformType = "improve" | "shorten";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id?: string }).id;
    if (!userId) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    const body = await request.json();
    const { summary, action, resumeId } = body as {
      summary?: string;
      action?: TransformType;
      resumeId?: string;
    };

    if (!summary || summary.trim().length < 20) {
      return NextResponse.json(
        { error: "Summary must be at least 20 characters" },
        { status: 400 }
      );
    }

    if (!action || !["improve", "shorten"].includes(action)) {
      return NextResponse.json(
        { error: "Action must be 'improve' or 'shorten'" },
        { status: 400 }
      );
    }

    if (!resumeId) {
      return NextResponse.json(
        { error: "resumeId is required" },
        { status: 400 }
      );
    }

    const resume = await prisma.resume.findFirst({
      where: { id: resumeId, userId },
    });

    if (!resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    const subscription = await prisma.subscription.findUnique({
      where: { userId },
    });

    const isPro =
      subscription?.plan === "pro" && subscription?.status === "active";

    if (!isPro && resume.aiGenerations >= FREE_AI_LIMIT) {
      return NextResponse.json(
        {
          error: "Free plan limit reached. Upgrade to Pro for unlimited AI.",
          limitReached: true,
        },
        { status: 403 }
      );
    }

    const prompts: Record<TransformType, string> = {
      improve: [
        "You are an expert resume writer. Rewrite this professional summary to be:",
        "- More impactful and achievement-focused",
        "- ATS-optimized with relevant keywords",
        "- Professional and concise (3-4 lines)",
        "- Free of generic phrases like 'team player' or 'hard worker'",
        "",
        "Original summary:",
        summary,
        "",
        "Return ONLY the improved summary text, nothing else.",
      ].join("\n"),

      shorten: [
        "You are an expert resume writer. Condense this professional summary to 2-3 concise lines.",
        "Keep the most impactful achievements and skills. Remove filler words.",
        "",
        "Original summary:",
        summary,
        "",
        "Return ONLY the shortened summary text, nothing else.",
      ].join("\n"),
    };

    const openai = getOpenAI();
    const completion = await openai.chat.completions.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      temperature: 0.6,
      messages: [{ role: "user", content: prompts[action] }],
    });

    const result = completion.choices[0]?.message?.content?.trim() ?? "";

    if (!result) {
      return NextResponse.json(
        { error: "AI returned empty response. Please try again." },
        { status: 500 }
      );
    }

    if (!isPro) {
      await prisma.resume.update({
        where: { id: resumeId },
        data: { aiGenerations: { increment: 1 } },
      });
    }

    const remaining = isPro
      ? null
      : Math.max(0, FREE_AI_LIMIT - (resume.aiGenerations + 1));

    return NextResponse.json({ result, remaining, isPro });
  } catch (err) {
    console.error("Summary transform error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Transform failed" },
      { status: 500 }
    );
  }
}
