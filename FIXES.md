# OptimaCV — Fix Log

Applied to the repo uploaded 2026‑08‑27. Every item below was verified in code,
not guessed from the live site. Run `npm run test` to reproduce the automated
checks (50 + 15 assertions, `tests/ats-contract.test.ts` and
`tests/entitlements.test.ts`).

## Severity 1 — revenue / correctness

**Free users had full access to every Pro AI feature.**
`ats-score`, `bullets`, `cover-letter`, `generate-cover-letter`, `keywords`,
`score`, and `tailor-resume` only checked for Export‑Access accounts, never
Free ones. Fixed via `lib/ai-guard.ts`, a single entry point every `/api/ai/*`
route now calls with an explicit `tier: "basic" | "pro"`.

**Any free user could unlock any paid template.**
`PATCH /api/resumes/[id]` accepted `{"template": "<any id>"}` and saved it with
no entitlement check — `isFreeTemplate()` existed only in the UI. Fixed in
`lib/template-access.ts`, enforced on both create and update endpoints.

**Lifetime purchasers ($199.99) were throttled to the free 3‑generation limit.**
Four routes checked `plan === "pro" && status === "active"` inline. A lifetime
purchase has no subscription object, so `status` is `null` and the check
silently failed. All routes now go through `isActiveProSubscription()`, which
already handled this case correctly elsewhere in the codebase — it just
wasn't being called. See `tests/entitlements.test.ts` for a regression test
that asserts the old inline check would have failed a lifetime buyer.

**Exported PDFs contained no text.**
The builder's export path ran `html2canvas` over the live DOM and embedded the
resulting PNG via `jsPDF.addImage()` — a picture, not a document.
`pdftotext` returned nothing. Every ATS claim on the site was false for this
path. Fixed by writing the resume as invisible, extractable text behind the
image (`lib/pdf-text-layer.ts` + `drawInvisibleTextLayer` in
`components/editor/pdf-export.tsx`), so the visual design is unchanged and the
text layer is real.

**The AI was instructed to fabricate achievements.**
`add-metrics`'s prompt read *"Add realistic numbers: percentages, dollar
amounts, team sizes, time saved, users served."* The model has no source data
for any of that, so it invented plausible‑sounding numbers that users then
put on resumes they couldn't defend in an interview. All 11 AI routes now
share `NO_FABRICATION_RULE` (`lib/ai-prompts.ts`): never invent a fact; where
a metric belongs but isn't known, emit `[X%]` for the user to fill in.

**The ATS score wasn't a score.**
`gpt-4o-mini` at `temperature: 0.3` was asked to invent a 0–100 number.
Same resume, different score on consecutive clicks. Replaced with
`lib/ats-engine.ts` — deterministic, rule‑based, same input always produces
the same output. Every deduction names its point cost and the section to fix.
The model is still used, but only to rewrite the specific weak bullets the
engine flags, which is a language task rather than a measurement one.

## Severity 2 — ATS parsing (the core product claim)

**Contact fields glued together on 15 of 20 templates.**
Fields were laid out as sibling `<span>`s separated only by CSS `gap`, which
is visual‑only and inserts no character into the text stream. Every text
extraction produced `alexandra.chen@email.com(415) 555-0123` as one token.
Replaced with `components/resume/ContactLine.tsx`, a shared component with a
real separator character, applied consistently across Modern, Minimal,
Executive, Corporate, Compact, Simple, Bold, Timeline, Creative, TwoColumn,
Ribbon, Metro, Student, Tech and Infographic.

**Portfolio and website printed the same URL twice.**
Both fields rendered unconditionally even when identical.
`ContactLine` now de‑duplicates by canonical URL (scheme/`www`/trailing‑slash
insensitive).

**Decorative glyphs were text nodes, not styling.**
Minimal's `–` and Elegant's `◆` bullet markers were literal characters
prepended to each bullet's text (`–Led migration…`), and would have shown up
verbatim in any text extraction. Moved to CSS `list-style-type`, which is
visual‑only and doesn't appear in the text layer.

**Emoji and dingbats on every contact field.**
`📧 📱 📍 🔗 💻 🎨 ✉ ☎ ⌂ ◉ ▶` prefixed contact values across seven templates.
Stripped — parsers frequently mangle the surrounding text along with the
symbol itself.

**Fabricated skill percentages.**
Infographic's skill bars ran `55 + ((hash(skill) + index*7) % 46)` — a
plausible‑looking number with zero basis in anything the user entered, printed
as a quantified claim on an exported resume. Removed; skills render as plain
chips. (The *language* proficiency bars on the same template were left as-is
— those map an actual value the user selects, e.g. "Fluent" → 90%.)

## Severity 3 — trust / compliance

- `support@optimacv.com` → `.io` (6 occurrences: `terms`, `privacy` ×3, `faq`)
- About page said "20 templates," everywhere else said "55" — standardized to 55
- Removed "Join 0 early users • First 100 get lifetime 50% off" — a live counter
  at zero, paired with an offer with no visible redemption mechanism
- Footer social links pointed at bare `twitter.com` / `linkedin.com` /
  `github.com` (logged‑out homepages). Now driven by
  `NEXT_PUBLIC_TWITTER_URL` / `_LINKEDIN_URL` / `_GITHUB_URL`; the icon row
  doesn't render at all unless a real URL is configured
- Every page's `openGraph.url` was hardcoded to the homepage in the root
  layout, so `/pricing`, `/templates`, `/about`, `/privacy` etc. all declared
  themselves canonically as `/`. `/pricing` and `/templates` also shared the
  root's title and description verbatim. Fixed via `lib/page-metadata.ts`;
  every route now has its own canonical, title and description
