import { hasDecorativeGlyphs } from "@/lib/text-glyphs";

/**
 * Deterministic ATS analysis.
 *
 * The previous implementation asked gpt-4o-mini to "score this resume 0-100" at
 * temperature 0.3. That is not a score — it is a plausible-looking number that
 * changes between runs on identical input. A user who clicks twice and sees 74
 * then 81 correctly concludes the whole feature is decorative.
 *
 * This module computes the score from rules that can be stated out loud and
 * reproduced. Same resume in, same number out, every time. The LLM is still
 * used, but only for the thing it is actually good at: rewriting a specific
 * weak line into a stronger one. It never produces the score.
 *
 * Scoring is intentionally conservative and explainable. Every deduction
 * carries the exact field that caused it so the UI can deep-link to the fix.
 */

export interface AtsIssue {
  id: string;
  severity: "critical" | "warning" | "polish";
  /** Section type the fix lives in, for deep-linking the editor. */
  section: string;
  title: string;
  detail: string;
  /** Points already deducted for this issue. */
  cost: number;
}

export interface AtsReport {
  score: number;
  breakdown: {
    parseability: number;
    completeness: number;
    impact: number;
    keywords: number;
  };
  maxBreakdown: typeof MAX;
  issues: AtsIssue[];
  stats: {
    wordCount: number;
    bulletCount: number;
    quantifiedBullets: number;
    weakVerbBullets: number;
    avgBulletWords: number;
  };
  /** Present only when a job description was supplied. */
  keywordMatch: {
    matched: string[];
    missing: string[];
    coverage: number;
  } | null;
}

const MAX = {
  parseability: 30,
  completeness: 25,
  impact: 30,
  keywords: 15,
} as const;

/** Verbs that describe presence rather than contribution. */
const WEAK_VERBS = new Set([
  "responsible", "worked", "helped", "assisted", "participated", "involved",
  "handled", "dealt", "tasked", "duties", "supported", "contributed",
  "familiar", "exposure", "various", "several", "etc",
]);

const STRONG_VERB_HINT = [
  "Led", "Built", "Shipped", "Designed", "Reduced", "Increased", "Launched",
  "Migrated", "Automated", "Negotiated", "Recovered", "Consolidated",
];

/** Characters that reliably break contact-field parsing in older ATS engines. */
// See lib/text-glyphs.ts for why this isn't a /u-flagged \u{...} pattern.
const PARSE_HOSTILE = { test: hasDecorativeGlyphs };

const STOPWORDS = new Set([
  "the","and","for","with","you","your","our","are","this","that","will","have",
  "from","they","been","were","has","was","not","but","all","can","who","its",
  "their","them","about","into","over","than","then","when","what","which",
  "work","working","role","team","teams","years","year","experience","strong",
  "ability","including","other","across","using","use","used","well","new",
  "join","looking","seeking","candidate","candidates","required","preferred",
  "plus","must","should","would","also","help","make","need","within","while",
  "job","position","company","opportunity","responsibilities","qualifications",
]);

type Section = { type: string; content: any };

function bySection(sections: Section[], type: string) {
  return sections.find((s) => s.type === type);
}

function collectBullets(sections: Section[]): string[] {
  const out: string[] = [];
  for (const type of ["experience", "projects"]) {
    const section = bySection(sections, type);
    const items: any[] = section?.content?.items ?? [];
    for (const item of items) {
      if (Array.isArray(item?.bullets)) {
        out.push(...item.bullets.filter((b: unknown) => typeof b === "string" && b.trim()));
      }
    }
  }
  return out;
}

function fullText(sections: Section[]): string {
  const parts: string[] = [];
  for (const s of sections) {
    const c = s.content;
    if (!c) continue;
    if (typeof c.text === "string") parts.push(c.text);
    if (Array.isArray(c.items)) {
      for (const item of c.items) {
        if (typeof item === "string") {
          parts.push(item);
          continue;
        }
        for (const key of ["title", "company", "degree", "field", "school", "name", "issuer", "description", "technologies", "language"]) {
          if (typeof item?.[key] === "string") parts.push(item[key]);
        }
        if (Array.isArray(item?.bullets)) parts.push(...item.bullets);
      }
    }
  }
  return parts.join(" ");
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s-]/g, " ")
    .split(/\s+/)
    .map((w) => w.replace(/^[-.]+|[-.]+$/g, ""))
    .filter((w) => w.length > 2 && !STOPWORDS.has(w));
}

const QUANTIFIER = /(\d+(\.\d+)?\s?(%|percent|x\b)|\$\s?\d|\b\d{2,}\b|\b\d+\s?(k|m|bn|million|billion|users|customers|clients|hours|days|weeks|months|engineers|people|teams|accounts|tickets|requests|queries)\b)/i;

