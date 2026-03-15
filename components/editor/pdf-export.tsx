"use client";

import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import toast from "react-hot-toast";
import type { ResumeSection } from "@/hooks/use-resume-store";

export type ExportFormat = "pdf" | "docx" | "txt" | "json";

export async function exportToPdf(
  element: HTMLElement | null,
  title: string = "Resume"
) {
  if (!element) {
    toast.error("Nothing to export");
    return;
  }

  const toastId = toast.loading("Generating PDF…");

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
    });

    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    const pdf = new jsPDF("p", "mm", "a4");
    const imgData = canvas.toDataURL("image/png");

    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);

    const safeName = title.replace(/[^a-zA-Z0-9-_ ]/g, "").trim() || "Resume";
    pdf.save(`${safeName}.pdf`);

    toast.success("PDF downloaded!", { id: toastId });
  } catch {
    toast.error("Failed to export PDF", { id: toastId });
  }
}

function sectionsToPlainText(
  sections: ResumeSection[],
  title: string
): string {
  const lines: string[] = [title, "=".repeat(title.length), ""];

  const sorted = [...sections].sort((a, b) => a.order - b.order);

  for (const section of sorted) {
    const c = section.content;
    if (!c) continue;

    const heading = section.type.charAt(0).toUpperCase() + section.type.slice(1);
    lines.push(heading.toUpperCase());
    lines.push("-".repeat(heading.length));

    switch (section.type) {
      case "personal":
        if (c.fullName) lines.push(c.fullName);
        if (c.email) lines.push(`Email: ${c.email}`);
        if (c.phone) lines.push(`Phone: ${c.phone}`);
        if (c.location) lines.push(`Location: ${c.location}`);
        if (c.linkedin) lines.push(`LinkedIn: ${c.linkedin}`);
        if (c.website) lines.push(`Website: ${c.website}`);
        break;
      case "summary":
        if (c.text) lines.push(c.text);
        break;
      case "experience":
        for (const item of c.items ?? []) {
          const dateRange = item.current
            ? `${item.startDate} - Present`
            : `${item.startDate} - ${item.endDate}`;
          lines.push(`${item.title} at ${item.company} (${dateRange})`);
          if (item.location) lines.push(`  ${item.location}`);
          for (const bullet of item.bullets ?? []) {
            if (bullet) lines.push(`  • ${bullet}`);
          }
          lines.push("");
        }
        break;
      case "education":
        for (const item of c.items ?? []) {
          lines.push(`${item.degree} - ${item.school}`);
          if (item.location) lines.push(`  ${item.location}`);
          if (item.startDate || item.endDate)
            lines.push(`  ${item.startDate} - ${item.endDate}`);
          if (item.gpa) lines.push(`  GPA: ${item.gpa}`);
          lines.push("");
        }
        break;
      case "skills":
        lines.push((c.items ?? []).filter(Boolean).join(", "));
        break;
      case "projects":
        for (const item of c.items ?? []) {
          lines.push(item.name || "Untitled Project");
          if (item.description) lines.push(`  ${item.description}`);
          if (item.technologies) lines.push(`  Tech: ${item.technologies}`);
          if (item.link) lines.push(`  Link: ${item.link}`);
          lines.push("");
        }
        break;
      case "certifications":
        for (const item of c.items ?? []) {
          lines.push(`${item.name} - ${item.issuer} (${item.date})`);
        }
        break;
      case "languages":
        for (const item of c.items ?? []) {
          lines.push(`${item.language}: ${item.proficiency}`);
        }
        break;
      default:
        lines.push(JSON.stringify(c, null, 2));
    }

    lines.push("");
  }

  return lines.join("\n");
}

export function exportToTxt(
  sections: ResumeSection[],
  title: string = "Resume"
) {
  const text = sectionsToPlainText(sections, title);
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const safeName = title.replace(/[^a-zA-Z0-9-_ ]/g, "").trim() || "Resume";
  a.download = `${safeName}.txt`;
  a.click();
  URL.revokeObjectURL(url);
  toast.success("TXT downloaded!");
}

export function exportToJson(
  sections: ResumeSection[],
  title: string = "Resume",
  template: string = "modern",
  color: string = "#2563eb"
) {
  const data = {
    title,
    template,
    color,
    exportedAt: new Date().toISOString(),
    sections: [...sections].sort((a, b) => a.order - b.order).map((s) => ({
      type: s.type,
      order: s.order,
      content: s.content,
    })),
  };
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const safeName = title.replace(/[^a-zA-Z0-9-_ ]/g, "").trim() || "Resume";
  a.download = `${safeName}.json`;
  a.click();
  URL.revokeObjectURL(url);
  toast.success("JSON downloaded!");
}

export function exportToDocx(
  sections: ResumeSection[],
  title: string = "Resume"
) {
  const text = sectionsToPlainText(sections, title);

  const docContent = `
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<?mso-application progid="Word.Document"?>
<w:wordDocument xmlns:w="http://schemas.microsoft.com/office/word/2003/wordml">
<w:body>
${text
  .split("\n")
  .map(
    (line) =>
      `<w:p><w:r><w:t>${line.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</w:t></w:r></w:p>`
  )
  .join("\n")}
</w:body>
</w:wordDocument>`.trim();

  const blob = new Blob([docContent], {
    type: "application/vnd.ms-word;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const safeName = title.replace(/[^a-zA-Z0-9-_ ]/g, "").trim() || "Resume";
  a.download = `${safeName}.doc`;
  a.click();
  URL.revokeObjectURL(url);
  toast.success("DOCX downloaded!");
}
