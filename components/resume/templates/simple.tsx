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

export default function SimpleTemplate({ sections, color }: TemplateProps) {
  const sorted = [...sections].sort((a, b) => a.order - b.order);
  const personal = getSectionByType(sections, "personal");

  const sectionHeaderStyle: React.CSSProperties = {
    fontSize: "14px",
    fontWeight: 700,
    color: "#222",
    margin: "0 0 6px 0",
    paddingBottom: "4px",
    borderBottom: `1px solid #ddd`,
  };

  return (
    <div
      className="resume-template bg-white"
      style={{
        width: "794px",
        height: "1123px",
        padding: "44px 52px",
        boxSizing: "border-box",
        overflow: "hidden",
        fontFamily: "Arial, Helvetica, sans-serif",
        color: "#333",
      }}
    >
      {/* Header */}
      {personal && hasContent(personal) && (
        <div style={{ marginBottom: "20px" }}>
          <h1 style={{ fontSize: "26px", fontWeight: 700, color, margin: 0 }}>
            {personal.content.fullName}
          </h1>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "12px",
              marginTop: "6px",
              fontSize: "11px",
              color: "#555",
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
          <div key={section.id} style={{ marginBottom: "16px" }}>
            <h2 style={sectionHeaderStyle}>{section.type.charAt(0).toUpperCase() + section.type.slice(1)}</h2>

            {section.type === "summary" && (
              <p style={{ fontSize: "11px", lineHeight: 1.7, color: "#444", margin: 0 }}>
                {section.content.text}
              </p>
            )}

            {section.type === "experience" && (
              <div>
                {section.content.items.map((item: any) => (
                  <div key={item.id} style={{ marginBottom: "12px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                      <div>
                        <span style={{ fontSize: "12px", fontWeight: 700, color: "#222" }}>{item.title}</span>
                        {item.company && <span style={{ fontSize: "11px", color: "#555" }}> at {item.company}</span>}
                      </div>
                      <span style={{ fontSize: "10px", color: "#888", whiteSpace: "nowrap" }}>
                        {item.startDate}{item.endDate || item.current ? ` – ${item.current ? "Present" : item.endDate}` : ""}
                      </span>
                    </div>
                    {item.location && (
                      <div style={{ fontSize: "10px", color: "#888", marginTop: "1px" }}>{item.location}</div>
                    )}
                    {item.bullets && item.bullets.length > 0 && (
                      <ul style={{ margin: "4px 0 0 0", paddingLeft: "18px" }}>
                        {item.bullets.map((b: string, i: number) => (
                          <li key={i} style={{ fontSize: "10.5px", lineHeight: 1.6, color: "#444", marginBottom: "2px" }}>{b}</li>
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
                  <div key={item.id} style={{ marginBottom: "8px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                      <div>
                        <span style={{ fontSize: "12px", fontWeight: 700, color: "#222" }}>{item.degree}</span>
                        {item.school && <span style={{ fontSize: "11px", color: "#555" }}> — {item.school}</span>}
                      </div>
                      <span style={{ fontSize: "10px", color: "#888" }}>
                        {item.startDate}{item.endDate ? ` – ${item.endDate}` : ""}
                      </span>
                    </div>
                    {item.location && <div style={{ fontSize: "10px", color: "#888" }}>{item.location}</div>}
                    {item.gpa && <div style={{ fontSize: "10px", color: "#666", marginTop: "2px" }}>GPA: {item.gpa}</div>}
                  </div>
                ))}
              </div>
            )}

            {section.type === "skills" && (
              <ul style={{ margin: 0, paddingLeft: "18px", columns: 2, columnGap: "24px" }}>
                {section.content.items.map((skill: string, i: number) => (
                  <li key={i} style={{ fontSize: "10.5px", color: "#444", lineHeight: 1.7 }}>{skill}</li>
                ))}
              </ul>
            )}

            {section.type === "projects" && (
              <div>
                {section.content.items.map((item: any) => (
                  <div key={item.id} style={{ marginBottom: "10px" }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                      <span style={{ fontSize: "12px", fontWeight: 700, color: "#222" }}>{item.name}</span>
                      {item.link && <span style={{ fontSize: "10px", color }}>{item.link}</span>}
                    </div>
                    {item.description && (
                      <p style={{ fontSize: "10.5px", color: "#444", margin: "2px 0 0 0", lineHeight: 1.55 }}>{item.description}</p>
                    )}
                    {item.technologies && (
                      <p style={{ fontSize: "10px", color: "#777", margin: "2px 0 0 0" }}>Technologies: {item.technologies}</p>
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
                      <strong>{item.name}</strong>
                      {item.issuer && <span style={{ color: "#666" }}> — {item.issuer}</span>}
                    </span>
                    {item.date && <span style={{ fontSize: "10px", color: "#888" }}>{item.date}</span>}
                  </div>
                ))}
              </div>
            )}

            {section.type === "languages" && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
                {section.content.items.map((item: any) => (
                  <span key={item.id} style={{ fontSize: "11px" }}>
                    {item.language}{item.proficiency && <span style={{ color: "#888" }}> ({item.proficiency})</span>}
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
