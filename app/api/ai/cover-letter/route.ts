import { NextResponse } from "next/server";
import { getOpenAI } from "@/lib/openai";
import { guardAiRequest } from "@/lib/ai-guard";
import { AI_MODEL } from "@/lib/ai-model";
import { NO_FABRICATION_RULE } from "@/lib/ai-prompts";

export async function POST(request: Request) {
  try {
    const guard = await guardAiRequest({ tier: "pro" });
    if (!guard.ok) return guard.response;

    const body = await request.json();
    const { resumeData, jobTitle, companyName } = body;

    if (!resumeData || !jobTitle || !companyName) {
      return NextResponse.json(
        { error: "resumeData, jobTitle, and companyName are required" },
        { status: 400 }
      );
    }

    const completion = await getOpenAI().chat.completions.create({
      model: AI_MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are an expert cover letter writer. " + NO_FABRICATION_RULE + "  Write a professional, personalized cover letter. The letter should be well-structured with an opening paragraph, 2-3 body paragraphs highlighting relevant experience, and a strong closing. Keep it concise and impactful. Return as JSON with field: coverLetter (string).",
        },
        {
          role: "user",
          content: `Resume Data: ${JSON.stringify(resumeData)}\n\nJob Title: ${jobTitle}\nCompany: ${companyName}`,
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

    let parsed: { coverLetter?: string };
    try {
      parsed = JSON.parse(content);
    } catch {
      return NextResponse.json(
        { error: "Failed to parse AI response" },
        { status: 500 }
      );
    }

    const coverLetter = typeof parsed.coverLetter === "string" ? parsed.coverLetter : "";

    return NextResponse.json({ coverLetter });
  } catch (error) {
    console.error("POST /api/ai/cover-letter error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
