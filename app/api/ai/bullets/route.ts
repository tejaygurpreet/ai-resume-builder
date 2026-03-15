import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { openai } from "@/lib/openai";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { jobTitle, company, responsibilities } = body;

    if (!jobTitle || !company || !responsibilities) {
      return NextResponse.json(
        { error: "jobTitle, company, and responsibilities are required" },
        { status: 400 }
      );
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an expert resume writer. Generate exactly 5 optimized, ATS-friendly resume bullet points. Each bullet should start with a strong action verb, include quantifiable metrics where possible, and be concise. Return as JSON with a 'bullets' field containing an array of 5 strings.",
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

    const bullets = Array.isArray(parsed.bullets)
      ? parsed.bullets
      : Array.isArray(parsed)
        ? parsed
        : [];

    return NextResponse.json({ bullets });
  } catch (error) {
    console.error("POST /api/ai/bullets error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
