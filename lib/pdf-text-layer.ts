import type { ResumeSection } from "@/hooks/use-resume-store";
import { stripDecorativeGlyphs } from "@/lib/text-glyphs";

/**
 * Builds the machine-readable text layer embedded in exported PDFs.
 *
 * Why this exists: the PDF export ran html2canvas over the live preview and
 * dropped the resulting PNG into jsPDF via addImage(). That produces a picture
 * of a resume. `pdftotext` on it returns nothing at all — not badly-formatted
 * text, zero text. Every ATS claim on the marketing site was false for the
 * builder's main export path.
 *
 * Rather than throw away the 20 visual templates by switching to a single
 * generic react-pdf layout, the export now writes both: the rasterised design
 * for the human, and this text drawn in invisible render mode for the parser.
 * The same technique OCR tools use to make scans searchable.
 *
 * Ordering matters more than positioning here. Parsers read the text stream in
 * insertion order, so sections are emitted in the conventional resume order with
 * plain ASCII headings that ATS keyword maps recognise.
 */

export interface TextLayerLine {
  text: string;
  /** true for section headings, which get emitted on their own line. */
  heading?: boolean;
}

const SECTION_HEADINGS: Record<string, string> = {
  personal: "CONTACT",
  summary: "PROFESSIONAL SUMMARY",
  experience: "PROFESSIONAL EXPERIENCE",
  education: "EDUCATION",
  skills: "SKILLS",
  projects: "PROJECTS",
  certifications: "CERTIFICATIONS",
  languages: "LANGUAGES",
  awards: "AWARDS",
  volunteer: "VOLUNTEER EXPERIENCE",
  publications: "PUBLICATIONS",
  references: "REFERENCES",
};

/** Parsers key off standard headings; emit those regardless of template styling. */
function headingFor(type: string): string {
  return SECTION_HEADINGS[type] ?? type.replace(/[-_]/g, " ").toUpperCase();
}

function dateRange(item: any): string {
  const start = item?.startDate?.trim();
  const end = item?.current ? "Present" : item?.endDate?.trim();
  if (start && end) return `${start} - ${end}`;
  return start || end || "";
}

/** Strip characters that break naive parsers, keeping the semantic content. */
function clean(value: unknown): string {
  if (typeof value !== "string") return "";
  return stripDecorativeGlyphs(value).replace(/\s+/g, " ").trim();
}

export function buildAtsTextLayer(
  sections: ResumeSection[],
  title = "Resume"
): TextLayerLine[] {
  const lines: TextLayerLine[] = [];
  const push = (text: string, heading = false) => {
    const value = clean(text);
    if (value) lines.push({ text: value, heading });
  };

  const sorted = [...sections].sort((a, b) => a.order - b.order);
  const personal = sorted.find((s) => s.type === "personal")?.content as any;

  // Name first, unlabelled — this is how parsers expect to find it.
  if (personal) {
    const name =
      clean(personal.fullName) ||
      [clean(personal.firstName), clean(personal.lastName)].filter(Boolean).join(" ");
    if (name) push(name);

    // One field per line, each labelled. Labels raise extraction accuracy
    // considerably versus a single delimited run.
    const contact: Array<[string, unknown]> = [
      ["Email", personal.email],
      ["Phone", personal.phone],
      ["Location", personal.location],
      ["LinkedIn", personal.linkedin],
      ["GitHub", personal.github],
      ["Portfolio", personal.portfolio],
      ["Website", personal.website],
    ];
    const seen = new Set<string>();
    for (const [label, value] of contact) {
      const v = clean(value);
      if (!v) continue;
      const key = v.toLowerCase().replace(/^https?:\/\/(www\.)?/, "").replace(/\/+$/, "");
      if (seen.has(key)) continue; // portfolio and website are often identical
      seen.add(key);
      push(`${label}: ${v}`);
    }
  }

  for (const section of sorted) {
    if (section.type === "personal") continue;
    const c = section.content as any;
    if (!c) continue;

    switch (section.type) {
      case "summary": {
        if (!clean(c.text)) continue;
        push(headingFor(section.type), true);
        push(c.text);
        break;
      }

      case "experience": {
        const items: any[] = c.items ?? [];
        if (!items.length) continue;
        push(headingFor(section.type), true);
        for (const item of items) {
          const parts = [clean(item.title), clean(item.company)].filter(Boolean);
          const range = dateRange(item);
          // Explicit separators: this is exactly where the DOM version glued
          // "Senior EngineerJan 2022" into one token.
          push([parts.join(" | "), clean(item.location), range].filter(Boolean).join(" | "));
          for (const bullet of item.bullets ?? []) push(`- ${clean(bullet)}`);
        }
        break;
      }

      case "education": {
        const items: any[] = c.items ?? [];
        if (!items.length) continue;
        push(headingFor(section.type), true);
        for (const item of items) {
          const degree = [clean(item.degree), clean(item.field)].filter(Boolean).join(", ");
          push([degree, clean(item.school), clean(item.location), dateRange(item)]
            .filter(Boolean)
            .join(" | "));
          if (clean(item.gpa)) push(`GPA: ${clean(item.gpa)}`);
        }
        break;
      }

      case "skills": {
        const items: string[] = (c.items ?? []).filter(
          (s: unknown) => typeof s === "string" && s.trim()
        );
        if (!items.length) continue;
        push(headingFor(section.type), true);
        push(items.map(clean).filter(Boolean).join(", "));
        break;
      }

      case "projects": {
        const items: any[] = c.items ?? [];
        if (!items.length) continue;
        push(headingFor(section.type), true);
        for (const item of items) {
          push([clean(item.name), clean(item.link)].filter(Boolean).join(" | "));
          if (clean(item.description)) push(clean(item.description));
          if (clean(item.technologies)) push(`Technologies: ${clean(item.technologies)}`);
          for (const bullet of item.bullets ?? []) push(`- ${clean(bullet)}`);
        }
        break;
      }

      case "certifications": {
        const items: any[] = c.items ?? [];
        if (!items.length) continue;
        push(headingFor(section.type), true);
        for (const item of items) {
          push([clean(item.name), clean(item.issuer), clean(item.date)]
            .filter(Boolean)
            .join(" | "));
        }
        break;
      }

      case "languages": {
        const items: any[] = c.items ?? [];
        if (!items.length) continue;
        push(headingFor(section.type), true);
        push(
          items
            .map((i) =>
              [clean(i.language), clean(i.proficiency)].filter(Boolean).join(" - ")
            )
            .filter(Boolean)
            .join(", ")
        );
        break;
      }

      default: {
        const items: any[] = c.items ?? [];
        if (clean(c.text)) {
          push(headingFor(section.type), true);
          push(c.text);
        } else if (items.length) {
          push(headingFor(section.type), true);
          for (const item of items) {
            if (typeof item === "string") push(item);
            else
              push(
                [clean(item.name), clean(item.title), clean(item.description), dateRange(item)]
                  .filter(Boolean)
                  .join(" | ")
              );
          }
        }
      }
    }
  }

  return lines;
}

/** Plain-text rendering of the same layer, for the .txt export and tests. */
export function textLayerToString(lines: TextLayerLine[]): string {
  return lines
    .map((l) => (l.heading ? `\n${l.text}\n${"-".repeat(Math.min(l.text.length, 60))}` : l.text))
    .join("\n")
    .trim();
}
