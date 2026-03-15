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

const SIDEBAR_TYPES = ["skills", "languages", "certifications", "education"];
const MAIN_TYPES = ["summary", "experience", "projects"];

export default function TechTemplate({ sections, color }: TemplateProps) {
  const sorted = [...sections].sort((a, b) => a.order - b.order);
  const personal = getSectionByType(sections, "personal");

  const sidebarSections = sorted.filter((s) => SIDEBAR_TYPES.includes(s.type) && hasContent(s));
  const mainSections = sorted.filter((s) => MAIN_TYPES.includes(s.type) && hasContent(s));

  const sidebarHeaderStyle: React.CSSProperties = {
    fontSize: "10px",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "2px",
    color: "rgba(255,255,255,0.7)",
    margin: "0 0 8px 0",
    paddingBottom: "4px",
    borderBottom: "1px solid rgba(255,255,255,0.2)",
  };

  const mainHeaderStyle: React.CSSProperties = {
    fontSize: "13px",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "1.5px",
    color,
    margin: "0 0 8px 0",
    paddingBottom: "4px",
    borderBottom: `1.5px solid ${color}30`,
  };

  return (
    <div
      className="resume-template bg-white"
      style={{
        width: "794px",
        height: "1123px",
        boxSizing: "border-box",
        overflow: "hidden",
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
        color: "#333",
        display: "flex",
      }}
    >
      {/* Sidebar */}
      <div
        style={{
          width: "220px",
          minWidth: "220px",
          backgroundColor: color,
          color: "#fff",
          padding: "32px 20px",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Name in sidebar */}
        {personal && hasContent(personal) && (
          <div style={{ marginBottom: "24px" }}>
            <h1 style={{ fontSize: "20px", fontWeight: 700, margin: 0, lineHeight: 1.3, color: "#fff" }}>
              {personal.content.fullName}
            </h1>
            <div style={{ marginTop: "12px", fontSize: "9.5px", color: "rgba(255,255,255,0.8)", lineHeight: 2 }}>
              {personal.content.email && <div>{personal.content.email}</div>}
              {personal.content.phone && <div>{personal.content.phone}</div>}
              {personal.content.location && <div>{personal.content.location}</div>}
              {personal.content.linkedin && <div>{personal.content.linkedin}</div>}
              {personal.content.website && <div>{personal.content.website}</div>}
            </div>
          </div>
        )}

        {/* Sidebar Sections */}
        {sidebarSections.map((section) => (
          <div key={section.id} style={{ marginBottom: "18px" }}>
            <h2 style={sidebarHeaderStyle}>{section.type}</h2>

            {section.type === "skills" && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                {section.content.items.map((skill: string, i: number) => (
                  <span
                    key={i}
                    style={{
                      fontSize: "9px",
                      padding: "2px 8px",
                      borderRadius: "2px",
                      backgroundColor: "rgba(255,255,255,0.15)",
                      color: "#fff",
                    }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            )}

            {section.type === "languages" && (
              <div>
                {section.content.items.map((item: any) => (
                  <div key={item.id} style={{ fontSize: "10px", color: "rgba(255,255,255,0.9)", marginBottom: "3px" }}>
                    {item.language}
                    {item.proficiency && (
                      <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "9px" }}> — {item.proficiency}</span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {section.type === "certifications" && (
              <div>
                {section.content.items.map((item: any) => (
                  <div key={item.id} style={{ marginBottom: "6px" }}>
                    <div style={{ fontSize: "10px", fontWeight: 600, color: "#fff" }}>{item.name}</div>
                    <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.6)" }}>
                      {item.issuer}{item.date ? ` · ${item.date}` : ""}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {section.type === "education" && (
              <div>
                {section.content.items.map((item: any) => (
                  <div key={item.id} style={{ marginBottom: "8px" }}>
                    <div style={{ fontSize: "10.5px", fontWeight: 600, color: "#fff", lineHeight: 1.3 }}>{item.degree}</div>
                    <div style={{ fontSize: "9.5px", color: "rgba(255,255,255,0.7)" }}>{item.school}</div>
                    <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.5)" }}>
                      {item.startDate}{item.endDate ? ` – ${item.endDate}` : ""}
                    </div>
                    {item.gpa && (
                      <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.6)", marginTop: "1px" }}>GPA: {item.gpa}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: "32px 36px", boxSizing: "border-box" }}>
        {mainSections.map((section) => (
          <div key={section.id} style={{ marginBottom: "20px" }}>
            <h2 style={mainHeaderStyle}>{section.type}</h2>

            {section.type === "summary" && (
              <p style={{ fontSize: "11px", lineHeight: 1.7, color: "#444", margin: 0 }}>
                {section.content.text}
              </p>
            )}

            {section.type === "experience" && (
              <div>
                {section.content.items.map((item: any) => (
                  <div key={item.id} style={{ marginBottom: "14px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                      <span style={{ fontSize: "12px", fontWeight: 700, color: "#1a1a1a" }}>{item.title}</span>
                      <span style={{ fontSize: "10px", color: "#888", whiteSpace: "nowrap" }}>
                        {item.startDate}{item.endDate || item.current ? ` – ${item.current ? "Present" : item.endDate}` : ""}
                      </span>
                    </div>
                    <div style={{ fontSize: "11px", color: "#666", marginTop: "1px" }}>
                      {item.company}{item.location ? ` · ${item.location}` : ""}
                    </div>
                    {item.bullets && item.bullets.length > 0 && (
                      <ul style={{ margin: "4px 0 0 0", paddingLeft: "14px" }}>
                        {item.bullets.map((b: string, i: number) => (
                          <li key={i} style={{ fontSize: "10.5px", lineHeight: 1.55, color: "#444", marginBottom: "2px" }}>{b}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}

            {section.type === "projects" && (
              <div>
                {section.content.items.map((item: any) => (
                  <div key={item.id} style={{ marginBottom: "12px" }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                      <span style={{ fontSize: "12px", fontWeight: 700, color: "#1a1a1a" }}>{item.name}</span>
                      {item.link && <span style={{ fontSize: "9.5px", color }}>{item.link}</span>}
                    </div>
                    {item.description && (
                      <p style={{ fontSize: "10.5px", color: "#444", margin: "2px 0 0 0", lineHeight: 1.5 }}>{item.description}</p>
                    )}
                    {item.technologies && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginTop: "4px" }}>
                        {item.technologies.split(",").map((tech: string, i: number) => (
                          <span
                            key={i}
                            style={{
                              fontSize: "8.5px",
                              padding: "1px 6px",
                              borderRadius: "2px",
                              backgroundColor: `${color}12`,
                              color: color,
                              border: `1px solid ${color}30`,
                            }}
                          >
                            {tech.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
