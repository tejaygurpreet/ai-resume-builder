import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getOpenAI } from "@/lib/openai";
import { prisma } from "@/lib/prisma";

const FREE_AI_LIMIT = 3;
const MODEL = "gpt-4o-mini";
const MAX_TOKENS = 200;

type GenerationType = "summary" | "experience" | "skills";

function buildPrompt(type: GenerationType, data: Record<string, string>): string {
  switch (type) {
    case "summary":
      return [
        "You are a professional resume writer.",
        "",
        "Write a strong professional resume summary (3–4 lines).",
        "",
        "Requirements:",
        "- ATS friendly",
        "- concise and impactful",
        "- highlight achievements and skills",
        "- avoid generic phrases",
        "",
        "User data:",
        `Name: ${data.name || "Not provided"}`,
        `Role: ${data.target_role || "Not provided"}`,
        `Experience: ${data.years_experience || "Not provided"}`,
        `Skills: ${data.skills || "Not provided"}`,
        "",
        "Return only the summary text.",
      ].join("\n");

    case "experience":
      return [
        "You are an expert resume writer.",
        "",
        "Generate 4 strong resume bullet points.",
        "",
        "Rules:",
        "- start with action verbs",
        "- highlight measurable impact",
        "- ATS friendly",
        "- professional tone",
        "- under 20 words each",
        "",
        `Job Title: ${data.job_title || "Not provided"}`,
        `Company: ${data.company || "Not provided"}`,
        `Responsibilities: ${data.responsibilities || "Not provided"}`,
        "",
        "Return bullet points only, one per line, without numbering or bullet characters.",
      ].join("\n");

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

    const prompt = buildPrompt(type as GenerationType, data);
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
