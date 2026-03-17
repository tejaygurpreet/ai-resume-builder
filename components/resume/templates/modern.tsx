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

export default function ModernTemplate({ sections, color }: TemplateProps) {
  const sorted = [...sections].sort((a, b) => a.order - b.order);
  const personal = getSectionByType(sections, "personal");

  return (
    <div
      className="resume-template bg-white text-gray-800 font-sans"
      style={{ width: "794px", height: "1123px", padding: "44px 52px", boxSizing: "border-box", overflow: "hidden", WebkitFontSmoothing: "antialiased" }}
    >
      {/* Header */}
      {personal && hasContent(personal) && (
        <div style={{ marginBottom: "24px" }}>
          <h1
            style={{ fontSize: "30px", fontWeight: 700, color, margin: 0, letterSpacing: "-0.5px", lineHeight: 1.2 }}
          >
            {getFullName(personal.content)}
          </h1>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "16px",
              marginTop: "8px",
              fontSize: "11.5px",
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
          <div key={section.id} style={{ marginBottom: "22px" }}>
            <h2
              style={{
                fontSize: "11.5px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "2px",
                color: "#1a1a1a",
                margin: "0 0 10px 0",
                paddingLeft: "12px",
                borderLeft: `3px solid ${color}`,
                lineHeight: 1.4,
              }}
            >
              {section.type}
            </h2>

            {section.type === "summary" && (
              <p style={{ fontSize: "11.5px", lineHeight: 1.7, color: "#444", margin: 0 }}>
                {section.content.text}
              </p>
            )}

            {section.type === "experience" && (
              <div>
                {section.content.items.map((item: any) => (
                  <div key={item.id} style={{ marginBottom: "14px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                      <div>
                        <span style={{ fontSize: "12.5px", fontWeight: 600, color: "#1a1a1a" }}>{item.title}</span>
                        {item.company && (
                          <span style={{ fontSize: "11.5px", color: "#555" }}> | {item.company}</span>
                        )}
                        {item.location && (
                          <span style={{ fontSize: "11.5px", color: "#777" }}> — {item.location}</span>
                        )}
                      </div>
                      <span style={{ fontSize: "10.5px", color: "#777", whiteSpace: "nowrap", marginLeft: "12px" }}>
                        {item.startDate}{item.endDate || item.current ? ` – ${item.current ? "Present" : item.endDate}` : ""}
                      </span>
                    </div>
                    {item.bullets && item.bullets.filter((b: string) => (b ?? "").trim()).length > 0 && (
                      <ul style={{ margin: "10px 0 0 0", paddingLeft: "20px", listStyleType: "disc" }}>
                        {item.bullets.filter((b: string) => (b ?? "").trim()).map((b: string, i: number) => (
                          <li key={i} style={{ fontSize: "11px", lineHeight: 1.65, color: "#444", marginBottom: "5px" }}>
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
                  <div key={item.id} style={{ marginBottom: "8px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                      <div>
                        <span style={{ fontSize: "12.5px", fontWeight: 600, color: "#1a1a1a" }}>{item.degree}{item.field ? ` in ${item.field}` : ""}</span>
                        {item.school && (
                          <span style={{ fontSize: "11.5px", color: "#555" }}> — {item.school}</span>
                        )}
                        {item.location && (
                          <span style={{ fontSize: "11.5px", color: "#777" }}>, {item.location}</span>
                        )}
                      </div>
                      <span style={{ fontSize: "10px", color: "#777", whiteSpace: "nowrap", marginLeft: "12px" }}>
                        {item.startDate}{item.endDate ? ` – ${item.endDate}` : ""}
                      </span>
                    </div>
                    {item.gpa && (
                      <p style={{ fontSize: "11px", color: "#555", margin: "3px 0 0 0" }}>GPA: {item.gpa}</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {section.type === "skills" && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {filterValidSkills(section.content.items).map((skill: string, i: number) => (
                  <span
                    key={i}
                    style={{
                      fontSize: "10.5px",
                      padding: "3px 10px",
                      borderRadius: "999px",
                      backgroundColor: `${color}18`,
                      color: color,
                      border: `1px solid ${color}40`,
                      fontWeight: 500,
                    }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            )}

            {section.type === "projects" && (
              <div>
                {section.content.items.map((item: any) => (
                  <div key={item.id} style={{ marginBottom: "10px" }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                      <span style={{ fontSize: "12px", fontWeight: 600, color: "#222" }}>{item.name}</span>
                      {item.link && (
                        <span style={{ fontSize: "10px", color }}>{item.link}</span>
                      )}
                    </div>
                    {item.description && (
                      <p style={{ fontSize: "10.5px", color: "#444", margin: "2px 0 0 0", lineHeight: 1.5 }}>
                        {item.description}
                      </p>
                    )}
                    {item.technologies && (
                      <p style={{ fontSize: "10px", color: "#666", margin: "2px 0 0 0", fontStyle: "italic" }}>
                        {item.technologies}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {section.type === "certifications" && (
              <div>
                {section.content.items.map((item: any) => (
                  <div key={item.id} style={{ marginBottom: "4px", display: "flex", justifyContent: "space-between" }}>
                    <div>
                      <span style={{ fontSize: "11px", fontWeight: 600, color: "#222" }}>{item.name}</span>
                      {item.issuer && (
                        <span style={{ fontSize: "10.5px", color: "#555" }}> — {item.issuer}</span>
                      )}
                    </div>
                    {item.date && (
                      <span style={{ fontSize: "10px", color: "#777" }}>{item.date}</span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {section.type === "languages" && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
                {section.content.items.map((item: any) => (
                  <span key={item.id} style={{ fontSize: "11px", color: "#444" }}>
                    <span style={{ fontWeight: 600 }}>{item.language}</span>
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
