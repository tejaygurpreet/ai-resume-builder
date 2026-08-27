/**
 * Shared "strip emoji and decorative symbols" pattern.
 *
 * This existed as four separate copies (lib/ats-engine.ts, lib/pdf-text-layer.ts,
 * lib/ai-prompts.ts, tests/ats-contract.test.ts), each written with the `u`
 * (unicode) regex flag so `\u{1F300}` code-point escapes would work. The `u`
 * flag requires targeting es2015+, and this project's tsconfig targets es5 with
 * no downlevelIteration/target override — so every copy broke the build the
 * same way, one at a time, as each file was type-checked.
 *
 * Fixed by matching UTF-16 surrogate pairs directly instead of using `\u{...}`
 * code-point syntax. Every character outside the Basic Multilingual Plane —
 * which is effectively all emoji — is encoded in JS strings as a high surrogate
 * (\uD800–\uDBFF) followed by a low surrogate (\uDC00–\uDFFF). Matching that
 * pair needs no special flag under any target, and it's actually broader
 * coverage than the original range-limited pattern: it catches any astral-plane
 * character, not just the specific emoji blocks that were hand-picked before.
 *
 * One file, one definition — the next place emoji need stripping imports this
 * instead of writing a fifth copy.
 */

/** Matches any astral-plane character (covers essentially all emoji). No flags required. */
export const ASTRAL_GLYPH = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;

/** Matches BMP-range decorative symbols: dingbats, arrows, geometric shapes, misc symbols. */
export const BMP_SYMBOL_GLYPH = /[\u2600-\u27BF\u2190-\u21FF\u25A0-\u25FF]/g;

/** Strips both classes of glyph from a string in one pass. */
export function stripDecorativeGlyphs(value: string): string {
  return value.replace(ASTRAL_GLYPH, "").replace(BMP_SYMBOL_GLYPH, "");
}

/** True if the string contains any emoji or decorative symbol covered above. */
export function hasDecorativeGlyphs(value: string): boolean {
  // Reset lastIndex since these are shared `g`-flagged regex objects.
  ASTRAL_GLYPH.lastIndex = 0;
  BMP_SYMBOL_GLYPH.lastIndex = 0;
  return ASTRAL_GLYPH.test(value) || BMP_SYMBOL_GLYPH.test(value);
}
