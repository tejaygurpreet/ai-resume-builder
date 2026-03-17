"use client";

/**
 * Centralized export hook — ALL export/download buttons MUST use this.
 * Flow: 1) Check completion (>70%), 2) Check membership, 3) Format selector, 4) Export.
 */

import { useCallback } from "react";
import { useResumeStore, type ResumeSection } from "./use-resume-store";
import { validateResumeCompletion } from "@/lib/resume-validation";
import {
  exportToPdf,
  exportToTxt,
  exportToJson,
  exportToDocx,
  exportToMarkdown,
  type ExportFormat,
} from "@/components/editor/pdf-export";

const COMPLETION_THRESHOLD = 70;

export interface UseResumeExportOptions {
  /** Resume sections (default: from store) */
  sections?: ResumeSection[];
  /** Resume title (default: from store) */
  title?: string;
  /** Resume template (default: from store) */
  template?: string;
  /** Resume color (default: from store) */
  color?: string;
}

export function useResumeExport(options: UseResumeExportOptions = {}) {
  const resume = useResumeStore((s) => s.resume);
  const sections = options.sections ?? resume.sections ?? [];
  const title = options.title ?? resume.title;
  const template = options.template ?? resume.template;
  const color = options.color ?? resume.color;

  const validation = validateResumeCompletion(sections);
  const canExport = validation.isComplete || validation.percentage >= COMPLETION_THRESHOLD;

  const handleExport = useCallback(
    async (format: ExportFormat, filename: string) => {
      const name = filename || title;
      switch (format) {
        case "pdf":
          await exportToPdf(sections, name, color);
          break;
        case "txt":
          exportToTxt(sections, name);
          break;
        case "json":
          exportToJson(sections, name, template, color);
          break;
        case "docx":
          await exportToDocx(sections, name);
          break;
        case "md":
          exportToMarkdown(sections, name);
          break;
      }
    },
    [sections, title, template, color]
  );

  return {
    canExport,
    validation,
    handleExport,
  };
}
