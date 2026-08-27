import { NextResponse } from "next/server";
import { getOpenAI } from "@/lib/openai";
import { guardAiRequest } from "@/lib/ai-guard";
import { AI_MODEL } from "@/lib/ai-model";
import { resumeWriterSystemPrompt, sanitizeGeneratedList } from "@/lib/ai-prompts";

export async function POST(request: Request) {
  try {
    const guard = await guardAiRequest({ tier: "basic" });
    if (!guard.ok) return guard.response;

    const body = await request.json();
    const { jobTitle, company, responsibilities } = body;

    if (!jobTitle || !company || !responsibilities) {
      return NextResponse.json(
        { error: "jobTitle, company, and responsibilities are required" },
        { status: 400 }
      );
    }

    const completion = await getOpenAI().chat.completions.create({
      model: AI_MODEL,
      messages: [
        {
          role: "system",
          content:
            resumeWriterSystemPrompt(
            "Generate exactly 5 bullet points from the role details supplied. " +
            'Respond as JSON: {"bullets": ["...", "...", "...", "...", "..."]}'
          ),
        },
        {
          role: "user",
          content: `Job Title: ${jobTitle}\nCompany: ${company}\nResponsibilities: ${responsibilities}`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json(
        { error: "No response from AI" },
        { status: 500 }
      );
    }

    let parsed: { bullets?: string[] };
    try {
      parsed = JSON.parse(content);
    } catch {
      return NextResponse.json(
        { error: "Failed to parse AI response" },
        { status: 500 }
      );
    }

    const raw = Array.isArray(parsed.bullets)
      ? parsed.bullets
      : Array.isArray(parsed)
        ? parsed
        : [];

    // Strip markdown, stray list markers and emoji before this text can land in
    // a template and end up in an exported PDF.
    const bullets = sanitizeGeneratedList(raw);

    return NextResponse.json({ bullets });
  } catch (error) {
    console.error("POST /api/ai/bullets error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
