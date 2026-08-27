/**
 * Shared prompt scaffolding for every AI route.
 *
 * The problem with the previous prompts: they told the model to "include
 * quantifiable metrics where possible" while supplying no source data for those
 * metrics. A language model asked for numbers it does not have will invent
 * plausible ones. That produced bullets like "increased conversion 35%" for a
 * user who never said anything of the kind.
 *
 * On a resume this is worse than unhelpful. The candidate cannot defend the
 * figure in an interview, and if they are hired on the strength of it, it is a
 * misrepresentation on a hiring document. A resume tool that quietly fabricates
 * achievements is a liability to the person using it.
 *
 * The rule below is prepended to every generation prompt: never invent a fact,
 * and where a metric belongs but is unknown, emit a visible placeholder the user
 * must fill in. A bracket the user has to resolve is honest. A fabricated number
 * is not.
 */

import { stripDecorativeGlyphs } from "@/lib/text-glyphs";

export const NO_FABRICATION_RULE = [
  "Absolute constraint — do not invent facts.",
  "Use only information the user supplied. Never introduce employers, job titles,",
  "dates, technologies, team sizes, revenue, percentages or any other figure that",
  "is not present in the input.",
  "When a metric would strengthen a line but the user has not supplied one, write a",
  "bracketed placeholder such as [X%], [$X], [N] or [team size] for them to fill in.",
  "Never guess a value to fill a placeholder.",
].join(" ");

export const RESUME_STYLE_RULES = [
  "Open each bullet with a concrete past-tense verb (Led, Built, Reduced, Migrated,",
  "Negotiated, Consolidated). Avoid Responsible for, Worked on, Helped with.",
  "Describe outcomes rather than duties.",
  "Keep each bullet under 30 words and on a single line.",
  "Use plain characters only: no emoji, no decorative symbols, no markdown emphasis.",
  "Write in the first person implied voice used on resumes, with no pronouns.",
].join(" ");

/** System message for any route that writes resume body content. */
export function resumeWriterSystemPrompt(extra?: string): string {
  return [
    "You are an experienced resume writer working with a real candidate's material.",
    NO_FABRICATION_RULE,
    RESUME_STYLE_RULES,
    extra ?? "",
  ]
    .filter(Boolean)
    .join("\n\n");
}

/** System message for cover letters, which are prose rather than bullets. */
export function coverLetterSystemPrompt(extra?: string): string {
  return [
    "You are an experienced cover letter writer working with a real candidate's material.",
    NO_FABRICATION_RULE,
    "Write three to four short paragraphs in a professional, direct register.",
    "Draw every claim from the candidate's supplied resume content.",
    "Do not open with 'I am writing to apply for'. Do not use filler enthusiasm.",
    "Use plain characters only: no emoji, no markdown emphasis.",
    extra ?? "",
  ]
    .filter(Boolean)
    .join("\n\n");
}

/**
 * Strip artefacts that break resume rendering and ATS parsing.
 * Applied to every string the model returns before it reaches the document.
 */
export function sanitizeGeneratedText(value: unknown): string {
  if (typeof value !== "string") return "";
  const withoutMarkdown = value
    // markdown emphasis leaks straight into the PDF as literal asterisks
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/__(.+?)__/g, "$1")
    // leading list markers the templates add themselves
    .replace(/^\s*[-•*–—◆▪]\s+/, "");
  // emoji and dingbats break contact-field and heading parsing — stripped via
  // the shared, ES5-safe matcher (see lib/text-glyphs.ts for why this isn't a
  // /u-flagged \u{...} pattern, which is what broke this build originally).
  return stripDecorativeGlyphs(withoutMarkdown).replace(/\s+/g, " ").trim();
}

export function sanitizeGeneratedList(values: unknown): string[] {
  if (!Array.isArray(values)) return [];
  return values.map(sanitizeGeneratedText).filter(Boolean);
}
