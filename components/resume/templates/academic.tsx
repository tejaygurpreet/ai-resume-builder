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

export default function AcademicTemplate({ sections, color }: TemplateProps) {
  const sorted = [...sections].sort((a, b) => a.order - b.order);
  const personal = getSectionByType(sections, "personal");

  const sectionHeaderStyle: React.CSSProperties = {
    fontSize: "12px",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "3px",
    color: "#1a1a1a",
    margin: "0 0 8px 0",
    paddingBottom: "4px",
    borderBottom: `1px solid ${color}`,
    fontFamily: "Georgia, 'Times New Roman', serif",
  };

  return (
    <div
      style={{
        width: "794px",
        height: "1123px",
        boxSizing: "border-box",
        overflow: "hidden",
        padding: "44px 56px",
        fontFamily: "Georgia, 'Times New Roman', serif",
        backgroundColor: "white",
        color: "#222",
      }}
    >
      {/* Header */}
      {personal && hasContent(personal) && (
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <h1
            style={{
              fontSize: "26px",
              fontWeight: 700,
              color: "#111",
              margin: 0,
              letterSpacing: "2px",
              textTransform: "uppercase",
            }}
          >
            {personal.content.fullName}
          </h1>
          <div
            style={{
              marginTop: "8px",
              fontSize: "10.5px",
              color: "#555",
              display: "flex",
              justifyContent: "center",
              flexWrap: "wrap",
              gap: "4px",
            }}
          >
            {[
              personal.content.email,
              personal.content.phone,
              personal.content.location,
              personal.content.linkedin,
              personal.content.github,
              personal.content.portfolio,
              personal.content.website,
            ]
              .filter(Boolean)
              .map((info, i, arr) => (
                <span key={i}>
                  {info}
                  {i < arr.length - 1 && <span style={{ margin: "0 6px", color: "#ccc" }}>|</span>}
                </span>
              ))}
          </div>
          <div
            style={{
              width: "100%",
              height: "2px",
              background: `linear-gradient(to right, transparent, ${color}, transparent)`,
              marginTop: "14px",
            }}
          />
        </div>
      )}

      {/* Sections */}
      {sorted.map((section) => {
        if (section.type === "personal" || !hasContent(section)) return null;

        return (
          <div key={section.id} style={{ marginBottom: "16px" }}>
            <h2 style={sectionHeaderStyle}>{section.type}</h2>

            {section.type === "summary" && (
              <p
                style={{
                  fontSize: "10.5px",
                  lineHeight: 1.75,
                  color: "#333",
                  margin: 0,
                  textAlign: "justify",
                  fontStyle: "italic",
                }}
              >
                {section.content.text}
              </p>
            )}

            {section.type === "education" && (
              <div>
                {section.content.items.map((item: any, i: number) => (
                  <div key={i} style={{ marginBottom: "10px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                      <div>
                        <span style={{ fontSize: "12px", fontWeight: 700, color: "#111" }}>{item.degree}</span>
                      </div>
                      <span style={{ fontSize: "10px", color: "#777", whiteSpace: "nowrap" }}>
                        {item.startDate}
                        {item.endDate ? ` – ${item.endDate}` : ""}
                      </span>
                    </div>
                    <div style={{ fontSize: "11px", color: "#444", marginTop: "1px" }}>
                      {item.school}
                      {item.location && <span style={{ color: "#777" }}>, {item.location}</span>}
                    </div>
                    {item.gpa && (
                      <div style={{ fontSize: "10px", color: "#666", marginTop: "2px" }}>
                        Grade Point Average: {item.gpa}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {section.type === "experience" && (
              <div>
                {section.content.items.map((item: any, i: number) => (
                  <div key={i} style={{ marginBottom: "12px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                      <div>
                        <span style={{ fontSize: "12px", fontWeight: 700, color: "#111" }}>{item.title}</span>
                        {item.company && (
                          <span style={{ fontSize: "11px", color: "#444" }}>, {item.company}</span>
                        )}
                      </div>
                      <span style={{ fontSize: "10px", color: "#777", whiteSpace: "nowrap", marginLeft: "12px" }}>
                        {item.startDate}
                        {item.endDate || item.current
                          ? ` – ${item.current ? "Present" : item.endDate}`
                          : ""}
                      </span>
                    </div>
                    {item.location && (
                      <div style={{ fontSize: "10px", color: "#777", marginTop: "1px" }}>{item.location}</div>
                    )}
                    {item.bullets && item.bullets.length > 0 && (
                      <ul style={{ margin: "4px 0 0 0", paddingLeft: "18px", listStyleType: "disc" }}>
                        {item.bullets.map((b: string, j: number) => (
                          <li key={j} style={{ fontSize: "10.5px", lineHeight: 1.6, color: "#333", marginBottom: "2px" }}>
                            {b}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}

            {section.type === "skills" && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 20px" }}>
                {section.content.items.map((skill: string, i: number) => (
                  <span key={i} style={{ fontSize: "10.5px", color: "#333", lineHeight: 1.8 }}>
                    • {skill}
                  </span>
                ))}
              </div>
            )}

            {section.type === "projects" && (
              <div>
                {section.content.items.map((item: any, i: number) => (
                  <div key={i} style={{ marginBottom: "10px" }}>
                    <div>
                      <span style={{ fontSize: "11.5px", fontWeight: 700, color: "#111" }}>{item.name}</span>
                      {item.link && (
                        <span style={{ fontSize: "9.5px", color, marginLeft: "8px" }}>{item.link}</span>
                      )}
                    </div>
                    {item.description && (
                      <div
                        style={{
                          fontSize: "10.5px",
                          color: "#444",
                          marginTop: "2px",
                          lineHeight: 1.6,
                          textAlign: "justify",
                        }}
                      >
                        {item.description}
                      </div>
                    )}
                    {item.technologies && (
                      <div style={{ fontSize: "10px", color: "#777", marginTop: "2px", fontStyle: "italic" }}>
                        Technologies: {item.technologies}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {section.type === "certifications" && (
              <div>
                {section.content.items.map((item: any, i: number) => (
                  <div key={i} style={{ marginBottom: "5px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                      <div>
                        <span style={{ fontSize: "11px", fontWeight: 600, color: "#111" }}>{item.name}</span>
                        {item.issuer && (
                          <span style={{ fontSize: "10.5px", color: "#555" }}>, {item.issuer}</span>
                        )}
                      </div>
                      {item.date && <span style={{ fontSize: "10px", color: "#777" }}>{item.date}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {section.type === "languages" && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 24px" }}>
                {section.content.items.map((item: any, i: number) => (
                  <span key={i} style={{ fontSize: "10.5px", color: "#333", lineHeight: 1.8 }}>
                    {item.language}
                    {item.proficiency && (
                      <span style={{ color: "#777" }}> ({item.proficiency})</span>
                    )}
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
