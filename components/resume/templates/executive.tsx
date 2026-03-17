"use client";

import React from "react";
import { getFullName } from "@/lib/template-utils";

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

export default function ExecutiveTemplate({ sections, color }: TemplateProps) {
  const sorted = [...sections].sort((a, b) => a.order - b.order);
  const personal = getSectionByType(sections, "personal");

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
      {/* Dark Header */}
      {personal && hasContent(personal) && (
        <div
          style={{
            backgroundColor: color,
            padding: "32px 48px 28px",
            color: "#fff",
          }}
        >
          <h1 style={{ fontSize: "28px", fontWeight: 700, margin: 0, letterSpacing: "1px", textTransform: "uppercase" }}>
            {getFullName(personal.content)}
          </h1>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "14px",
              marginTop: "8px",
              fontSize: "10.5px",
              color: "rgba(255,255,255,0.85)",
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

      {/* Body */}
      <div style={{ padding: "28px 48px 40px" }}>
        {sorted.map((section) => {
          if (section.type === "personal" || !hasContent(section)) return null;

          return (
            <div key={section.id} style={{ marginBottom: "18px" }}>
              <h2
                style={{
                  fontSize: "13px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "1.5px",
                  color: color,
                  margin: "0 0 8px 0",
                  paddingBottom: "4px",
                  borderBottom: `2px solid ${color}`,
                }}
              >
                {section.type}
              </h2>

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
                          <span style={{ fontSize: "12px", fontWeight: 700, color: "#1a1a1a" }}>{item.title}</span>
                          {item.company && (
                            <span style={{ fontSize: "11px", color: "#555", fontWeight: 500 }}> | {item.company}</span>
                          )}
                        </div>
                        <span style={{ fontSize: "10px", color: "#777", whiteSpace: "nowrap" }}>
                          {item.startDate}{item.endDate || item.current ? ` – ${item.current ? "Present" : item.endDate}` : ""}
                        </span>
                      </div>
                      {item.location && (
                        <div style={{ fontSize: "10px", color: "#888", marginTop: "1px" }}>{item.location}</div>
                      )}
                      {item.bullets && item.bullets.length > 0 && (
                        <ul style={{ margin: "4px 0 0 0", paddingLeft: "16px" }}>
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
                          <span style={{ fontSize: "12px", fontWeight: 700, color: "#1a1a1a" }}>{item.degree}</span>
                          {item.school && <span style={{ fontSize: "11px", color: "#555" }}> — {item.school}</span>}
                        </div>
                        <span style={{ fontSize: "10px", color: "#777" }}>
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
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {section.content.items.map((skill: string, i: number) => (
                    <span
                      key={i}
                      style={{
                        fontSize: "10px",
                        padding: "3px 12px",
                        backgroundColor: `${color}12`,
                        border: `1px solid ${color}30`,
                        borderRadius: "2px",
                        color: "#444",
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
                        <span style={{ fontSize: "12px", fontWeight: 700, color: "#1a1a1a" }}>{item.name}</span>
                        {item.link && <span style={{ fontSize: "10px", color }}>{item.link}</span>}
                      </div>
                      {item.description && (
                        <p style={{ fontSize: "10.5px", color: "#444", margin: "2px 0 0 0", lineHeight: 1.5 }}>{item.description}</p>
                      )}
                      {item.technologies && (
                        <p style={{ fontSize: "10px", color: "#777", margin: "2px 0 0 0", fontStyle: "italic" }}>{item.technologies}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {section.type === "certifications" && (
                <div>
                  {section.content.items.map((item: any) => (
                    <div key={item.id} style={{ marginBottom: "5px", display: "flex", justifyContent: "space-between" }}>
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
                      <strong>{item.language}</strong>
                      {item.proficiency && <span style={{ color: "#777" }}> ({item.proficiency})</span>}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
