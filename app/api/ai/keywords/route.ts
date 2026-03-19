import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getOpenAI } from "@/lib/openai";
import { blockAiIfExportOnly } from "@/lib/ai-access";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id?: string }).id;
    const exportBlock = await blockAiIfExportOnly(userId);
    if (exportBlock) return exportBlock;

    const body = await request.json();
    const { resumeText, jobDescription } = body;

    if (!resumeText || !jobDescription) {
      return NextResponse.json(
        { error: "resumeText and jobDescription are required" },
        { status: 400 }
      );
    }

    const completion = await getOpenAI().chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an ATS optimization expert. Compare the resume against the job description and identify: 1) Keywords present in the job description but missing from the resume, 2) Keywords that are well-matched, 3) Optimization tips to better align the resume with the job. Return as JSON with fields: missingKeywords (string array), matchedKeywords (string array), tips (string array).",
        },
        {
          role: "user",
          content: `Resume:\n${resumeText}\n\nJob Description:\n${jobDescription}`,
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

    let parsed: {
      missingKeywords?: string[];
      matchedKeywords?: string[];
      tips?: string[];
    };
    try {
      parsed = JSON.parse(content);
    } catch {
      return NextResponse.json(
        { error: "Failed to parse AI response" },
        { status: 500 }
      );
    }

    const missingKeywords = Array.isArray(parsed.missingKeywords)
      ? parsed.missingKeywords
      : [];
    const matchedKeywords = Array.isArray(parsed.matchedKeywords)
      ? parsed.matchedKeywords
      : [];
    const tips = Array.isArray(parsed.tips) ? parsed.tips : [];

    return NextResponse.json({
      missingKeywords,
      matchedKeywords,
      tips,
    });
  } catch (error) {
    console.error("POST /api/ai/keywords error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
