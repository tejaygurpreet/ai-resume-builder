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

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function proficiencyToPercent(prof: string): number {
  const map: Record<string, number> = {
    native: 100,
    fluent: 90,
    advanced: 80,
    "upper intermediate": 70,
    intermediate: 60,
    "lower intermediate": 45,
    elementary: 30,
    beginner: 20,
    basic: 20,
  };
  return map[prof?.toLowerCase()] || 50;
}

function skillToPercent(skill: string, index: number): number {
  const hash = skill.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return 55 + ((hash + index * 7) % 46);
}

export default function InfographicTemplate({ sections, color }: TemplateProps) {
  const sorted = [...sections].sort((a, b) => a.order - b.order);
  const personal = getSectionByType(sections, "personal");

  const sectionHeaderStyle: React.CSSProperties = {
    fontSize: "11px",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "2.5px",
    color: "#1a1a1a",
    margin: "0 0 10px 0",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  };

  const dotStyle: React.CSSProperties = {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    backgroundColor: color,
    flexShrink: 0,
  };

  return (
    <div
      style={{
        width: "794px",
        height: "1123px",
        boxSizing: "border-box",
        overflow: "hidden",
        fontFamily: "'Segoe UI', Roboto, sans-serif",
        backgroundColor: "white",
        color: "#333",
        display: "flex",
      }}
    >
      {/* Left Sidebar */}
      <div
        style={{
          width: "270px",
          backgroundColor: "#1a1a2e",
          color: "white",
          padding: "0",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Avatar and Name */}
        {personal && hasContent(personal) && (
          <div style={{ textAlign: "center", padding: "32px 24px 20px" }}>
            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                backgroundColor: color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 12px",
                fontSize: "28px",
                fontWeight: 800,
                color: "white",
                letterSpacing: "1px",
              }}
            >
              {getInitials(getFullName(personal.content))}
            </div>
            <h1 style={{ fontSize: "20px", fontWeight: 700, margin: "0 0 4px", letterSpacing: "0.5px" }}>
              {getFullName(personal.content)}
            </h1>
          </div>
        )}

        {/* Contact Info */}
        {personal && hasContent(personal) && (
          <div style={{ padding: "0 24px 20px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
            {personal.content.email && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px", fontSize: "10px" }}>
                <span style={{ color, fontSize: "13px" }}>✉</span>
                <span style={{ color: "rgba(255,255,255,0.85)" }}>{personal.content.email}</span>
              </div>
            )}
            {personal.content.phone && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px", fontSize: "10px" }}>
                <span style={{ color, fontSize: "13px" }}>☎</span>
                <span style={{ color: "rgba(255,255,255,0.85)" }}>{personal.content.phone}</span>
              </div>
            )}
            {personal.content.location && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px", fontSize: "10px" }}>
                <span style={{ color, fontSize: "13px" }}>◉</span>
                <span style={{ color: "rgba(255,255,255,0.85)" }}>{personal.content.location}</span>
              </div>
            )}
            {personal.content.linkedin && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px", fontSize: "10px" }}>
                <span style={{ color, fontSize: "13px" }}>▶</span>
                <span style={{ color: "rgba(255,255,255,0.85)" }}>{personal.content.linkedin}</span>
              </div>
            )}
            {personal.content.github && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px", fontSize: "10px" }}>
                <span style={{ color, fontSize: "13px" }}>▶</span>
                <span style={{ color: "rgba(255,255,255,0.85)" }}>{personal.content.github}</span>
              </div>
            )}
            {personal.content.portfolio && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px", fontSize: "10px" }}>
                <span style={{ color, fontSize: "13px" }}>▶</span>
                <span style={{ color: "rgba(255,255,255,0.85)" }}>{personal.content.portfolio}</span>
              </div>
            )}
            {personal.content.website && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px", fontSize: "10px" }}>
                <span style={{ color, fontSize: "13px" }}>◆</span>
                <span style={{ color: "rgba(255,255,255,0.85)" }}>{personal.content.website}</span>
              </div>
            )}
          </div>
        )}

        {/* Sidebar sections: skills, languages */}
        {sorted
          .filter((s) => ["skills", "languages"].includes(s.type) && hasContent(s))
          .map((section) => (
            <div key={section.id} style={{ padding: "16px 24px" }}>
              <h2
                style={{
                  fontSize: "10px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "2px",
                  color: color,
                  margin: "0 0 10px 0",
                }}
              >
                {section.type}
              </h2>

              {section.type === "skills" &&
                section.content.items.map((skill: string, i: number) => {
                  const pct = skillToPercent(skill, i);
                  return (
                    <div key={i} style={{ marginBottom: "7px" }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: "9.5px",
                          marginBottom: "3px",
                          color: "rgba(255,255,255,0.85)",
                        }}
                      >
                        <span>{skill}</span>
                        <span style={{ color: "rgba(255,255,255,0.5)" }}>{pct}%</span>
                      </div>
                      <div style={{ height: "4px", backgroundColor: "rgba(255,255,255,0.15)", borderRadius: "2px" }}>
                        <div
                          style={{
                            width: `${pct}%`,
                            height: "100%",
                            backgroundColor: color,
                            borderRadius: "2px",
                          }}
                        />
                      </div>
                    </div>
                  );
                })}

              {section.type === "languages" &&
                section.content.items.map((item: any, i: number) => {
                  const pct = proficiencyToPercent(item.proficiency);
                  const filled = Math.round(pct / 20);
                  return (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "6px",
                      }}
                    >
                      <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.85)" }}>{item.language}</span>
                      <div style={{ display: "flex", gap: "3px" }}>
                        {Array.from({ length: 5 }).map((_, j) => (
                          <span
                            key={j}
                            style={{
                              width: "8px",
                              height: "8px",
                              borderRadius: "50%",
                              backgroundColor: j < filled ? color : "rgba(255,255,255,0.2)",
                              display: "inline-block",
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
            </div>
          ))}
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: "32px 36px", overflow: "hidden" }}>
        {sorted
          .filter(
            (s) =>
              !["personal", "skills", "languages"].includes(s.type) && hasContent(s)
          )
          .map((section) => (
            <div key={section.id} style={{ marginBottom: "18px" }}>
              <h2 style={sectionHeaderStyle}>
                <span style={dotStyle} />
                {section.type}
              </h2>

              {section.type === "summary" && (
                <p style={{ fontSize: "10.5px", lineHeight: 1.7, color: "#555", margin: 0 }}>
                  {section.content.text}
                </p>
              )}

              {section.type === "experience" && (
                <div>
                  {section.content.items.map((item: any, i: number) => (
                    <div key={i} style={{ marginBottom: "12px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                        <span style={{ fontSize: "12px", fontWeight: 700, color: "#1a1a1a" }}>{item.title}</span>
                        <span style={{ fontSize: "9.5px", color: "#888" }}>
                          {item.startDate}
                          {item.endDate || item.current
                            ? ` – ${item.current ? "Present" : item.endDate}`
                            : ""}
                        </span>
                      </div>
                      <div style={{ fontSize: "10.5px", color, fontWeight: 500 }}>
                        {item.company}
                        {item.location && <span style={{ color: "#888" }}> · {item.location}</span>}
                      </div>
                      {item.bullets && item.bullets.length > 0 && (
                        <ul style={{ margin: "3px 0 0 0", paddingLeft: "14px", listStyleType: "disc" }}>
                          {item.bullets.map((b: string, j: number) => (
                            <li key={j} style={{ fontSize: "10px", lineHeight: 1.5, color: "#555", marginBottom: "1px" }}>
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
                  {section.content.items.map((item: any, i: number) => (
                    <div key={i} style={{ marginBottom: "8px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                        <span style={{ fontSize: "12px", fontWeight: 700, color: "#1a1a1a" }}>{item.degree}</span>
                        <span style={{ fontSize: "9.5px", color: "#888" }}>
                          {item.startDate}
                          {item.endDate ? ` – ${item.endDate}` : ""}
                        </span>
                      </div>
                      <div style={{ fontSize: "10.5px", color: "#555" }}>
                        {item.school}
                        {item.location && ` · ${item.location}`}
                      </div>
                      {item.gpa && (
                        <div style={{ fontSize: "10px", color: "#777", marginTop: "1px" }}>GPA: {item.gpa}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {section.type === "projects" && (
                <div>
                  {section.content.items.map((item: any, i: number) => (
                    <div key={i} style={{ marginBottom: "10px" }}>
                      <div style={{ fontSize: "12px", fontWeight: 700, color: "#1a1a1a" }}>
                        {item.name}
                        {item.link && (
                          <span style={{ fontSize: "9px", color, marginLeft: "6px", fontWeight: 400 }}>
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
                <div>
                  {section.content.items.map((item: any, i: number) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "5px",
                        alignItems: "baseline",
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
            </div>
          ))}
      </div>
    </div>
  );
}
