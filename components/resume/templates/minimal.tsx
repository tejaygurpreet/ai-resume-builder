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

export default function MinimalTemplate({ sections, color }: TemplateProps) {
  const sorted = [...sections].sort((a, b) => a.order - b.order);
  const personal = getSectionByType(sections, "personal");

  const sectionHeaderStyle: React.CSSProperties = {
    fontSize: "11px",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "2.5px",
    color: "#666",
    margin: "0 0 12px 0",
    paddingBottom: "6px",
    borderBottom: "1px solid #e5e5e5",
  };

  return (
    <div
      className="resume-template bg-white"
      style={{
        width: "794px",
        height: "1123px",
        padding: "48px 56px",
        boxSizing: "border-box",
        overflow: "hidden",
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
        color: "#333",
        WebkitFontSmoothing: "antialiased",
      }}
    >
      {/* Header */}
      {personal && hasContent(personal) && (
        <div style={{ marginBottom: "32px" }}>
          <h1 style={{ fontSize: "32px", fontWeight: 300, color, margin: 0, letterSpacing: "1px" }}>
            {getFullName(personal.content)}
          </h1>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "16px",
              marginTop: "10px",
              fontSize: "11px",
              color: "#666",
              letterSpacing: "0.5px",
            }}
          >
            {personal.content.email && <span>{personal.content.email}</span>}
            {personal.content.phone && <span>{personal.content.phone}</span>}
            {personal.content.location && <span>{personal.content.location}</span>}
            {personal.content.linkedin && <span>{personal.content.linkedin}</span>}
            {personal.content.github && <span>{personal.content.github}</span>}
            {personal.content.portfolio && <span>{personal.content.portfolio}</span>}
            {personal.content.website && <span>{personal.content.website}</span>}
          </div>
        </div>
      )}

      {/* Sections */}
      {sorted.map((section) => {
        if (section.type === "personal" || !hasContent(section)) return null;

        return (
          <div key={section.id} style={{ marginBottom: "22px" }}>
            <h2 style={sectionHeaderStyle}>{section.type}</h2>

            {section.type === "summary" && (
              <p style={{ fontSize: "11.5px", lineHeight: 1.7, color: "#333", margin: 0, fontWeight: 400 }}>
                {section.content.text}
              </p>
            )}

            {section.type === "experience" && (
              <div>
                {section.content.items.map((item: any) => (
                  <div key={item.id} style={{ marginBottom: "14px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                      <span style={{ fontSize: "12px", fontWeight: 500, color: "#222" }}>{item.title}</span>
                      <span style={{ fontSize: "9.5px", color: "#aaa", letterSpacing: "0.5px" }}>
                        {item.startDate}{item.endDate || item.current ? ` — ${item.current ? "Present" : item.endDate}` : ""}
                      </span>
                    </div>
                    <div style={{ fontSize: "10.5px", color: "#777", marginTop: "1px", fontWeight: 300 }}>
                      {item.company}{item.location ? ` · ${item.location}` : ""}
                    </div>
                    {item.bullets && item.bullets.length > 0 && (
                      <ul style={{ margin: "5px 0 0 0", paddingLeft: "14px", listStyleType: "none" }}>
                        {item.bullets.map((b: string, i: number) => (
                          <li key={i} style={{ fontSize: "10px", lineHeight: 1.65, color: "#555", marginBottom: "2px", fontWeight: 300, position: "relative", paddingLeft: "8px" }}>
                            <span style={{ position: "absolute", left: 0, color: "#ccc" }}>–</span>
                            {b}
                          </li>
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
                  <div key={item.id} style={{ marginBottom: "10px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                      <span style={{ fontSize: "12px", fontWeight: 500, color: "#222" }}>{item.degree}{item.field ? ` in ${item.field}` : ""}</span>
                      <span style={{ fontSize: "9.5px", color: "#aaa", letterSpacing: "0.5px" }}>
                        {item.startDate}{item.endDate ? ` — ${item.endDate}` : ""}
                      </span>
                    </div>
                    <div style={{ fontSize: "10.5px", color: "#777", fontWeight: 300 }}>
                      {item.school}{item.location ? ` · ${item.location}` : ""}
                    </div>
                    {item.gpa && (
                      <div style={{ fontSize: "10px", color: "#999", marginTop: "2px", fontWeight: 300 }}>GPA: {item.gpa}</div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {section.type === "skills" && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {filterValidSkills(section.content.items).map((skill: string, i: number) => (
                  <span key={i} style={{ fontSize: "10px", color: "#666", fontWeight: 300, letterSpacing: "0.3px" }}>
                    {skill}{i < filterValidSkills(section.content.items).length - 1 ? " ·" : ""}
                  </span>
                ))}
              </div>
            )}

            {section.type === "projects" && (
              <div>
                {section.content.items.map((item: any) => (
                  <div key={item.id} style={{ marginBottom: "10px" }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                      <span style={{ fontSize: "12px", fontWeight: 500, color: "#222" }}>{item.name}</span>
                      {item.link && <span style={{ fontSize: "9.5px", color: "#aaa" }}>{item.link}</span>}
                    </div>
                    {item.description && (
                      <p style={{ fontSize: "10px", color: "#555", margin: "2px 0 0 0", lineHeight: 1.6, fontWeight: 300 }}>{item.description}</p>
                    )}
                    {item.technologies && (
                      <p style={{ fontSize: "9.5px", color: "#999", margin: "2px 0 0 0", fontWeight: 300 }}>{item.technologies}</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {section.type === "certifications" && (
              <div>
                {section.content.items.map((item: any) => (
                  <div key={item.id} style={{ marginBottom: "5px", display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "10.5px", fontWeight: 400 }}>
                      {item.name}{item.issuer ? <span style={{ fontWeight: 300, color: "#888" }}> — {item.issuer}</span> : ""}
                    </span>
                    {item.date && <span style={{ fontSize: "9.5px", color: "#aaa" }}>{item.date}</span>}
                  </div>
                ))}
              </div>
            )}

            {section.type === "languages" && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
                {section.content.items.map((item: any) => (
                  <span key={item.id} style={{ fontSize: "10.5px", color: "#555", fontWeight: 300 }}>
                    {item.language}{item.proficiency ? <span style={{ color: "#aaa" }}> · {item.proficiency}</span> : ""}
                  </span>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
