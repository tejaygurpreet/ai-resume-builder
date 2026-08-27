/**
 * Single source of truth for the model used across every /api/ai route.
 *
 * The marketing site advertised "AI POWERED BY GPT-4o" while all eleven routes
 * actually called gpt-4o-mini. Naming the model in one place makes that class of
 * mismatch visible, and lets the tier be swapped without editing eleven files.
 */
export const AI_MODEL = process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini";

/** Heavier reasoning tasks (tailoring, cover letters) may warrant the larger model. */
export const AI_MODEL_QUALITY = process.env.OPENAI_MODEL_QUALITY?.trim() || AI_MODEL;
