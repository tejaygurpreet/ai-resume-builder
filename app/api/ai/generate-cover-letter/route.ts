import { NextResponse } from "next/server";
import { getOpenAI } from "@/lib/openai";
import { guardAiRequest } from "@/lib/ai-guard";
import { AI_MODEL } from "@/lib/ai-model";
import { NO_FABRICATION_RULE } from "@/lib/ai-prompts";

const MAX_TOKENS = 200;

export async function POST(request: Request) {
  try {
    const guard = await guardAiRequest({ tier: "pro" });
    if (!guard.ok) return guard.response;
    const { isPro } = guard;

    const body = await request.json();
    const { resumeText, jobTitle, company, jobDescription } = body as {
      resumeText?: string;
      jobTitle?: string;
      company?: string;
      jobDescription?: string;
    };

    if (!resumeText) {
      return NextResponse.json(
        { error: "Resume content is required" },
        { status: 400 }
      );
    }

    if (!jobTitle || !company) {
      return NextResponse.json(
        { error: "Job title and company name are required" },
        { status: 400 }
      );
    }

    const prompt = [
      "You are a professional cover letter writer.",
      NO_FABRICATION_RULE,
      "",
      "Write a compelling, concise cover letter (3-4 paragraphs) for this candidate.",
      "",
      "Requirements:",
      "- Professional and personalized tone",
      "- Reference specific experience from the resume",
      "- Show enthusiasm for the role and company",
      "- Keep it under 300 words",
      "- ATS-friendly format",
      "",
      `Job Title: ${jobTitle}`,
      `Company: ${company}`,
      jobDescription ? `\nJob Description:\n${jobDescription.slice(0, 800)}` : "",
      "",
      `Resume Summary:\n${resumeText.slice(0, 1200)}`,
      "",
      "Return only the cover letter text.",
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

    return NextResponse.json({ result, isPro });
  } catch (err) {
    console.error("Cover letter generation error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Generation failed" },
      { status: 500 }
    );
  }
}
