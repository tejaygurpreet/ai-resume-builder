import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getOpenAI } from "@/lib/openai";
import { prisma } from "@/lib/prisma";
import { blockAiIfExportOnly } from "@/lib/ai-access";

const FREE_AI_LIMIT = 3;
const MODEL = "gpt-4o-mini";
const MAX_TOKENS = 400;

type GenerationType = "summary" | "experience" | "skills";

function buildPrompt(
  type: GenerationType,
  data: Record<string, string>,
  isPro: boolean
): string {
  switch (type) {
    case "summary":
      return isPro
        ? [
            "You are an elite executive resume writer. Write a compelling professional summary.",
            "",
            "Requirements:",
            "- Base the summary STRICTLY on the user's Work Experience and Skills provided below",
            "- Write 4–6 full sentences (at least 5 lines when formatted)",
            "- Lead with years of experience and target role",
            "- Highlight key achievements and quantifiable impact from their experience",
            "- Incorporate relevant skills naturally",
            "- Achievement-focused, professional, ATS-optimized",
            "- No generic phrases (team player, hard worker, etc.)",
            "",
            "User data:",
            `Name: ${data.name || "Not provided"}`,
            `Target Role: ${data.target_role || "Not provided"}`,
            `Experience: ${data.years_experience || "Not provided"}`,
            `Work Experience Detail: ${data.work_experience || "Not provided"}`,
            `Skills: ${data.skills || "Not provided"}`,
            "",
            "Return ONLY the summary text, 4–6 sentences.",
          ].join("\n")
        : [
            "You are a professional resume writer. Write a strong professional summary.",
            "",
            "Requirements:",
            "- Base it on the user's Work Experience and Skills below",
            "- Write at least 4–6 full sentences (5+ lines when formatted)",
            "- ATS friendly, highlight achievements and skills",
            "- Avoid generic phrases",
            "",
            "User data:",
            `Name: ${data.name || "Not provided"}`,
            `Role: ${data.target_role || "Not provided"}`,
            `Experience: ${data.years_experience || "Not provided"}`,
            `Work Experience: ${data.work_experience || "Not provided"}`,
            `Skills: ${data.skills || "Not provided"}`,
            "",
            "Return only the summary text, 4–6 sentences.",
          ].join("\n");

    case "experience":
      const dateRange = data.start_date || data.end_date
        ? `${data.start_date || "?"} – ${data.current === "true" ? "Present" : data.end_date || "?"}`
        : "";
      return isPro
        ? [
            "You are an elite resume writer. Generate 4–5 achievement-focused bullet points.",
            "",
            "Rules:",
            "- Base bullets on the job title, company, and dates provided",
            "- Start with strong action verbs (Led, Achieved, Increased, Delivered, etc.)",
            "- Include measurable impact (%, $, team size, time saved)",
            "- Achievement-oriented, not task lists",
            "- Under 25 words each, ATS-optimized",
            "",
            `Job Title: ${data.job_title || "Not provided"}`,
            `Company: ${data.company || "Not provided"}`,
            dateRange ? `Dates: ${dateRange}` : "",
            `Context/Responsibilities: ${data.responsibilities || "General duties"}`,
            "",
            "Return bullet points only, one per line, no numbering or bullet characters.",
          ]
            .filter(Boolean)
            .join("\n")
        : [
            "You are an expert resume writer. Generate 4 strong bullet points.",
            "",
            "Rules:",
            "- Base on job title, company, and dates provided",
            "- Start with action verbs, highlight measurable impact",
            "- ATS friendly, under 20 words each",
            "",
            `Job Title: ${data.job_title || "Not provided"}`,
            `Company: ${data.company || "Not provided"}`,
            dateRange ? `Dates: ${dateRange}` : "",
            `Responsibilities: ${data.responsibilities || "Not provided"}`,
            "",
            "Return bullet points only, one per line, no numbering or bullet characters.",
          ]
            .filter(Boolean)
            .join("\n");

    case "skills":
      return [
        "You are a professional resume writer. Generate a resume skills section.",
        "",
        "Rules:",
        "- Return 8–12 real, professional skills only",
        "- Use industry-standard skill names (e.g. JavaScript, Project Management, Agile)",
        "- Mix technical and soft skills relevant to the role",
        "- NO placeholder text, NO generic filler (e.g. 'skill 1', 'etc'), NO made-up skills",
        "- Each skill should be 2–4 words max, commonly recognized by recruiters and ATS",
        "",
        `Target Role: ${data.target_role || "Not specified"}`,
        `Industry: ${data.industry || "Not specified"}`,
        "",
        "Return ONLY a comma-separated list of skills. No numbering, bullets, or extra text.",
      ].join("\n");

    default:
      throw new Error(`Unknown generation type: ${type}`);
  }
}

async function callOpenAI(prompt: string): Promise<string> {
  const openai = getOpenAI();
  const completion = await openai.chat.completions.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    temperature: 0.7,
    messages: [{ role: "user", content: prompt }],
  });

  return completion.choices[0]?.message?.content?.trim() ?? "";
}

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
    const { type, data, resumeId } = body as {
      type?: string;
      data?: Record<string, string>;
      resumeId?: string;
    };

    if (!type || !["summary", "experience", "skills"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid type. Must be: summary, experience, or skills" },
        { status: 400 }
      );
    }

    if (!data || typeof data !== "object") {
      return NextResponse.json(
        { error: "Missing or invalid data object" },
        { status: 400 }
      );
    }

    if (!resumeId) {
      return NextResponse.json(
        { error: "resumeId is required" },
        { status: 400 }
      );
    }

    const resume = await prisma.resume.findFirst({
      where: { id: resumeId, userId },
    });

    if (!resume) {
      return NextResponse.json(
        { error: "Resume not found" },
        { status: 404 }
      );
    }

    const subscription = await prisma.subscription.findUnique({
      where: { userId },
    });

    const isPro =
      subscription?.plan === "pro" && subscription?.status === "active";

    if (!isPro && resume.aiGenerations >= FREE_AI_LIMIT) {
      return NextResponse.json(
        {
          error: "Free plan limit reached (3 AI generations per resume). Upgrade to Pro for unlimited.",
          limitReached: true,
        },
        { status: 403 }
      );
    }

    const prompt = buildPrompt(type as GenerationType, data, isPro);
    const result = await callOpenAI(prompt);

    if (!result) {
      return NextResponse.json(
        { error: "AI returned an empty response. Please try again." },
        { status: 500 }
      );
    }

    if (!isPro) {
      await prisma.resume.update({
        where: { id: resumeId },
        data: { aiGenerations: { increment: 1 } },
      });
    }

    const remaining = isPro
      ? null
      : Math.max(0, FREE_AI_LIMIT - (resume.aiGenerations + 1));

    return NextResponse.json({
      result,
      type,
      remaining,
      isPro,
    });
  } catch (err) {
    console.error("AI generate error:", err);
    const message =
      err instanceof Error ? err.message : "AI generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
