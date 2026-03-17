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

function darkenColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.max(0, (num >> 16) - amount);
  const g = Math.max(0, ((num >> 8) & 0x00ff) - amount);
  const b = Math.max(0, (num & 0x0000ff) - amount);
  return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, "0")}`;
}

export default function RibbonTemplate({ sections, color }: TemplateProps) {
  const sorted = [...sections].sort((a, b) => a.order - b.order);
  const personal = getSectionByType(sections, "personal");
  const darkColor = darkenColor(color, 40);

  const ribbonStyle: React.CSSProperties = {
    position: "relative",
    backgroundColor: color,
    color: "white",
    padding: "5px 20px 5px 16px",
    fontSize: "11px",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "2px",
    display: "inline-block",
    marginBottom: "10px",
    marginLeft: "-8px",
  };

  const ribbonTailStyle: React.CSSProperties = {
    position: "absolute",
    right: "-12px",
    top: 0,
    width: 0,
    height: 0,
    borderTop: "13px solid transparent",
    borderBottom: "13px solid transparent",
    borderLeft: `12px solid ${color}`,
  };

  const ribbonFoldStyle: React.CSSProperties = {
    position: "absolute",
    left: 0,
    bottom: "-5px",
    width: 0,
    height: 0,
    borderTop: `5px solid ${darkColor}`,
    borderLeft: "8px solid transparent",
  };

  return (
    <div
      style={{
        width: "794px",
        height: "1123px",
        boxSizing: "border-box",
        overflow: "hidden",
        fontFamily: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
        backgroundColor: "white",
        color: "#333",
        padding: "0",
      }}
    >
      {/* Name Ribbon */}
      {personal && hasContent(personal) && (
        <div style={{ padding: "36px 56px 0" }}>
          <div style={{ position: "relative", marginBottom: "8px" }}>
            <div
              style={{
                backgroundColor: color,
                color: "white",
                padding: "14px 32px 14px 24px",
                display: "inline-block",
                position: "relative",
                marginLeft: "-8px",
              }}
            >
              <h1
                style={{
                  fontSize: "26px",
                  fontWeight: 800,
                  margin: 0,
                  letterSpacing: "1px",
                }}
              >
                {getFullName(personal.content)}
              </h1>
              <div
                style={{
                  position: "absolute",
                  right: "-16px",
                  top: 0,
                  width: 0,
                  height: 0,
                  borderTop: "27px solid transparent",
                  borderBottom: "27px solid transparent",
                  borderLeft: `16px solid ${color}`,
                }}
              />
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  bottom: "-6px",
                  width: 0,
                  height: 0,
                  borderTop: `6px solid ${darkColor}`,
                  borderLeft: "8px solid transparent",
                }}
              />
            </div>
          </div>

          {/* Contact Row */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "6px 16px",
              fontSize: "10.5px",
              color: "#555",
              marginTop: "4px",
              paddingLeft: "16px",
            }}
          >
            {personal.content.email && (
              <span>
                <span style={{ color, fontWeight: 600 }}>✉</span> {personal.content.email}
              </span>
            )}
            {personal.content.phone && (
              <span>
                <span style={{ color, fontWeight: 600 }}>☎</span> {personal.content.phone}
              </span>
            )}
            {personal.content.location && (
              <span>
                <span style={{ color, fontWeight: 600 }}>⌂</span> {personal.content.location}
              </span>
            )}
            {personal.content.linkedin && (
              <span>{personal.content.linkedin}</span>
            )}
            {personal.content.github && (
              <span>{personal.content.github}</span>
            )}
            {personal.content.portfolio && (
              <span>{personal.content.portfolio}</span>
            )}
            {personal.content.website && (
              <span>{personal.content.website}</span>
            )}
          </div>

          <div style={{ borderBottom: `1px solid #e5e5e5`, marginTop: "16px" }} />
        </div>
      )}

      {/* Sections */}
      <div style={{ padding: "20px 56px 36px" }}>
        {sorted.map((section) => {
          if (section.type === "personal" || !hasContent(section)) return null;

          return (
            <div key={section.id} style={{ marginBottom: "16px" }}>
              {/* Section Ribbon Header */}
              <div style={{ position: "relative" }}>
                <div style={ribbonStyle}>
                  {section.type}
                  <span style={ribbonTailStyle} />
                  <span style={ribbonFoldStyle} />
                </div>
              </div>

              {section.type === "summary" && (
                <p style={{ fontSize: "10.5px", lineHeight: 1.7, color: "#444", margin: 0, paddingLeft: "8px" }}>
                  {section.content.text}
                </p>
              )}

              {section.type === "experience" && (
                <div style={{ paddingLeft: "8px" }}>
                  {section.content.items.map((item: any, i: number) => (
                    <div key={i} style={{ marginBottom: "12px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                        <span style={{ fontSize: "12px", fontWeight: 700, color: "#1a1a1a" }}>{item.title}</span>
                        <span style={{ fontSize: "9.5px", color: "#888", whiteSpace: "nowrap" }}>
                          {item.startDate}
                          {item.endDate || item.current
                            ? ` – ${item.current ? "Present" : item.endDate}`
                            : ""}
                        </span>
                      </div>
                      <div style={{ fontSize: "10.5px", color: color, fontWeight: 500 }}>
                        {item.company}
                        {item.location && <span style={{ color: "#888" }}> · {item.location}</span>}
                      </div>
                      {item.bullets && item.bullets.length > 0 && (
                        <ul style={{ margin: "3px 0 0 0", paddingLeft: "14px", listStyleType: "disc" }}>
                          {item.bullets.map((b: string, j: number) => (
                            <li
                              key={j}
                              style={{ fontSize: "10px", lineHeight: 1.5, color: "#555", marginBottom: "1px" }}
                            >
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
                <div style={{ paddingLeft: "8px" }}>
                  {section.content.items.map((item: any, i: number) => (
                    <div key={i} style={{ marginBottom: "8px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                        <span style={{ fontSize: "12px", fontWeight: 700, color: "#1a1a1a" }}>{item.degree}</span>
                        <span style={{ fontSize: "9.5px", color: "#888", whiteSpace: "nowrap" }}>
                          {item.startDate}
                          {item.endDate ? ` – ${item.endDate}` : ""}
                        </span>
                      </div>
                      <div style={{ fontSize: "10.5px", color: "#555" }}>
                        {item.school}
                        {item.location && ` · ${item.location}`}
                      </div>
                      {item.gpa && (
                        <div style={{ fontSize: "10px", color: "#777", marginTop: "2px" }}>GPA: {item.gpa}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {section.type === "skills" && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", paddingLeft: "8px" }}>
                  {section.content.items.map((skill: string, i: number) => (
                    <span
                      key={i}
                      style={{
                        fontSize: "9.5px",
                        padding: "3px 11px",
                        borderRadius: "14px",
                        border: `1.5px solid ${color}`,
                        color: color,
                        fontWeight: 500,
                        backgroundColor: "transparent",
                      }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}

              {section.type === "projects" && (
                <div style={{ paddingLeft: "8px" }}>
                  {section.content.items.map((item: any, i: number) => (
                    <div key={i} style={{ marginBottom: "10px" }}>
                      <div style={{ fontSize: "12px", fontWeight: 700, color: "#1a1a1a" }}>
                        {item.name}
                        {item.link && (
                          <span style={{ fontSize: "9px", color, marginLeft: "8px", fontWeight: 400 }}>
                            {item.link}
                          </span>
                        )}
                      </div>
                      {item.description && (
                        <div style={{ fontSize: "10px", color: "#555", marginTop: "2px", lineHeight: 1.5 }}>
                          {item.description}
                        </div>
                      )}
                      {item.technologies && (
                        <div style={{ fontSize: "9.5px", color: "#888", marginTop: "2px", fontStyle: "italic" }}>
                          {item.technologies}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {section.type === "certifications" && (
                <div style={{ paddingLeft: "8px" }}>
                  {section.content.items.map((item: any, i: number) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "baseline",
                        marginBottom: "5px",
                      }}
                    >
                      <div>
                        <span style={{ fontSize: "11px", fontWeight: 600, color: "#222" }}>{item.name}</span>
                        {item.issuer && (
                          <span style={{ fontSize: "10px", color: "#666" }}> — {item.issuer}</span>
                        )}
                      </div>
                      {item.date && <span style={{ fontSize: "9.5px", color: "#888" }}>{item.date}</span>}
                    </div>
                  ))}
                </div>
              )}

              {section.type === "languages" && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", paddingLeft: "8px" }}>
                  {section.content.items.map((item: any, i: number) => (
                    <span key={i} style={{ fontSize: "11px", color: "#444" }}>
                      <span style={{ fontWeight: 600 }}>{item.language}</span>
                      {item.proficiency && (
                        <span style={{ color: "#888" }}> ({item.proficiency})</span>
                      )}
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
