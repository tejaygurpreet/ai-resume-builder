import { NextResponse } from "next/server";
import { getOpenAI } from "@/lib/openai";
import { guardAiRequest, consumeAiGeneration } from "@/lib/ai-guard";
import { AI_MODEL } from "@/lib/ai-model";
import { NO_FABRICATION_RULE, sanitizeGeneratedText } from "@/lib/ai-prompts";

const MAX_TOKENS = 400;

type TransformType = "improve" | "shorten";

export async function POST(request: Request) {
  try {

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

    const guard = await guardAiRequest({ tier: "basic", resumeId });
    if (!guard.ok) return guard.response;
    const { isPro } = guard;

    const prompts: Record<TransformType, string> = {
      improve: isPro
        ? [
            "You are an elite executive resume writer. Rewrite this professional summary to be:",
            NO_FABRICATION_RULE,
            "- Achievement-focused with quantifiable impact where possible",
            "- 4–6 full sentences (at least 5 lines when formatted)",
            "- ATS-optimized with relevant keywords",
            "- Lead with experience level and value proposition",
            "- No generic phrases (team player, hard worker, passionate, etc.)",
            "- Professional, confident tone",
            "",
            "Original summary:",
            summary,
            "",
            "Return ONLY the improved summary text, 4–6 sentences.",
          ].join("\n")
        : [
            "You are an expert resume writer. Rewrite this professional summary to be:",
            NO_FABRICATION_RULE,
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
        NO_FABRICATION_RULE,
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
      model: AI_MODEL,
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
    const remaining = await consumeAiGeneration(resumeId, isPro);
    return NextResponse.json({ result, remaining, isPro });
  } catch (err) {
    console.error("Summary transform error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Transform failed" },
      { status: 500 }
    );
  }
}
