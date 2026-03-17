"use client";

import toast from "react-hot-toast";
import type { ResumeSection } from "@/hooks/use-resume-store";

export type ExportFormat = "pdf" | "docx" | "txt" | "json" | "md";

export async function exportToPdf(
  sections: ResumeSection[],
  title: string = "Resume",
  color: string = "#2563eb"
) {
  const toastId = toast.loading("Generating PDF…");

  try {
    const { pdf } = await import("@react-pdf/renderer");
    const { ResumePDFDocument } = await import("@/components/resume/resume-pdf-document");

    const blob = await pdf(
      <ResumePDFDocument sections={sections} color={color} />
    ).toBlob();

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const safeName = title.replace(/[^a-zA-Z0-9-_ ]/g, "").trim() || "Resume";
    a.download = `${safeName}.pdf`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success("PDF downloaded!", { id: toastId });
  } catch (err) {
    console.error("PDF export error:", err);
    toast.error("Failed to export PDF", { id: toastId });
  }
}

/** @deprecated Use exportToPdf(sections, title, color) instead */
export async function exportToPdfFromElement(
  element: HTMLElement | null,
  title: string = "Resume"
) {
  if (!element) {
    toast.error("Nothing to export");
    return;
  }
  const { default: html2canvas } = await import("html2canvas");
  const { default: jsPDF } = await import("jspdf");

  const toastId = toast.loading("Generating PDF…");
  try {
    const canvas = await html2canvas(element, {
      scale: 3,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
    });
    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    const pdf = new jsPDF("p", "mm", "a4");
    pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, imgWidth, imgHeight);
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
      case "personal": {
        const name = c.fullName || [c.firstName, c.lastName].filter(Boolean).join(" ").trim();
        if (name) lines.push(name);
        if (c.email) lines.push(`Email: ${c.email}`);
        if (c.phone) lines.push(`Phone: ${c.phone}`);
        if (c.location) lines.push(`Location: ${c.location}`);
        if (c.linkedin) lines.push(`LinkedIn: ${c.linkedin}`);
        if (c.github) lines.push(`GitHub: ${c.github}`);
        if (c.portfolio) lines.push(`Portfolio: ${c.portfolio}`);
        if (c.website) lines.push(`Website: ${c.website}`);
        break;
      }
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

function sectionsToMarkdown(
  sections: ResumeSection[],
  title: string
): string {
  const lines: string[] = [`# ${title}`, ""];

  const sorted = [...sections].sort((a, b) => a.order - b.order);

  for (const section of sorted) {
    const c = section.content;
    if (!c) continue;

    const heading = section.type.charAt(0).toUpperCase() + section.type.slice(1);

    switch (section.type) {
      case "personal": {
        const name = c.fullName || [c.firstName, c.lastName].filter(Boolean).join(" ").trim();
        if (name) lines.push(`**${name}**`, "");
        {
          const contactParts: string[] = [];
          if (c.email) contactParts.push(c.email);
          if (c.phone) contactParts.push(c.phone);
          if (c.location) contactParts.push(c.location);
          if (contactParts.length) lines.push(contactParts.join(" | "), "");
          const linkParts: string[] = [];
          if (c.linkedin) linkParts.push(`[LinkedIn](${c.linkedin})`);
          if (c.github) linkParts.push(`[GitHub](${c.github})`);
          if (c.portfolio) linkParts.push(`[Portfolio](${c.portfolio})`);
          if (c.website) linkParts.push(`[Website](${c.website})`);
          if (linkParts.length) lines.push(linkParts.join(" | "), "");
        }
        break;
      }
      case "summary":
        lines.push(`## ${heading}`, "");
        if (c.text) lines.push(c.text, "");
        break;
      case "experience":
        lines.push(`## ${heading}`, "");
        for (const item of c.items ?? []) {
          const dateRange = item.current
            ? `${item.startDate} - Present`
            : `${item.startDate} - ${item.endDate}`;
          lines.push(`### ${item.title} at ${item.company}`);
          lines.push(`*${dateRange}${item.location ? ` | ${item.location}` : ""}*`, "");
          for (const bullet of item.bullets ?? []) {
            if (bullet) lines.push(`- ${bullet}`);
          }
          lines.push("");
        }
        break;
      case "education":
        lines.push(`## ${heading}`, "");
        for (const item of c.items ?? []) {
          lines.push(`### ${item.degree} — ${item.school}`);
          const meta: string[] = [];
          if (item.startDate || item.endDate) meta.push(`${item.startDate} - ${item.endDate}`);
          if (item.location) meta.push(item.location);
          if (item.gpa) meta.push(`GPA: ${item.gpa}`);
          if (meta.length) lines.push(`*${meta.join(" | ")}*`);
          lines.push("");
        }
        break;
      case "skills":
        lines.push(`## ${heading}`, "");
        lines.push((c.items ?? []).filter(Boolean).join(" · "), "");
        break;
      case "projects":
        lines.push(`## ${heading}`, "");
        for (const item of c.items ?? []) {
          lines.push(`### ${item.name || "Untitled Project"}`);
          if (item.technologies) lines.push(`*Tech: ${item.technologies}*`);
          if (item.description) lines.push("", item.description);
          if (item.link) lines.push("", `[Project Link](${item.link})`);
          lines.push("");
        }
        break;
      case "certifications":
        lines.push(`## ${heading}`, "");
        for (const item of c.items ?? []) {
          lines.push(`- **${item.name}** — ${item.issuer} (${item.date})`);
        }
        lines.push("");
        break;
      case "languages":
        lines.push(`## ${heading}`, "");
        for (const item of c.items ?? []) {
          lines.push(`- ${item.language}: ${item.proficiency}`);
        }
        lines.push("");
        break;
      default:
        lines.push(`## ${heading}`, "", "```json", JSON.stringify(c, null, 2), "```", "");
    }
  }

  return lines.join("\n");
}

export function exportToMarkdown(
  sections: ResumeSection[],
  title: string = "Resume"
) {
  const md = sectionsToMarkdown(sections, title);
  const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const safeName = title.replace(/[^a-zA-Z0-9-_ ]/g, "").trim() || "Resume";
  a.download = `${safeName}.md`;
  a.click();
  URL.revokeObjectURL(url);
  toast.success("Markdown downloaded!");
}

export async function exportToDocx(
  sections: ResumeSection[],
  title: string = "Resume"
) {
  const toastId = toast.loading("Generating DOCX…");

  try {
    const {
      Document,
      Packer,
      Paragraph,
      TextRun,
      AlignmentType,
      convertInchesToTwip,
    } = await import("docx");

    const sorted = [...sections].sort((a, b) => a.order - b.order);
    const children: InstanceType<typeof Paragraph>[] = [];

    for (const section of sorted) {
      const c = section.content;
      if (!c) continue;

      const heading =
        section.type.charAt(0).toUpperCase() + section.type.slice(1);

      switch (section.type) {
        case "personal": {
          const name =
            c.fullName ||
            [c.firstName, c.lastName].filter(Boolean).join(" ").trim();
          if (name) {
            children.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: name,
                    bold: true,
                    size: 44,
                  }),
                ],
                alignment: AlignmentType.CENTER,
                spacing: { after: 120 },
              })
            );
          }
          const contactParts: string[] = [];
          if (c.email) contactParts.push(c.email);
          if (c.phone) contactParts.push(c.phone);
          if (c.location) contactParts.push(c.location);
          if (c.linkedin) contactParts.push(c.linkedin);
          if (c.github) contactParts.push(c.github);
          if (c.portfolio) contactParts.push(c.portfolio);
          if (contactParts.length) {
            children.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: contactParts.join(" · "),
                    size: 20,
                  }),
                ],
                alignment: AlignmentType.CENTER,
                spacing: { after: 240 },
              })
            );
          }
          break;
        }
        case "summary":
          if (c.text) {
            children.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: heading,
                    bold: true,
                    size: 22,
                  }),
                ],
                spacing: { before: 200, after: 80 },
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: c.text,
                    size: 22,
                  }),
                ],
                spacing: { after: 200 },
              })
            );
          }
          break;
        case "experience":
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: heading,
                  bold: true,
                  size: 22,
                }),
              ],
              spacing: { before: 200, after: 80 },
            })
          );
          for (const item of c.items ?? []) {
            const dateRange = item.current
              ? `${item.startDate} - Present`
              : `${item.startDate} - ${item.endDate}`;
            children.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: item.title,
                    bold: true,
                    size: 22,
                  }),
                ],
                spacing: { before: 120 },
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${item.company}${item.location ? `, ${item.location}` : ""} | ${dateRange}`,
                    italics: true,
                    size: 20,
                  }),
                ],
                spacing: { after: 80 },
              })
            );
            for (const bullet of item.bullets ?? []) {
              if (bullet) {
                children.push(
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: `• ${bullet}`,
                        size: 22,
                      }),
                    ],
                    indent: { left: convertInchesToTwip(0.25) },
                    spacing: { after: 60 },
                  })
                );
              }
            }
          }
          break;
        case "education":
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: heading,
                  bold: true,
                  size: 22,
                }),
              ],
              spacing: { before: 200, after: 80 },
            })
          );
          for (const item of c.items ?? []) {
            const meta: string[] = [];
            if (item.startDate || item.endDate)
              meta.push(`${item.startDate} - ${item.endDate}`);
            if (item.location) meta.push(item.location);
            if (item.gpa) meta.push(`GPA: ${item.gpa}`);
            children.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${item.degree}${item.field ? ` in ${item.field}` : ""}`,
                    bold: true,
                    size: 22,
                  }),
                ],
                spacing: { before: 120 },
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${item.school}${meta.length ? ` | ${meta.join(" | ")}` : ""}`,
                    italics: true,
                    size: 20,
                  }),
                ],
                spacing: { after: 120 },
              })
            );
          }
          break;
        case "skills":
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: heading,
                  bold: true,
                  size: 22,
                }),
              ],
              spacing: { before: 200, after: 80 },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: (c.items ?? []).filter(Boolean).join(", "),
                  size: 22,
                }),
              ],
              spacing: { after: 200 },
            })
          );
          break;
        case "projects":
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: heading,
                  bold: true,
                  size: 22,
                }),
              ],
              spacing: { before: 200, after: 80 },
            })
          );
          for (const item of c.items ?? []) {
            if (item.name || item.description) {
              children.push(
                new Paragraph({
                  children: [
                    new TextRun({
                      text: item.name || "Project",
                      bold: true,
                      size: 22,
                    }),
                  ],
                  spacing: { before: 120 },
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: [item.description, item.technologies, item.link]
                        .filter(Boolean)
                        .join(" | "),
                      size: 20,
                    }),
                  ],
                  spacing: { after: 120 },
                })
              );
            }
          }
          break;
        case "certifications":
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: heading,
                  bold: true,
                  size: 22,
                }),
              ],
              spacing: { before: 200, after: 80 },
            })
          );
          for (const item of c.items ?? []) {
            if (item.name) {
              children.push(
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `${item.name}${item.issuer ? ` — ${item.issuer}` : ""}${item.date ? ` (${item.date})` : ""}`,
                      size: 22,
                    }),
                  ],
                  spacing: { after: 80 },
                })
              );
            }
          }
          break;
        case "languages":
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: heading,
                  bold: true,
                  size: 22,
                }),
              ],
              spacing: { before: 200, after: 80 },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: (c.items ?? [])
                    .map(
                      (i: any) =>
                        `${i.language}${i.proficiency ? ` (${i.proficiency})` : ""}`
                    )
                    .filter(Boolean)
                    .join(", "),
                  size: 22,
                }),
              ],
              spacing: { after: 200 },
            })
          );
          break;
      }
    }

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: children.length ? children : [
            new Paragraph({
              children: [new TextRun({ text: "Empty resume" })],
            }),
          ],
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const safeName = title.replace(/[^a-zA-Z0-9-_ ]/g, "").trim() || "Resume";
    a.download = `${safeName}.docx`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success("DOCX downloaded!", { id: toastId });
  } catch (err) {
    console.error("DOCX export error:", err);
    toast.error("Failed to export DOCX", { id: toastId });
  }
}
