/**
 * Typed shapes for resume section JSON (`ResumeSection.content`).
 * All fields remain optional at the item level so partial drafts and legacy data load safely.
 */

import type { ResumeData, ResumeSection } from "@/hooks/use-resume-store";

export type { ResumeData, ResumeSection };

/** ─── Projects ─────────────────────────────────────────────── */

export interface ProjectItem {
  id: string;
  name?: string;
  description?: string;
  technologies?: string;
  link?: string;
}

export interface ProjectsSectionContent {
  items: ProjectItem[];
}

/** ─── Certifications & Awards (same shape) ─────────────────── */

export interface CertificationItem {
  id: string;
  name?: string;
  issuer?: string;
  date?: string;
}

export interface CertificationsSectionContent {
  items: CertificationItem[];
}

/** ─── Languages ────────────────────────────────────────────── */

export type LanguageProficiency =
  | "Native"
  | "Fluent"
  | "Advanced"
  | "Intermediate"
  | "Basic";

export interface LanguageItem {
  id: string;
  language?: string;
  proficiency?: LanguageProficiency | string;
}

export interface LanguagesSectionContent {
  items: LanguageItem[];
}

/** Optional maps for type-narrowing by `section.type` */
export type OptionalResumeSections = {
  projects?: ProjectsSectionContent;
  certifications?: CertificationsSectionContent;
  languages?: LanguagesSectionContent;
};
