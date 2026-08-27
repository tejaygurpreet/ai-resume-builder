/**
 * ATS output contract.
 *
 * Run with:  npx tsx tests/ats-contract.test.ts
 *
 * These assertions encode the promises the marketing site makes. Each one maps
 * to a bug that shipped to production, so they exist to stop the same class of
 * regression rather than to chase coverage:
 *
 *   - Contact fields separated only by CSS `gap`, producing
 *     "alexandra.chen@email.com(415) 555-0123" in every text extraction.
 *   - `portfolio` and `website` both rendered even when identical, printing the
 *     same URL twice on every template preview.
 *   - Decorative glyphs prepended as text nodes, yielding "–Led" and "◆Led".
 *   - An LLM asked to invent an ATS score at temperature 0.3, so the same
 *     resume scored differently on consecutive clicks.
 */

import { buildAtsTextLayer, textLayerToString } from "../lib/pdf-text-layer";
import { analyzeResume } from "../lib/ats-engine";
import { getContactValues } from "../components/resume/ContactLine";
import { sanitizeGeneratedText, sanitizeGeneratedList, NO_FABRICATION_RULE } from "../lib/ai-prompts";
import { hasDecorativeGlyphs } from "../lib/text-glyphs";

let passed = 0;
let failed = 0;

function check(name: string, condition: boolean, detail = "") {
  if (condition) {
    passed++;
    console.log(`  PASS  ${name}`);
  } else {
    failed++;
    console.log(`  FAIL  ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

function group(name: string) {
  console.log(`\n${name}`);
}

// ── Fixtures ─────────────────────────────────────────────────────────────────

const complete: any[] = [
  {
    id: "p", order: 0, type: "personal",
    content: {
      firstName: "Alexandra", lastName: "Chen",
      email: "alexandra.chen@email.com",
      phone: "(415) 555-0123",
      location: "San Francisco, CA",
      linkedin: "linkedin.com/in/alexandra-chen",
      github: "github.com/alexchen",
      portfolio: "alexchen.dev",
      website: "https://alexchen.dev",
    },
  },
  { id: "s", order: 1, type: "summary", content: { text: "Senior Software Engineer with six years building payment infrastructure at high growth companies, focused on reliability and developer experience across distributed systems." } },
  {
    id: "e", order: 2, type: "experience",
    content: {
      items: [{
        id: "1", title: "Senior Software Engineer", company: "Stripe",
        location: "San Francisco, CA", startDate: "Jan 2022", current: true,
        bullets: [
          "Led migration of the payment pipeline to an event driven architecture, cutting p99 latency 40%",
          "Mentored 6 engineers and established review standards adopted by 3 teams",
          "Designed a fraud dashboard processing 2.5M events per day for the risk organisation",
        ],
      }],
    },
  },
  { id: "ed", order: 3, type: "education", content: { items: [{ id: "e1", degree: "B.S. Computer Science", school: "Stanford University", startDate: "2015", endDate: "2019", gpa: "3.9" }] } },
  { id: "sk", order: 4, type: "skills", content: { items: ["TypeScript", "React", "Node.js", "Python", "PostgreSQL", "AWS", "Docker", "Kubernetes"] } },
  { id: "c", order: 5, type: "certifications", content: { items: [{ id: "c1", name: "AWS Solutions Architect", issuer: "Amazon Web Services", date: "2023" }] } },
];

const weak: any[] = [
  { id: "p", order: 0, type: "personal", content: { firstName: "Sam", email: "📧 sam@broken", location: "" } },
  { id: "e", order: 1, type: "experience", content: { items: [{ id: "1", title: "Developer", company: "Acme", bullets: ["Responsible for the website", "Worked on various tasks"] }] } },
  { id: "sk", order: 2, type: "skills", content: { items: ["Excel"] } },
];

// ── Text layer ───────────────────────────────────────────────────────────────

group("PDF text layer");
const text = textLayerToString(buildAtsTextLayer(complete, "Alexandra Chen"));

check("job title is not glued to its date", !/Engineer(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/.test(text));
check("employer is not glued to a year", !/Services\d{4}/.test(text));
check("school is not glued to GPA", !/CAGPA/.test(text));
check("email is present and labelled", text.includes("Email: alexandra.chen@email.com"));
check("phone is on its own labelled line", /^Phone: \(415\) 555-0123$/m.test(text));
check(
  "duplicate portfolio/website collapsed to one",
  (text.match(/alexchen\.dev/g) || []).length === 1,
  `found ${(text.match(/alexchen\.dev/g) || []).length}`
);
check("uses a standard experience heading", text.includes("PROFESSIONAL EXPERIENCE"));
check("uses a standard education heading", text.includes("EDUCATION"));
check("bullets survive extraction", text.includes("- Led migration of the payment pipeline"));
check("no emoji anywhere in the text layer", !hasDecorativeGlyphs(text));
check("no decorative marker glued to bullet text", !/[–—◆▶]\w/.test(text));
check("no literal markdown emphasis leaked", !text.includes("**"));

// ── Contact de-duplication ───────────────────────────────────────────────────

group("Contact line");
const values = getContactValues(complete[0].content);
check("returns one entry per distinct field", values.length === 7 - 1, `got ${values.length}`);
check("http/www variants treated as duplicates", values.filter((v) => v.includes("alexchen.dev")).length === 1);
check(
  "empty fields are dropped",
  getContactValues({ email: "a@b.com", phone: "  ", location: "" }).length === 1
);

// ── Scoring engine ───────────────────────────────────────────────────────────

group("ATS scoring");
const strong = analyzeResume(complete);
const poor = analyzeResume(weak);

check("scores stay inside 0-100", strong.score >= 0 && strong.score <= 100 && poor.score >= 0 && poor.score <= 100);
check("a complete resume outscores a weak one", strong.score > poor.score, `${strong.score} vs ${poor.score}`);
check("complete resume scores well", strong.score >= 85, `got ${strong.score}`);
check("weak resume scores poorly", poor.score <= 55, `got ${poor.score}`);

const runs = new Set([1, 2, 3, 4, 5].map(() => analyzeResume(complete).score));
check("identical input yields an identical score", runs.size === 1, `saw ${Array.from(runs).join(", ")}`);

check("unquantified bullets are flagged", poor.issues.some((i) => i.id === "unquantified"));
check("passive openers are flagged", poor.issues.some((i) => i.id === "weak-verbs"));
check("malformed email is flagged", poor.issues.some((i) => i.id === "malformed-email"));
check("emoji in contact details is flagged", poor.issues.some((i) => i.id === "hostile-glyphs"));
check("missing education is flagged", poor.issues.some((i) => i.id === "empty-education"));
check("critical issues are ordered first", poor.issues[0]?.severity === "critical");
check("every issue carries a point cost", poor.issues.every((i) => i.cost > 0));
check("every issue names a section to fix", poor.issues.every((i) => typeof i.section === "string" && i.section.length > 0));

const withJd = analyzeResume(complete, "We need a senior TypeScript engineer. TypeScript and React required. Kubernetes experience. React and Kubernetes and TypeScript daily. PostgreSQL tuning, PostgreSQL scaling.");
check("job description produces a keyword report", withJd.keywordMatch !== null);
check("matched keywords are detected", (withJd.keywordMatch?.matched.length ?? 0) > 0);
check("coverage is a percentage", (withJd.keywordMatch?.coverage ?? -1) >= 0 && (withJd.keywordMatch?.coverage ?? 101) <= 100);

const missingKw = analyzeResume(
  [complete[0], complete[2]],
  "Rust systems engineer. Rust, Rust, embedded embedded firmware firmware."
);
check("absent keywords are reported as missing", (missingKw.keywordMatch?.missing.length ?? 0) > 0);

check("breakdown sums to the reported score",
  strong.breakdown.parseability + strong.breakdown.completeness + strong.breakdown.impact + strong.breakdown.keywords === strong.score);
check("no category exceeds its maximum",
  strong.breakdown.parseability <= strong.maxBreakdown.parseability &&
  strong.breakdown.completeness <= strong.maxBreakdown.completeness &&
  strong.breakdown.impact <= strong.maxBreakdown.impact &&
  strong.breakdown.keywords <= strong.maxBreakdown.keywords);

// ── Edge cases ───────────────────────────────────────────────────────────────

group("Edge cases");
check("empty resume does not throw", (() => { try { analyzeResume([]); return true; } catch { return false; } })());
check("empty resume scores low", analyzeResume([]).score < 40);
check("empty text layer does not throw", (() => { try { buildAtsTextLayer([], "x"); return true; } catch { return false; } })());
check("missing content objects are tolerated",
  (() => { try { analyzeResume([{ type: "experience", order: 0, content: null } as any]); return true; } catch { return false; } })());

// ── AI output sanitisation ───────────────────────────────────────────────────

group("AI output sanitisation");
check("markdown bold is stripped", sanitizeGeneratedText("**Led** migration") === "Led migration");
check("markdown underscore emphasis is stripped", sanitizeGeneratedText("__Designed__ it") === "Designed it");
check("leading hyphen marker is stripped", sanitizeGeneratedText("- Built the thing") === "Built the thing");
check("leading bullet glyph is stripped", sanitizeGeneratedText("\u2022 Shipped it") === "Shipped it");
check("leading en dash is stripped", sanitizeGeneratedText("\u2013 Reduced latency") === "Reduced latency");
check("emoji are stripped", sanitizeGeneratedText("\uD83D\uDCE7 Managed comms") === "Managed comms");
check("whitespace is collapsed", sanitizeGeneratedText("a    b   c") === "a b c");
check("non-strings become empty", sanitizeGeneratedText(null) === "");
check("empty entries are dropped from lists", sanitizeGeneratedList(["ok", "", "  "]).length === 1);
check("non-array input yields empty list", sanitizeGeneratedList("nope").length === 0);
check("fabrication rule forbids inventing figures", /never introduce/i.test(NO_FABRICATION_RULE));
check("fabrication rule mandates placeholders", NO_FABRICATION_RULE.includes("[X%]"));

console.log(`\n${passed} passed, ${failed} failed\n`);
process.exit(failed === 0 ? 0 : 1);
