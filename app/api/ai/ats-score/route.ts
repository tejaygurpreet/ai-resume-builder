import { NextResponse } from "next/server";
import { getOpenAI } from "@/lib/openai";
import { guardAiRequest } from "@/lib/ai-guard";
import { analyzeResume } from "@/lib/ats-engine";
import { AI_MODEL } from "@/lib/ai-model";

export const runtime = "nodejs";

/**
 * ATS analysis.
 *
 * The score is computed by lib/ats-engine.ts — deterministic, reproducible and
 * explainable line by line. The model is called only to rewrite the specific
 * bullets the engine flagged, which is a language task rather than a measurement
 * task. If the model call fails the report is still returned; the score never
 * depends on it.
 */

const REWRITE_LIMIT = 3;

export async function POST(request: Request) {
  const guard = await guardAiRequest({ tier: "pro" });
  if (!guard.ok) return guard.response;

  let body: { sections?: unknown; jobDescription?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const sections = Array.isArray(body.sections) ? (body.sections as any[]) : null;
  if (!sections || sections.length === 0) {
    return NextResponse.json(
      { error: "Add some resume content before running an analysis." },
      { status: 400 }
    );
  }

  const report = analyzeResume(sections, body.jobDescription ?? null);

  // Pull the actual weak lines so the model rewrites real text, not a summary.
  const weakBullets: string[] = [];
  for (const type of ["experience", "projects"]) {
    const items: any[] = sections.find((s) => s?.type === type)?.content?.items ?? [];
    for (const item of items) {
      for (const bullet of item?.bullets ?? []) {
        if (typeof bullet !== "string" || !bullet.trim()) continue;
        const hasNumber = /\d/.test(bullet);
        const weakOpener =
          /^(responsible for|worked on|helped|assisted|participated|involved in|tasked with)/i.test(
            bullet.trim()
          );
        if (!hasNumber || weakOpener) weakBullets.push(bullet.trim());
      }
    }
  }

  let rewrites: Array<{ before: string; after: string }> = [];

  if (weakBullets.length > 0) {
    try {
      const targets = weakBullets.slice(0, REWRITE_LIMIT);
      const completion = await getOpenAI().chat.completions.create({
        model: AI_MODEL,
        temperature: 0.4,
        max_tokens: 400,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "You rewrite resume bullet points. Keep every factual claim from the original. " +
              "Never invent numbers, employers, technologies or outcomes that are not already implied. " +
              "Where a metric clearly belongs but is absent, leave a bracketed placeholder like [X%] for " +
              "the candidate to fill in rather than guessing a value. Open with a concrete past-tense " +
              'verb. Stay under 30 words. Respond as JSON: {"rewrites":[{"before":"...","after":"..."}]}',
          },
          { role: "user", content: JSON.stringify({ bullets: targets }) },
        ],
      });

      const parsed = JSON.parse(completion.choices[0]?.message?.content ?? "{}");
      if (Array.isArray(parsed?.rewrites)) {
        rewrites = parsed.rewrites
          .filter(
            (r: any) =>
              r &&
              typeof r.before === "string" &&
              typeof r.after === "string" &&
              r.after.trim()
          )
          .slice(0, REWRITE_LIMIT);
      }
    } catch (err) {
      // Non-fatal: the report is the product, the rewrites are a bonus.
      console.error("ATS rewrite suggestion failed:", err);
    }
  }

  return NextResponse.json({
    result: {
      ...report,
      rewrites,
      // Kept so any existing UI reading `suggestions` keeps working.
      suggestions: report.issues.slice(0, 5).map((i) => i.title),
      method: "deterministic-v1",
    },
  });
}