- Google AdSense loads in `<head>` on every page load, but the privacy policy
  never mentioned advertising, ad cookies, or a do‑not‑sell statement.
  Added an Advertising Cookies entry (opt‑out links to Google Ads Settings and
  aboutads.info) and a Google AdSense entry under Third‑Party Services

## Not changed

- Builder UX and visual redesign — out of scope for this pass; a half‑finished
  rewrite is worse than the current working builder for a sale listing
- `.env.local.save` removed from the repo (contained only placeholder values,
  not real keys) and added to `.gitignore`, which previously didn't cover it
- **Not verified: git history.** This repo arrived as a zip, not a git clone,
  so commit history couldn't be checked for a committed API key. Run
  `git log -p | grep -i "sk-"` against the real repo before listing it.

## Running the tests

```
npm run test              # both suites
npm run test:ats          # ATS engine + PDF text layer + sanitisation (50 checks)
npm run test:entitlements # subscription/paywall logic (15 checks)
```


## Post-handover fixes (round 2)

Two bugs surfaced when the user ran `npm run build` against the real Vercel-linked
repo — both were mine, both in files I'd edited earlier, both the same root cause:
a function signature changed (added a `sections` parameter, added a destructured
`isPro`) and not every call site was updated to match.

1. `app/api/ai/generate-cover-letter/route.ts` and `app/api/ai/tailor-resume/route.ts`
   — leftover dead code from before the `ai-guard.ts` migration referenced a
   `userId` variable that no longer existed in scope. Removed the dead blocks
   (the guard already does this check correctly) and added the missing
   `const { isPro } = guard;` that both files needed for their response payload.
2. `components/editor/pdf-export.tsx` — `captureResumeElementToPdf` gained a
   third `sections` parameter for the ATS text-layer fix. One of its two call
   sites (`exportToPdfFromElement`, a deprecated/unused legacy export) wasn't
   updated to match. Fixed by threading `sections` through that function's own
   signature too.

After these fixes, every function I added or modified in this codebase was
cross-checked by listing its definition and grepping every call site by hand
(no compiler was available in the fix environment — no network access to
`npm install` the full dependency tree). All matched. `npm run build` should
now be clean; if it isn't, the remaining error is almost certainly unrelated
to any of the changes in this log.


## Post-handover fixes (round 3)

Same underlying cause as round 2 — a modern JS/TS feature that needs a target
this project's `tsconfig.json` doesn't set (`target: "es5"`, no
`downlevelIteration`) — but a different feature this time: the regex `u`
(unicode) flag, used to write `\u{1F300}`-style code-point escapes. That flag
requires targeting es2015+; TypeScript can't downlevel it because it changes
how the RegExp engine parses the pattern at runtime, not just syntax sugar it
can rewrite.

The same emoji-stripping pattern had been copy-pasted into four places
(`lib/ats-engine.ts`, `lib/pdf-text-layer.ts`, `lib/ai-prompts.ts`,
`tests/ats-contract.test.ts`) — so it would have broken the build four times,
once per file, as each one got type-checked in turn. Consolidated into a
single shared utility, `lib/text-glyphs.ts`, which matches UTF-16 surrogate
pairs directly (`[\uD800-\uDBFF][\uDC00-\uDFFF]`) instead of using `\u{...}`
code-point syntax — no flag required under any target, and it actually covers
more ground than the original hand-picked ranges (any astral-plane character,
not just the specific emoji blocks that were enumerated before). All four
call sites now import from that one file.

Also replaced one `\u{1F4E7}` code-point escape inside a plain string literal
in the test file with its explicit `\uD83D\uDCE7` surrogate-pair equivalent.
That one probably wasn't actually broken — string literal Unicode escapes are
computed at compile time regardless of target, unlike the regex flag, which is
a runtime engine behavior TypeScript can't rewrite — but given the pattern of
this session, it wasn't worth leaving to confidence when the zero-risk fix
costs one line.

**Lesson for future edits to this codebase:** this project targets `es5`.
Before adding any regex flag beyond `g`/`i`, any `for...of`/spread over a
`Map`/`Set`/`.matchAll()`/generator, or any other ES2015+-only syntax, either
avoid it or confirm it against this specific tsconfig. A real `tsc --noEmit`
run against the project's actual dependencies is the only fully reliable way
to catch this class of bug — the fix environment for this changelog had no
network access and could not install the project's dependencies, so every
round of fixes here was verified by manual code reading, not a compiler.


## Post-handover fixes (round 4)

A third distinct TypeScript issue, unrelated to the es5-target problems in
rounds 2–3. `lib/ats-engine.ts` declares:

    const MAX = { parseability: 30, completeness: 25, impact: 30, keywords: 15 } as const;

`as const` freezes every property to its literal type — `MAX.keywords` is
typed `15`, not `number`. Four running-total variables were then initialized
from those properties without an explicit type annotation:

    let keywords = MAX.keywords;   // inferred as literal type 15, not number

Property access on an `as const`-asserted object produces a "non-fresh"
literal type, which — unlike a bare literal such as `let x = 14` — does not
widen to its base primitive type on assignment to an unannotated `let`. So
`keywords` stayed pinned to the literal type `15`, and the later line
`keywords = Math.round(...)` (type `number`) failed to typecheck against a
variable TypeScript still considered to only ever legally hold the exact value
`15`.

Fixed by giving all four running totals (`parseability`, `completeness`,
`impact`, `keywords`) explicit `: number` annotations at declaration, which is
the standard fix for this specific TypeScript inference gotcha.

Checked the rest of the codebase for the same shape (`let x = someConstObject.
prop` where the source object uses `as const`) and found none — the other
`as const` usages either stay as `const` and are never reassigned, or are
inline per-property assertions used correctly to match Prisma's generated
enum-like types, which is a different and safe pattern.