export function analyzeResume(sections: Section[], jobDescription?: string | null): AtsReport {
  const issues: AtsIssue[] = [];
  const personal = bySection(sections, "personal")?.content ?? {};
  const bullets = collectBullets(sections);
  const text = fullText(sections);
  const words = text.split(/\s+/).filter(Boolean);

  // ── Parseability (30) ──────────────────────────────────────────────────────
  let parseability: number = MAX.parseability;

  const contactFields: Array<[string, string]> = [
    ["email", personal.email],
    ["phone", personal.phone],
    ["location", personal.location],
  ];
  for (const [label, value] of contactFields) {
    if (!value || !String(value).trim()) {
      const cost = label === "email" ? 8 : 4;
      parseability -= cost;
      issues.push({
        id: `missing-${label}`,
        severity: label === "email" ? "critical" : "warning",
        section: "personal",
        title: `No ${label} on the resume`,
        detail:
          label === "email"
            ? "Most tracking systems key a candidate record on the email address. Without one the application can be dropped before a human sees it."
            : `Recruiters filter on ${label}. Leaving it blank removes you from those searches.`,
        cost,
      });
    }
  }

  if (personal.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(personal.email).trim())) {
    parseability -= 6;
    issues.push({
      id: "malformed-email",
      severity: "critical",
      section: "personal",
      title: "Email address doesn't look valid",
      detail: "Parsers reject addresses that fail a basic format check, and a typo here means the employer cannot reply.",
      cost: 6,
    });
  }

  const hostile = Object.entries(personal)
    .filter(([, v]) => typeof v === "string" && PARSE_HOSTILE.test(v))
    .map(([k]) => k);
  if (hostile.length) {
    parseability -= 5;
    issues.push({
      id: "hostile-glyphs",
      severity: "warning",
      section: "personal",
      title: "Symbols in your contact details",
      detail: `Emoji and icon characters in ${hostile.join(", ")} are frequently stripped or mangled during parsing, which can take the surrounding text with them.`,
      cost: 5,
    });
  }

  if (words.length > 900) {
    parseability -= 4;
    issues.push({
      id: "too-long",
      severity: "warning",
      section: "experience",
      title: `${words.length} words is long for a resume`,
      detail: "Two pages is the practical ceiling for most roles. Cut the oldest or least relevant bullets first.",
      cost: 4,
    });
  } else if (words.length > 0 && words.length < 180) {
    parseability -= 6;
    issues.push({
      id: "too-short",
      severity: "warning",
      section: "experience",
      title: `Only ${words.length} words of content`,
      detail: "There isn't enough here for a keyword match to find anything. Aim for at least 250 words across your experience.",
      cost: 6,
    });
  }

  // ── Completeness (25) ──────────────────────────────────────────────────────
  let completeness: number = MAX.completeness;

  const required: Array<[string, string, number]> = [
    ["experience", "Work experience", 10],
    ["education", "Education", 5],
    ["skills", "Skills", 6],
    ["summary", "Professional summary", 4],
  ];
  for (const [type, label, cost] of required) {
    const section = bySection(sections, type);
    const empty =
      !section ||
      (Array.isArray(section.content?.items) && section.content.items.length === 0) ||
      (typeof section.content?.text === "string" && !section.content.text.trim());
    if (empty) {
      completeness -= cost;
      issues.push({
        id: `empty-${type}`,
        severity: cost >= 8 ? "critical" : "warning",
        section: type,
        title: `${label} section is empty`,
        detail: `Screeners look for a labelled ${label.toLowerCase()} block. An empty one reads as a gap.`,
        cost,
      });
    }
  }

  const expItems: any[] = bySection(sections, "experience")?.content?.items ?? [];
  const undated = expItems.filter((i) => !i?.startDate).length;
  if (undated > 0) {
    const cost = Math.min(6, undated * 3);
    completeness -= cost;
    issues.push({
      id: "missing-dates",
      severity: "warning",
      section: "experience",
      title: `${undated} role${undated > 1 ? "s" : ""} without a start date`,
      detail: "Tenure is computed from these dates. Roles without them are often skipped when ranking candidates by years of experience.",
      cost,
    });
  }

  // ── Impact (30) ────────────────────────────────────────────────────────────
  let impact: number = MAX.impact;

  const quantified = bullets.filter((b) => QUANTIFIER.test(b));
  const weak = bullets.filter((b) => {
    const first = b.trim().split(/\s+/)[0]?.toLowerCase().replace(/[^a-z]/g, "") ?? "";
    return WEAK_VERBS.has(first) || /^(responsible for|worked on|helped with)/i.test(b.trim());
  });
  const avgBulletWords = bullets.length
    ? Math.round(bullets.reduce((a, b) => a + b.split(/\s+/).length, 0) / bullets.length)
    : 0;

  if (bullets.length === 0) {
    impact -= 20;
    issues.push({
      id: "no-bullets",
      severity: "critical",
      section: "experience",
      title: "No bullet points under any role",
      detail: "A job title alone says nothing about what you did. Add two to four bullets per role describing outcomes.",
      cost: 20,
    });
  } else {
    const quantRatio = quantified.length / bullets.length;
    if (quantRatio < 0.5) {
      const cost = Math.round((0.5 - quantRatio) * 28);
      impact -= cost;
      issues.push({
        id: "unquantified",
        severity: quantRatio < 0.2 ? "critical" : "warning",
        section: "experience",
        title: `${bullets.length - quantified.length} of ${bullets.length} bullets have no number in them`,
        detail: "A number is what separates a claim from an anecdote. Team size, percentage change, dollar value, volume, or time saved all work.",
        cost,
      });
    }

    if (weak.length) {
      const cost = Math.min(8, weak.length * 2);
      impact -= cost;
      issues.push({
        id: "weak-verbs",
        severity: "warning",
        section: "experience",
        title: `${weak.length} bullet${weak.length > 1 ? "s" : ""} open with a passive phrase`,
        detail: `Openers like "Responsible for" and "Worked on" describe a job description, not your contribution. Try ${STRONG_VERB_HINT.slice(0, 4).join(", ")}.`,
        cost,
      });
    }

    if (avgBulletWords > 32) {
      impact -= 4;
      issues.push({
        id: "long-bullets",
        severity: "polish",
        section: "experience",
        title: `Bullets average ${avgBulletWords} words`,
        detail: "Anything past about 30 words stops being skimmable. Split the thought or cut the setup.",
        cost: 4,
      });
    }

    const seen = new Set<string>();
    const dupes = bullets.filter((b) => {
      const key = b.trim().toLowerCase().slice(0, 60);
      if (seen.has(key)) return true;
      seen.add(key);
      return false;
    });
    if (dupes.length) {
      impact -= 3;
      issues.push({
        id: "duplicate-bullets",
        severity: "polish",
        section: "experience",
        title: `${dupes.length} near-duplicate bullet${dupes.length > 1 ? "s" : ""}`,
        detail: "Repeated lines waste the limited space a screener actually reads.",
        cost: 3,
      });
    }
  }

  // ── Keywords (15) ──────────────────────────────────────────────────────────
  let keywords: number = MAX.keywords;
  let keywordMatch: AtsReport["keywordMatch"] = null;

  if (jobDescription && jobDescription.trim().length > 60) {
    const jdCounts = new Map<string, number>();
    for (const token of tokenize(jobDescription)) {
      jdCounts.set(token, (jdCounts.get(token) ?? 0) + 1);
    }
    // Array.from, not [...jdCounts.entries()] — spreading a Map iterator hits
    // the same --downlevelIteration restriction as for...of over a Map.
    const targets = Array.from(jdCounts.entries())
      .filter(([, count]) => count >= 2)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 25)
      .map(([term]) => term);

    const resumeTokens = new Set(tokenize(text));
    const matched = targets.filter((t) => resumeTokens.has(t));
    const missing = targets.filter((t) => !resumeTokens.has(t));
    const coverage = targets.length ? matched.length / targets.length : 1;

    keywords = Math.round(MAX.keywords * coverage);
    keywordMatch = { matched, missing, coverage: Math.round(coverage * 100) };

    if (missing.length) {
      issues.push({
        id: "missing-keywords",
        severity: coverage < 0.4 ? "critical" : "warning",
        section: "skills",
        title: `Missing ${missing.length} recurring terms from the job posting`,
        detail: `The posting repeats these and your resume doesn't use them: ${missing.slice(0, 8).join(", ")}. Only add the ones that are honestly true of you.`,
        cost: MAX.keywords - keywords,
      });
    }
  } else {
    // No JD supplied: award the category on skill-section substance instead of
    // penalising the user for not pasting a posting.
    const skills: string[] = bySection(sections, "skills")?.content?.items ?? [];
    const usable = skills.filter((s) => typeof s === "string" && s.trim().length > 1);
    keywords = usable.length >= 8 ? MAX.keywords : Math.round((usable.length / 8) * MAX.keywords);
    if (usable.length < 8) {
      issues.push({
        id: "thin-skills",
        severity: "warning",
        section: "skills",
        title: `Only ${usable.length} skill${usable.length === 1 ? "" : "s"} listed`,
        detail: "The skills block is where most keyword matching happens. Eight to fifteen concrete tools or methods is the useful range.",
        cost: MAX.keywords - keywords,
      });
    }
  }

  const clamp = (n: number, max: number) => Math.max(0, Math.min(max, Math.round(n)));
  const breakdown = {
    parseability: clamp(parseability, MAX.parseability),
    completeness: clamp(completeness, MAX.completeness),
    impact: clamp(impact, MAX.impact),
    keywords: clamp(keywords, MAX.keywords),
  };

  const severityRank = { critical: 0, warning: 1, polish: 2 } as const;
  issues.sort((a, b) => severityRank[a.severity] - severityRank[b.severity] || b.cost - a.cost);

  return {
    score:
      breakdown.parseability + breakdown.completeness + breakdown.impact + breakdown.keywords,
    breakdown,
    maxBreakdown: MAX,
    issues,
    stats: {
      wordCount: words.length,
      bulletCount: bullets.length,
      quantifiedBullets: quantified.length,
      weakVerbBullets: weak.length,
      avgBulletWords,
    },
    keywordMatch,
  };
}
