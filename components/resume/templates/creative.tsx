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

const LEFT_TYPES = ["summary", "experience", "projects"];
const RIGHT_TYPES = ["skills", "education", "certifications", "languages"];

export default function CreativeTemplate({ sections, color }: TemplateProps) {
  const sorted = [...sections].sort((a, b) => a.order - b.order);
  const personal = getSectionByType(sections, "personal");

  const leftSections = sorted.filter((s) => LEFT_TYPES.includes(s.type) && hasContent(s));
  const rightSections = sorted.filter((s) => RIGHT_TYPES.includes(s.type) && hasContent(s));

  const sectionHeaderStyle: React.CSSProperties = {
    fontSize: "12px",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "1.5px",
    color: "#333",
    margin: "0 0 8px 0",
    paddingBottom: "4px",
    borderBottom: `2px solid ${color}`,
  };

  const rightHeaderStyle: React.CSSProperties = {
    ...sectionHeaderStyle,
    fontSize: "11px",
    borderBottom: `1.5px solid ${color}50`,
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
      }}
    >
      {/* Colored Header */}
      {personal && hasContent(personal) && (
        <div
          style={{
            background: `linear-gradient(135deg, ${color}, ${color}dd)`,
            padding: "28px 40px",
            color: "#fff",
          }}
        >
          <h1 style={{ fontSize: "28px", fontWeight: 700, margin: 0, letterSpacing: "0.5px" }}>
            {personal.content.fullName}
          </h1>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "14px",
              marginTop: "10px",
              fontSize: "10.5px",
              color: "rgba(255,255,255,0.9)",
            }}
          >
            {personal.content.email && <span>📧 {personal.content.email}</span>}
            {personal.content.phone && <span>📱 {personal.content.phone}</span>}
            {personal.content.location && <span>📍 {personal.content.location}</span>}
            {personal.content.linkedin && <span>🔗 {personal.content.linkedin}</span>}
            {personal.content.github && <span>💻 {personal.content.github}</span>}
            {personal.content.portfolio && <span>🎨 {personal.content.portfolio}</span>}
            {personal.content.website && <span>🔗 {personal.content.website}</span>}
          </div>
        </div>
      )}

      {/* Two Column Layout */}
      <div style={{ display: "flex", flex: 1, padding: "24px 0 0 0" }}>
        {/* Left Column - Main */}
        <div style={{ flex: 1, padding: "0 24px 0 40px", boxSizing: "border-box" }}>
          {leftSections.map((section) => (
            <div key={section.id} style={{ marginBottom: "18px" }}>
              <h2 style={sectionHeaderStyle}>{section.type}</h2>

              {section.type === "summary" && (
                <p style={{ fontSize: "10.5px", lineHeight: 1.7, color: "#444", margin: 0 }}>
                  {section.content.text}
                </p>
              )}

              {section.type === "experience" && (
                <div>
                  {section.content.items.map((item: any) => (
                    <div key={item.id} style={{ marginBottom: "12px" }}>
                      <div style={{ fontSize: "12px", fontWeight: 700, color: "#1a1a1a" }}>{item.title}</div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                        <span style={{ fontSize: "10.5px", color }}>{item.company}{item.location ? ` · ${item.location}` : ""}</span>
                        <span style={{ fontSize: "9.5px", color: "#888" }}>
                          {item.startDate}{item.endDate || item.current ? ` – ${item.current ? "Present" : item.endDate}` : ""}
                        </span>
                      </div>
                      {item.bullets && item.bullets.length > 0 && (
                        <ul style={{ margin: "4px 0 0 0", paddingLeft: "14px" }}>
                          {item.bullets.map((b: string, i: number) => (
                            <li key={i} style={{ fontSize: "10px", lineHeight: 1.6, color: "#444", marginBottom: "2px" }}>{b}</li>
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
                    <div key={item.id} style={{ marginBottom: "10px" }}>
                      <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
                        <span style={{ fontSize: "11.5px", fontWeight: 700, color: "#1a1a1a" }}>{item.name}</span>
                        {item.link && <span style={{ fontSize: "9px", color }}>{item.link}</span>}
                      </div>
                      {item.description && (
                        <p style={{ fontSize: "10px", color: "#444", margin: "2px 0 0 0", lineHeight: 1.5 }}>{item.description}</p>
                      )}
                      {item.technologies && (
                        <p style={{ fontSize: "9.5px", color: "#888", margin: "2px 0 0 0", fontStyle: "italic" }}>{item.technologies}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Right Column - Sidebar */}
        <div
          style={{
            width: "240px",
            minWidth: "240px",
            padding: "0 40px 0 24px",
            boxSizing: "border-box",
            borderLeft: `1px solid ${color}20`,
          }}
        >
          {rightSections.map((section) => (
            <div key={section.id} style={{ marginBottom: "18px" }}>
              <h2 style={rightHeaderStyle}>{section.type}</h2>

              {section.type === "skills" && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                  {section.content.items.map((skill: string, i: number) => (
                    <span
                      key={i}
                      style={{
                        fontSize: "9px",
                        padding: "3px 10px",
                        borderRadius: "12px",
                        backgroundColor: `${color}15`,
                        color,
                        fontWeight: 500,
                      }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}

              {section.type === "education" && (
                <div>
                  {section.content.items.map((item: any) => (
                    <div key={item.id} style={{ marginBottom: "8px" }}>
                      <div style={{ fontSize: "11px", fontWeight: 600, color: "#222" }}>{item.degree}</div>
                      <div style={{ fontSize: "10px", color: "#666" }}>{item.school}</div>
                      <div style={{ fontSize: "9px", color: "#999" }}>
                        {item.startDate}{item.endDate ? ` – ${item.endDate}` : ""}
                      </div>
                      {item.gpa && <div style={{ fontSize: "9px", color: "#888" }}>GPA: {item.gpa}</div>}
                    </div>
                  ))}
                </div>
              )}

              {section.type === "certifications" && (
                <div>
                  {section.content.items.map((item: any) => (
                    <div key={item.id} style={{ marginBottom: "6px" }}>
                      <div style={{ fontSize: "10px", fontWeight: 600, color: "#222" }}>{item.name}</div>
                      <div style={{ fontSize: "9px", color: "#888" }}>
                        {item.issuer}{item.date ? ` · ${item.date}` : ""}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {section.type === "languages" && (
                <div>
                  {section.content.items.map((item: any) => (
                    <div key={item.id} style={{ marginBottom: "4px", display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: "10px", fontWeight: 500, color: "#333" }}>{item.language}</span>
                      {item.proficiency && (
                        <span style={{ fontSize: "9px", color: "#888" }}>{item.proficiency}</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
