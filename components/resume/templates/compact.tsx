"use client";

import React from "react";

interface TemplateProps {
  sections: Array<{
    id: string;
    type: string;
    order: number;
    content: any;
  }>;
  color: string;
}

function getSectionByType(sections: TemplateProps["sections"], type: string) {
  return sections.find((s) => s.type === type);
}

function hasContent(section: any): boolean {
  if (!section) return false;
  const c = section.content;
  if (!c) return false;
  if (c.text && c.text.trim()) return true;
  if (c.fullName && c.fullName.trim()) return true;
  if (c.items && c.items.length > 0) return true;
  return false;
}

const TWO_COL_TYPES = ["skills", "languages", "certifications"];

export default function CompactTemplate({ sections, color }: TemplateProps) {
  const sorted = [...sections].sort((a, b) => a.order - b.order);
  const personal = getSectionByType(sections, "personal");

  const twoColSections = sorted.filter((s) => TWO_COL_TYPES.includes(s.type) && hasContent(s));
  const singleColSections = sorted.filter(
    (s) => s.type !== "personal" && !TWO_COL_TYPES.includes(s.type) && hasContent(s)
  );

  const sectionHeaderStyle: React.CSSProperties = {
    fontSize: "10px",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "1.5px",
    color,
    margin: "0 0 4px 0",
    paddingBottom: "2px",
    borderBottom: `1px solid ${color}40`,
  };

  return (
    <div
      className="resume-template bg-white"
      style={{
        width: "794px",
        height: "1123px",
        padding: "28px 36px",
        boxSizing: "border-box",
        overflow: "hidden",
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
        color: "#333",
        fontSize: "9.5px",
      }}
    >
      {/* Compact Header */}
      {personal && hasContent(personal) && (
        <div style={{ marginBottom: "12px", borderBottom: `2px solid ${color}`, paddingBottom: "8px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#1a1a1a", margin: 0 }}>
              {personal.content.fullName}
            </h1>
            <div style={{ display: "flex", gap: "10px", fontSize: "9px", color: "#666" }}>
              {personal.content.email && <span>{personal.content.email}</span>}
              {personal.content.phone && <span>{personal.content.phone}</span>}
            </div>
          </div>
          <div style={{ display: "flex", gap: "10px", fontSize: "9px", color: "#888", marginTop: "2px" }}>
            {personal.content.location && <span>{personal.content.location}</span>}
            {personal.content.linkedin && <span>{personal.content.linkedin}</span>}
            {personal.content.website && <span>{personal.content.website}</span>}
          </div>
        </div>
      )}

      {/* Single Column Sections */}
      {singleColSections.map((section) => (
        <div key={section.id} style={{ marginBottom: "10px" }}>
          <h2 style={sectionHeaderStyle}>{section.type}</h2>

          {section.type === "summary" && (
            <p style={{ fontSize: "9.5px", lineHeight: 1.55, color: "#444", margin: 0 }}>
              {section.content.text}
            </p>
          )}

          {section.type === "experience" && (
            <div>
              {section.content.items.map((item: any) => (
                <div key={item.id} style={{ marginBottom: "8px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <div>
                      <span style={{ fontSize: "10px", fontWeight: 700, color: "#1a1a1a" }}>{item.title}</span>
                      <span style={{ fontSize: "9.5px", color: "#555" }}> — {item.company}</span>
                      {item.location && <span style={{ fontSize: "9px", color: "#888" }}>, {item.location}</span>}
                    </div>
                    <span style={{ fontSize: "8.5px", color: "#999", whiteSpace: "nowrap", marginLeft: "8px" }}>
                      {item.startDate}{item.endDate || item.current ? ` – ${item.current ? "Present" : item.endDate}` : ""}
                    </span>
                  </div>
                  {item.bullets && item.bullets.length > 0 && (
                    <ul style={{ margin: "2px 0 0 0", paddingLeft: "14px" }}>
                      {item.bullets.map((b: string, i: number) => (
                        <li key={i} style={{ fontSize: "9px", lineHeight: 1.5, color: "#444", marginBottom: "1px" }}>{b}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}

          {section.type === "education" && (
            <div>
              {section.content.items.map((item: any) => (
                <div key={item.id} style={{ marginBottom: "4px", display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <div>
                    <span style={{ fontSize: "10px", fontWeight: 600, color: "#1a1a1a" }}>{item.degree}</span>
                    <span style={{ fontSize: "9.5px", color: "#555" }}> — {item.school}</span>
                    {item.gpa && <span style={{ fontSize: "9px", color: "#888" }}> (GPA: {item.gpa})</span>}
                  </div>
                  <span style={{ fontSize: "8.5px", color: "#999", whiteSpace: "nowrap" }}>
                    {item.startDate}{item.endDate ? ` – ${item.endDate}` : ""}
                  </span>
                </div>
              ))}
            </div>
          )}

          {section.type === "projects" && (
            <div>
              {section.content.items.map((item: any) => (
                <div key={item.id} style={{ marginBottom: "6px" }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
                    <span style={{ fontSize: "10px", fontWeight: 600, color: "#1a1a1a" }}>{item.name}</span>
                    {item.technologies && <span style={{ fontSize: "8.5px", color: "#888" }}>({item.technologies})</span>}
                    {item.link && <span style={{ fontSize: "8.5px", color }}>{item.link}</span>}
                  </div>
                  {item.description && (
                    <p style={{ fontSize: "9px", color: "#555", margin: "1px 0 0 0", lineHeight: 1.45 }}>{item.description}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Two Column Section for skills/languages/certs */}
      {twoColSections.length > 0 && (
        <div style={{ display: "flex", gap: "24px" }}>
          {twoColSections.map((section) => (
            <div key={section.id} style={{ flex: 1, marginBottom: "10px" }}>
              <h2 style={sectionHeaderStyle}>{section.type}</h2>

              {section.type === "skills" && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "3px" }}>
                  {section.content.items.map((skill: string, i: number) => (
                    <span key={i} style={{ fontSize: "8.5px", padding: "1px 6px", backgroundColor: "#f3f4f6", borderRadius: "2px", color: "#555" }}>
                      {skill}
                    </span>
                  ))}
                </div>
              )}

              {section.type === "certifications" && (
                <div>
                  {section.content.items.map((item: any) => (
                    <div key={item.id} style={{ fontSize: "9px", marginBottom: "2px" }}>
                      <strong>{item.name}</strong>
                      {item.issuer && <span style={{ color: "#888" }}> — {item.issuer}</span>}
                      {item.date && <span style={{ color: "#aaa" }}> ({item.date})</span>}
                    </div>
                  ))}
                </div>
              )}

              {section.type === "languages" && (
                <div>
                  {section.content.items.map((item: any) => (
                    <div key={item.id} style={{ fontSize: "9px", marginBottom: "1px" }}>
                      {item.language}{item.proficiency && <span style={{ color: "#888" }}> — {item.proficiency}</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
