import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getOpenAI } from "@/lib/openai";

const MODEL = "gpt-4o-mini";
const MAX_TOKENS = 200;

function buildScorePrompt(resumeText: string): string {
  return [
    "You are an ATS (Applicant Tracking System) expert.",
    "",
    "Score this resume on a scale of 0-100 based on:",
    "- Keyword optimization (25 points)",
    "- Measurable achievements with numbers/metrics (25 points)",
    "- Bullet point quality and action verbs (25 points)",
    "- Formatting and length appropriateness (25 points)",
    "",
    "Resume:",
    resumeText.slice(0, 2000),
    "",
    "Return ONLY a JSON object (no markdown fences):",
    '{ "score": 82, "breakdown": { "keywords": 20, "achievements": 18, "bulletQuality": 22, "formatting": 22 }, "suggestions": ["Add measurable achievements", "Include industry keywords", "Shorten bullet points"] }',
  ].join("\n");
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { resumeText } = body as { resumeText?: string };

    if (!resumeText || resumeText.trim().length < 20) {
      return NextResponse.json(
        { error: "Resume content is too short to score" },
        { status: 400 }
      );
    }

    const openai = getOpenAI();
    const prompt = buildScorePrompt(resumeText);

    const completion = await openai.chat.completions.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      temperature: 0.3,
      messages: [{ role: "user", content: prompt }],
    });

    const raw = completion.choices[0]?.message?.content?.trim() ?? "";

    let result;
    try {
      result = JSON.parse(raw);
    } catch {
      result = {
        score: 0,
        breakdown: { keywords: 0, achievements: 0, bulletQuality: 0, formatting: 0 },
        suggestions: ["Could not parse score. Please try again."],
      };
    }

    return NextResponse.json({ result });
  } catch (err) {
    console.error("ATS score error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Scoring failed" },
      { status: 500 }
    );
  }
}
