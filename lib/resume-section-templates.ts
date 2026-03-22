/**
 * Default JSON for each resume section type + factory for the builder "Add section" UI.
 */
import type { ResumeSection } from "@/hooks/use-resume-store";
import { v4 as uuidv4 } from "uuid";

export type BuilderSectionType =
  | "personal"
  | "summary"
  | "experience"
  | "education"
  | "skills"
  | "projects"
  | "certifications"
  | "languages"
  | "awards"
  | "volunteer"
  | "interests";

export const BUILDER_SECTION_OPTIONS: {
  type: BuilderSectionType;
  label: string;
  description: string;
}[] = [
  { type: "personal", label: "Personal Info", description: "Name, contact, links" },
  { type: "summary", label: "Professional Summary", description: "Overview statement" },
  { type: "experience", label: "Work Experience", description: "Jobs & achievements" },
  { type: "education", label: "Education", description: "Degrees & schools" },
  { type: "skills", label: "Skills", description: "Technical & soft skills" },
  { type: "projects", label: "Projects", description: "Portfolio & side work" },
  { type: "certifications", label: "Certifications", description: "Credentials & licenses" },
  { type: "languages", label: "Languages", description: "Speaking proficiency" },
  { type: "awards", label: "Awards", description: "Honors & recognition" },
  { type: "volunteer", label: "Volunteer Experience", description: "Community work" },
  { type: "interests", label: "Interests", description: "Optional hobbies" },
];

export function getDefaultContentForSectionType(type: string): Record<string, unknown> {
  switch (type) {
    case "personal":
      return {
        firstName: "",
        lastName: "",
        fullName: "",
        email: "",
        phone: "",
        location: "",
        linkedin: "",
        github: "",
        portfolio: "",
        website: "",
      };
    case "summary":
      return { text: "" };
    case "experience":
      return {
        items: [
          {
            id: `exp-${uuidv4().slice(0, 8)}`,
            title: "",
            company: "",
            location: "",
            startDate: "",
            endDate: "",
            current: false,
            bullets: [""],
          },
        ],
      };
    case "education":
      return {
        items: [
          {
            id: `edu-${uuidv4().slice(0, 8)}`,
            degree: "",
            school: "",
            location: "",
            startDate: "",
            endDate: "",
            gpa: "",
          },
        ],
      };
    case "skills":
      return { items: [""] };
    case "projects":
      return { items: [] };
    case "certifications":
    case "awards":
      return { items: [] };
    case "languages":
      return { items: [] };
    case "volunteer":
      return { items: [] };
    case "interests":
      return { items: [] };
    default:
      return {};
  }
}

/** New section for the store (unique id, next order set by caller). */
export function createResumeSection(type: string, order: number): ResumeSection {
  return {
    id: `${type}-${uuidv4().slice(0, 8)}`,
    type,
    order,
    content: getDefaultContentForSectionType(type),
  };
}

/* === EDITOR FIXED: CLEAN EMPTY PREVIEW + SUMMARY MOVED BELOW EXPERIENCE/EDUCATION IN SIDEBAR === */
