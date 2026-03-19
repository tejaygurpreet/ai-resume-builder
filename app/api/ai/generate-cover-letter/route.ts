import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getOpenAI } from "@/lib/openai";
import { prisma } from "@/lib/prisma";
import { blockAiIfExportOnly } from "@/lib/ai-access";

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

    const exportBlock = await blockAiIfExportOnly(userId);
    if (exportBlock) return exportBlock;

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

    const subscription = await prisma.subscription.findUnique({
      where: { userId },
    });

    const isPro =
      subscription?.plan === "pro" && subscription?.status === "active";

    if (!isPro) {
      return NextResponse.json(
        { error: "Cover letter generation is a Pro feature. Please upgrade.", proRequired: true },
        { status: 403 }
      );
    }

    const prompt = [
      "You are a professional cover letter writer.",
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

    return NextResponse.json({ result, isPro });
  } catch (err) {
    console.error("Cover letter generation error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Generation failed" },
      { status: 500 }
    );
  }
}
