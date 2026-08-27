import { NextResponse } from "next/server";
import { getOpenAI } from "@/lib/openai";
import { guardAiRequest } from "@/lib/ai-guard";
import { AI_MODEL } from "@/lib/ai-model";
import { NO_FABRICATION_RULE, sanitizeGeneratedText } from "@/lib/ai-prompts";

const MAX_TOKENS = 200;

function buildTailorPrompt(
  resumeText: string,
  jobDescription: string
): string {
  return [
    "You are an expert ATS resume optimizer.",
      NO_FABRICATION_RULE,
    "",
    "Analyze the job description and optimize the resume content to better match it.",
    "",
    "Tasks:",
    "1. Identify important keywords from the job description",
    "2. Suggest optimized bullet points that incorporate these keywords",
    "3. Highlight missing skills or qualifications",
    "4. Provide an ATS compatibility assessment",
    "",
    "Job Description:",
    jobDescription.slice(0, 1500),
    "",
    "Current Resume Content:",
    resumeText.slice(0, 1500),
    "",
    "Return a JSON object with these fields:",
    '{ "keywords": ["keyword1", ...], "optimizedBullets": ["bullet1", ...], "missingSKills": ["skill1", ...], "suggestions": ["suggestion1", ...], "matchScore": 75 }',
    "",
    "Return ONLY valid JSON, no markdown fences.",
  ].join("\n");
}

export async function POST(request: Request) {
  try {
    const guard = await guardAiRequest({ tier: "pro" });
    if (!guard.ok) return guard.response;
    const { isPro } = guard;

    const body = await request.json();
    const { resumeText, jobDescription, resumeId } = body as {
      resumeText?: string;
      jobDescription?: string;
      resumeId?: string;
    };

    if (!jobDescription || jobDescription.trim().length < 20) {
      return NextResponse.json(
        { error: "Please provide a valid job description (at least 20 characters)" },
        { status: 400 }
      );
    }

    if (!resumeText) {
      return NextResponse.json(
        { error: "Resume content is required" },
        { status: 400 }
      );
    }

    const openai = getOpenAI();
    const prompt = buildTailorPrompt(resumeText, jobDescription);

    const completion = await openai.chat.completions.create({
      model: AI_MODEL,
      max_tokens: MAX_TOKENS,
      temperature: 0.7,
      messages: [{ role: "user", content: prompt }],
    });

    const raw = completion.choices[0]?.message?.content?.trim() ?? "";

    let result;
    try {
      result = JSON.parse(raw);
    } catch {
      result = {
        keywords: [],
        optimizedBullets: [],
        missingSkills: [],
        suggestions: [raw],
        matchScore: 0,
      };
    }

    return NextResponse.json({ result, isPro });
  } catch (err) {
    console.error("Tailor resume error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Tailoring failed" },
      { status: 500 }
    );
  }
}
