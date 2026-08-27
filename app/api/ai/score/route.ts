import { NextResponse } from "next/server";
import { getOpenAI } from "@/lib/openai";
import { guardAiRequest } from "@/lib/ai-guard";
import { AI_MODEL } from "@/lib/ai-model";

export async function POST(request: Request) {
  try {
    const guard = await guardAiRequest({ tier: "pro" });
    if (!guard.ok) return guard.response;

    const body = await request.json();
    const { resumeText } = body;

    if (!resumeText || typeof resumeText !== "string") {
      return NextResponse.json(
        { error: "resumeText is required" },
        { status: 400 }
      );
    }

    const completion = await getOpenAI().chat.completions.create({
      model: AI_MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are an expert resume reviewer and ATS specialist. Analyze the resume and provide: 1) An overall score from 0-100, 2) A list of specific improvement suggestions, 3) Keyword advice for better ATS performance. Return as JSON with fields: score (number), suggestions (string array), keywordAdvice (string array).",
        },
        {
          role: "user",
          content: resumeText,
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

    let parsed: { score?: number; suggestions?: string[]; keywordAdvice?: string[] };
    try {
      parsed = JSON.parse(content);
    } catch {
      return NextResponse.json(
        { error: "Failed to parse AI response" },
        { status: 500 }
      );
    }

    const score = typeof parsed.score === "number" ? parsed.score : 0;
    const suggestions = Array.isArray(parsed.suggestions) ? parsed.suggestions : [];
    const keywordAdvice = Array.isArray(parsed.keywordAdvice) ? parsed.keywordAdvice : [];

    return NextResponse.json({ score, suggestions, keywordAdvice });
  } catch (error) {
    console.error("POST /api/ai/score error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
