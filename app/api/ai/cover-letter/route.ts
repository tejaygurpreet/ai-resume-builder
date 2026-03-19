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
    const { resumeData, jobTitle, companyName } = body;

    if (!resumeData || !jobTitle || !companyName) {
      return NextResponse.json(
        { error: "resumeData, jobTitle, and companyName are required" },
        { status: 400 }
      );
    }

    const completion = await getOpenAI().chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an expert cover letter writer. Write a professional, personalized cover letter. The letter should be well-structured with an opening paragraph, 2-3 body paragraphs highlighting relevant experience, and a strong closing. Keep it concise and impactful. Return as JSON with field: coverLetter (string).",
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
