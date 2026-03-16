import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getOpenAI } from "@/lib/openai";
import { prisma } from "@/lib/prisma";

const FREE_AI_LIMIT = 3;
const MODEL = "gpt-4o-mini";
const MAX_TOKENS = 200;

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
    const { bullet, jobTitle, resumeId } = body as {
      bullet?: string;
      jobTitle?: string;
      resumeId?: string;
    };

    if (!bullet || bullet.trim().length < 5) {
      return NextResponse.json(
        { error: "Please provide a bullet point to improve (at least 5 characters)" },
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

    const prompt = [
      "You are an expert resume writer. Rewrite this resume bullet point to be:",
      "- Action-oriented (start with a strong action verb)",
      "- Impactful (highlight measurable results)",
      "- ATS optimized (include relevant keywords)",
      "- Under 20 words",
      "",
      jobTitle ? `Job Title context: ${jobTitle}` : "",
      "",
      `Original bullet: ${bullet}`,
      "",
      "Return ONLY the improved bullet point text, nothing else.",
    ]
      .filter(Boolean)
      .join("\n");

    const openai = getOpenAI();
    const completion = await openai.chat.completions.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      temperature: 0.7,
      messages: [{ role: "user", content: prompt }],
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
    console.error("Improve bullet error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Improvement failed" },
      { status: 500 }
    );
  }
}
