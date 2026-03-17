/**
 * Guided builder step configuration — 6 core steps
 */

export const BUILDER_STEPS = [
  { id: "personal", label: "Personal Info", icon: "user" },
  { id: "summary", label: "Summary", icon: "file-text" },
  { id: "experience", label: "Experience", icon: "briefcase" },
  { id: "education", label: "Education", icon: "graduation-cap" },
  { id: "skills", label: "Skills", icon: "sparkles" },
  { id: "review", label: "Review", icon: "check-circle" },
] as const;

export type BuilderStepId = (typeof BUILDER_STEPS)[number]["id"];

export function getStepIndex(stepId: BuilderStepId): number {
  return BUILDER_STEPS.findIndex((s) => s.id === stepId);
}

export function getStepForSectionType(sectionType: string): BuilderStepId | null {
  const step = BUILDER_STEPS.find((s) => s.id === sectionType);
  return step?.id ?? null;
}
