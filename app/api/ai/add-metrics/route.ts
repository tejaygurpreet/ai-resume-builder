import { NextResponse } from "next/server";
import { getOpenAI } from "@/lib/openai";
import { guardAiRequest, consumeAiGeneration } from "@/lib/ai-guard";
import { AI_MODEL } from "@/lib/ai-model";
import { NO_FABRICATION_RULE, sanitizeGeneratedText } from "@/lib/ai-prompts";

const MAX_TOKENS = 150;

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
        { error: "Please provide a bullet point (at least 5 characters)" },
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

    // This prompt previously said: "Add realistic numbers: percentages, dollar
    // amounts, team sizes, time saved, users served, etc." The model has no
    // access to any of those figures, so it invented them — and the user pasted
    // fabricated achievements onto a hiring document they could not defend.
    // It now inserts labelled placeholders instead, so the candidate supplies
    // the real value and the resume stays truthful.
    const prompt = [
      "You are an expert resume writer. Rewrite this bullet point so it is ready to carry a measurable result.",
      "",
      NO_FABRICATION_RULE,
      "",
      "Rules:",
      "- Keep the original action, scope and context exactly as given",
      "- Restructure so the outcome leads, rather than the task",
      "- Where a number belongs, insert a bracketed placeholder that names the unit:",
      "  [X%], [$X], [N users], [N engineers], [X hours/week], [N teams]",
      "- Never substitute an actual figure for a placeholder",
      "- Open with a concrete past-tense verb",
      "- Under 25 words",
      "",
      jobTitle ? `Job context: ${jobTitle}` : "",
      "",
      `Original bullet: ${bullet}`,
      "",
      "Return ONLY the rewritten bullet, nothing else.",
    ]
      .filter(Boolean)
      .join("\n");

    const openai = getOpenAI();
    const completion = await openai.chat.completions.create({
      model: AI_MODEL,
      max_tokens: MAX_TOKENS,
      temperature: 0.6,
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
    console.error("Add metrics error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to add metrics" },
      { status: 500 }
    );
  }
}
