/**
 * Resume completion validation for export requirements
 */

import type { ResumeSection } from "@/hooks/use-resume-store";

export interface ValidationResult {
  isComplete: boolean;
  percentage: number;
  missingItems: string[];
  suggestions: string[];
}

function getFullName(c: any): string {
  if (c?.firstName && c?.lastName) return `${c.firstName} ${c.lastName}`.trim();
  return (c?.fullName ?? "").trim();
}

export function validateResumeCompletion(sections: ResumeSection[]): ValidationResult {
  const missing: string[] = [];
  const suggestions: string[] = [];

  const personal = sections.find((s) => s.type === "personal")?.content;
  const summary = sections.find((s) => s.type === "summary")?.content;
  const experience = sections.find((s) => s.type === "experience")?.content;
  const education = sections.find((s) => s.type === "education")?.content;
  const skills = sections.find((s) => s.type === "skills")?.content;

  // Personal: firstName+lastName (or fullName) and email required
  const firstName = (personal?.firstName ?? "").trim();
  const lastName = (personal?.lastName ?? "").trim();
  const fullName = (personal?.fullName ?? "").trim();
  const hasName =
    (firstName && lastName) ||
    (fullName.length >= 2 && fullName.split(/\s+/).filter(Boolean).length >= 2);
  const email = (personal?.email ?? "").trim();

  if (!hasName) missing.push("Add first name and last name");
  if (!email) missing.push("Email");

  // Summary: text required
  const summaryText = (summary?.text ?? "").trim();
  if (!summaryText || summaryText.length < 20) {
    missing.push("Professional summary (at least 20 characters)");
  }

  // Experience: at least 1 job with title, company, 1 bullet
  const expItems = experience?.items ?? [];
  const hasValidJob =
    expItems.length > 0 &&
    expItems.some(
      (item: any) =>
        (item.title ?? "").trim() &&
        (item.company ?? "").trim() &&
        (item.bullets ?? []).filter((b: string) => (b ?? "").trim()).length >= 1
    );
  if (!hasValidJob) {
    missing.push("At least one work experience with job title, company, and one bullet point");
  }

  // Education: at least 1 entry with school and degree
  const eduItems = education?.items ?? [];
  const hasValidEdu =
    eduItems.length > 0 &&
    eduItems.some(
      (item: any) => (item.school ?? "").trim() && ((item.degree ?? "").trim() || (item.program ?? "").trim())
    );
  if (!hasValidEdu) {
    missing.push("At least one education entry with school name and degree/program");
  }

  // Skills: at least 3
  const skillItems = (skills?.items ?? []).filter((s: string) => (s ?? "").trim());
  if (skillItems.length < 3) {
    missing.push(`At least 3 skills (you have ${skillItems.length})`);
  }

  // Suggestions (optional improvements)
  if (skillItems.length >= 3 && skillItems.length < 6) suggestions.push("Add 2–3 more skills for stronger impact");
  if (expItems.length > 0) {
    const bulletCount = expItems.reduce(
      (acc: number, item: any) => acc + (item.bullets ?? []).filter((b: string) => (b ?? "").trim()).length,
      0
    );
    if (bulletCount < 6) suggestions.push("Add measurable achievements to bullet points");
  }
  if (!personal?.phone?.trim()) suggestions.push("Add phone number for recruiter contact");
  if (!personal?.location?.trim()) suggestions.push("Add location for role matching");

  const passedChecks =
    (hasName ? 1 : 0) +
    (email ? 1 : 0) +
    (summaryText.length >= 20 ? 1 : 0) +
    (hasValidJob ? 1 : 0) +
    (hasValidEdu ? 1 : 0) +
    (skillItems.length >= 3 ? 1 : 0);
  const percentage = Math.round((passedChecks / 6) * 100);

  return {
    isComplete: missing.length === 0,
    percentage: Math.min(100, percentage),
    missingItems: missing,
    suggestions,
  };
}
