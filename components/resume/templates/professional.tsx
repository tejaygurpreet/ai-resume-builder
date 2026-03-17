"use client";

import React from "react";
import { getFullName, filterValidSkills } from "@/lib/template-utils";

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
  if (c.firstName || c.lastName) return true;
  if (c.items && c.items.length > 0) return true;
  return false;
}

export default function ProfessionalTemplate({ sections, color }: TemplateProps) {
  const sorted = [...sections].sort((a, b) => a.order - b.order);
  const personal = getSectionByType(sections, "personal");

  const sectionHeaderStyle: React.CSSProperties = {
    fontSize: "11px",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "2.5px",
    color: "#1a1a1a",
    margin: "0 0 10px 0",
    paddingBottom: "6px",
    borderBottom: `2px solid ${color}`,
  };

  const contactItems = personal?.content
    ? [personal.content.email, personal.content.phone, personal.content.location, personal.content.linkedin, personal.content.github, personal.content.portfolio, personal.content.website].filter(Boolean)
    : [];

  return (
    <div
      className="resume-template bg-white text-gray-800"
      style={{
        width: "794px",
        height: "1123px",
        padding: "44px 52px",
        boxSizing: "border-box",
        overflow: "hidden",
        fontFamily: "'Georgia', 'Times New Roman', serif",
      }}
    >
      {/* Header - Centered */}
      {personal && hasContent(personal) && (
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <h1 style={{ fontSize: "28px", fontWeight: 700, color: "#1a1a1a", margin: 0, letterSpacing: "1.5px", textTransform: "uppercase", lineHeight: 1.2 }}>
            {getFullName(personal.content)}
          </h1>
          {contactItems.length > 0 && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                flexWrap: "wrap",
                gap: "8px 12px",
                marginTop: "10px",
                fontSize: "10.5px",
                color: "#555",
                lineHeight: 1.5,
              }}
            >
              {contactItems.map((item, i) => (
                <React.Fragment key={i}>
                  <span>{item}</span>
                  {i < contactItems.length - 1 && <span style={{ color: "#bbb", fontWeight: 300 }}> · </span>}
                </React.Fragment>
              ))}
            </div>
          )}
          <div style={{ borderBottom: `2px solid ${color}`, marginTop: "16px", width: "120px", marginLeft: "auto", marginRight: "auto" }} />
        </div>
      )}

      {/* Sections */}
      {sorted.map((section) => {
        if (section.type === "personal" || !hasContent(section)) return null;

        return (
          <div key={section.id} style={{ marginBottom: "22px" }}>
            <h2 style={sectionHeaderStyle}>{section.type}</h2>

            {section.type === "summary" && (
              <p style={{ fontSize: "11px", lineHeight: 1.75, color: "#333", margin: 0, textAlign: "justify" }}>
                {section.content.text}
              </p>
            )}

            {section.type === "experience" && (
              <div>
                {section.content.items.map((item: any, idx: number) => (
                  <div key={item.id} style={{ marginBottom: idx < section.content.items.length - 1 ? "18px" : "0" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: "4px" }}>
                      <span style={{ fontSize: "12px", fontWeight: 700, color: "#1a1a1a" }}>{item.title}</span>
                      <span style={{ fontSize: "10px", color: "#666", fontStyle: "italic" }}>
                        {item.startDate}{item.endDate || item.current ? ` – ${item.current ? "Present" : item.endDate}` : ""}
                      </span>
                    </div>
                    <div style={{ fontSize: "11px", color: "#444", fontStyle: "italic", marginTop: "2px" }}>
                      {item.company}{item.location ? `, ${item.location}` : ""}
                    </div>
                    {item.bullets && item.bullets.filter((b: string) => (b ?? "").trim()).length > 0 && (
                      <ul style={{ margin: "8px 0 0 0", paddingLeft: "20px", listStyleType: "disc" }}>
                        {item.bullets.filter((b: string) => (b ?? "").trim()).map((b: string, i: number) => (
                          <li key={i} style={{ fontSize: "10.5px", lineHeight: 1.65, color: "#333", marginBottom: "4px" }}>{b}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}

            {section.type === "education" && (
              <div>
                {section.content.items.map((item: any, idx: number) => (
                  <div key={item.id} style={{ marginBottom: idx < section.content.items.length - 1 ? "14px" : "0" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: "4px" }}>
                      <span style={{ fontSize: "12px", fontWeight: 700, color: "#1a1a1a" }}>{item.degree}{item.field ? ` in ${item.field}` : ""}</span>
                      <span style={{ fontSize: "10px", color: "#666", fontStyle: "italic" }}>
                        {item.startDate}{item.endDate ? ` – ${item.endDate}` : ""}
                      </span>
                    </div>
                    <div style={{ fontSize: "11px", color: "#444", fontStyle: "italic", marginTop: "2px" }}>
                      {item.school}{item.location ? `, ${item.location}` : ""}
                    </div>
                    {item.gpa && (
                      <div style={{ fontSize: "10.5px", color: "#555", marginTop: "2px" }}>GPA: {item.gpa}</div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {section.type === "skills" && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 10px" }}>
                {filterValidSkills(section.content.items).map((skill: string, i: number) => (
                  <span key={i} style={{ fontSize: "10.5px", color: "#333", fontWeight: 500 }}>
                    {skill}{i < filterValidSkills(section.content.items).length - 1 ? "," : ""}
                  </span>
                ))}
              </div>
            )}

            {section.type === "projects" && (
              <div>
                {section.content.items.map((item: any) => (
                  <div key={item.id} style={{ marginBottom: "8px" }}>
                    <span style={{ fontSize: "12px", fontWeight: 700, color: "#1a1a1a" }}>{item.name}</span>
                    {item.link && <span style={{ fontSize: "10px", color: "#666", marginLeft: "8px" }}>{item.link}</span>}
                    {item.description && (
                      <p style={{ fontSize: "10.5px", color: "#444", margin: "2px 0 0 0", lineHeight: 1.5 }}>{item.description}</p>
                    )}
                    {item.technologies && (
                      <p style={{ fontSize: "10px", color: "#666", margin: "2px 0 0 0", fontStyle: "italic" }}>{item.technologies}</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {section.type === "certifications" && (
              <div>
                {section.content.items.map((item: any) => (
                  <div key={item.id} style={{ marginBottom: "4px", display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "11px" }}>
                      <strong>{item.name}</strong>{item.issuer ? ` — ${item.issuer}` : ""}
                    </span>
                    {item.date && <span style={{ fontSize: "10px", color: "#666", fontStyle: "italic" }}>{item.date}</span>}
                  </div>
                ))}
              </div>
            )}

            {section.type === "languages" && (
              <p style={{ fontSize: "11px", color: "#333", margin: 0 }}>
                {section.content.items.map((item: any) => `${item.language}${item.proficiency ? ` (${item.proficiency})` : ""}`).join(", ")}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
