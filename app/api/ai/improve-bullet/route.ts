import { NextResponse } from "next/server";
import { getOpenAI } from "@/lib/openai";
import { guardAiRequest, consumeAiGeneration } from "@/lib/ai-guard";
import { AI_MODEL } from "@/lib/ai-model";
import { NO_FABRICATION_RULE, sanitizeGeneratedText } from "@/lib/ai-prompts";

const MAX_TOKENS = 200;

export async function POST(request: Request) {
  try {

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

    const guard = await guardAiRequest({ tier: "basic", resumeId });
    if (!guard.ok) return guard.response;
    const { isPro } = guard;

    const prompt = [
      "You are an expert resume writer. Rewrite this resume bullet point to be:",
      NO_FABRICATION_RULE,
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
      model: AI_MODEL,
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
    const remaining = await consumeAiGeneration(resumeId, isPro);
    return NextResponse.json({ result, remaining, isPro });
  } catch (err) {
    console.error("Improve bullet error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Improvement failed" },
      { status: 500 }
    );
  }
}
