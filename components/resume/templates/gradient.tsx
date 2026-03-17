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

function lighten(hex: string, amount: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, ((num >> 16) & 0xff) + Math.round(255 * amount));
  const g = Math.min(255, ((num >> 8) & 0xff) + Math.round(255 * amount));
  const b = Math.min(255, (num & 0xff) + Math.round(255 * amount));
  return `rgb(${r}, ${g}, ${b})`;
}

export default function GradientTemplate({ sections, color }: TemplateProps) {
  const sorted = [...sections].sort((a, b) => a.order - b.order);
  const personal = getSectionByType(sections, "personal");
  const lightColor = lighten(color, 0.35);

  const sectionLabel: Record<string, string> = {
    summary: "Summary",
    experience: "Experience",
    education: "Education",
    skills: "Skills",
    projects: "Projects",
    certifications: "Certifications",
    languages: "Languages",
  };

  return (
    <div
      style={{
        width: "794px",
        height: "1123px",
        boxSizing: "border-box",
        overflow: "hidden",
        fontFamily: "'Helvetica Neue', 'Segoe UI', Arial, sans-serif",
        color: "#333",
        backgroundColor: "#fff",
      }}
    >
      {personal && hasContent(personal) && (
        <div
          style={{
            background: `linear-gradient(135deg, ${color}, ${lightColor})`,
            padding: "36px 48px 28px",
            color: "#fff",
          }}
        >
          <h1
            style={{
              fontSize: "30px",
              fontWeight: 700,
              margin: 0,
              lineHeight: 1.2,
              letterSpacing: "-0.3px",
            }}
          >
            {getFullName(personal.content)}
          </h1>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "14px",
              marginTop: "10px",
              fontSize: "11px",
              color: "rgba(255,255,255,0.9)",
            }}
          >
            {personal.content.email && <span>{personal.content.email}</span>}
            {personal.content.phone && (
              <>
                <span style={{ opacity: 0.5 }}>|</span>
                <span>{personal.content.phone}</span>
              </>
            )}
            {personal.content.location && (
              <>
                <span style={{ opacity: 0.5 }}>|</span>
                <span>{personal.content.location}</span>
              </>
            )}
            {personal.content.linkedin && (
              <>
                <span style={{ opacity: 0.5 }}>|</span>
                <span>{personal.content.linkedin}</span>
              </>
            )}
            {personal.content.github && (
              <>
                <span style={{ opacity: 0.5 }}>|</span>
                <span>{personal.content.github}</span>
              </>
            )}
            {personal.content.portfolio && (
              <>
                <span style={{ opacity: 0.5 }}>|</span>
                <span>{personal.content.portfolio}</span>
              </>
            )}
            {personal.content.website && (
              <>
                <span style={{ opacity: 0.5 }}>|</span>
                <span>{personal.content.website}</span>
              </>
            )}
          </div>
        </div>
      )}

      <div style={{ padding: "24px 48px 32px" }}>
        {sorted.map((section) => {
          if (section.type === "personal" || !hasContent(section)) return null;

          return (
            <div key={section.id} style={{ marginBottom: "16px" }}>
              <h2
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "1.5px",
                  color: "#333",
                  margin: "0 0 8px 0",
                  paddingLeft: "12px",
                  borderLeft: `4px solid transparent`,
                  borderImage: `linear-gradient(to bottom, ${color}, ${lightColor}) 1`,
                  lineHeight: 1.4,
                }}
              >
                {sectionLabel[section.type] || section.type}
              </h2>

              {section.type === "summary" && (
                <p
                  style={{
                    fontSize: "10.5px",
                    lineHeight: 1.7,
                    color: "#444",
                    margin: 0,
                    paddingLeft: "16px",
                  }}
                >
                  {section.content.text}
                </p>
              )}

              {section.type === "experience" &&
                section.content.items.map((item: any) => (
                  <div
                    key={item.id}
                    style={{ marginBottom: "12px", paddingLeft: "16px" }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "baseline",
                      }}
                    >
                      <div>
                        <span
                          style={{
                            fontSize: "12px",
                            fontWeight: 700,
                            color: "#111",
                          }}
                        >
                          {item.title}
                        </span>
                        {item.company && (
                          <span style={{ fontSize: "11px", color }}>
                            {" "}
                            at {item.company}
                          </span>
                        )}
                      </div>
                      <span
                        style={{
                          fontSize: "10px",
                          color: "#888",
                          whiteSpace: "nowrap",
                          marginLeft: "8px",
                        }}
                      >
                        {item.startDate}
                        {item.endDate || item.current
                          ? ` – ${item.current ? "Present" : item.endDate}`
                          : ""}
                      </span>
                    </div>
                    {item.location && (
                      <p
                        style={{
                          fontSize: "10px",
                          color: "#888",
                          margin: "1px 0 0 0",
                        }}
                      >
                        {item.location}
                      </p>
                    )}
                    {item.bullets && item.bullets.length > 0 && (
                      <ul
                        style={{
                          margin: "4px 0 0 0",
                          paddingLeft: "16px",
                          listStyleType: "none",
                        }}
                      >
                        {item.bullets.map((b: string, i: number) => (
                          <li
                            key={i}
                            style={{
                              fontSize: "10.5px",
                              lineHeight: 1.55,
                              color: "#444",
                              marginBottom: "2px",
                              position: "relative",
                              paddingLeft: "10px",
                            }}
                          >
                            <span
                              style={{
                                position: "absolute",
                                left: 0,
                                top: "5px",
                                width: "4px",
                                height: "4px",
                                borderRadius: "50%",
                                backgroundColor: color,
                              }}
                            />
                            {b}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}

              {section.type === "education" &&
                section.content.items.map((item: any) => (
                  <div
                    key={item.id}
                    style={{ marginBottom: "8px", paddingLeft: "16px" }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "baseline",
                      }}
                    >
                      <div>
                        <span
                          style={{
                            fontSize: "12px",
                            fontWeight: 700,
                            color: "#111",
                          }}
                        >
                          {item.degree}
                        </span>
                        {item.school && (
                          <span style={{ fontSize: "11px", color: "#555" }}>
                            {" "}
                            — {item.school}
                          </span>
                        )}
                        {item.location && (
                          <span style={{ fontSize: "10.5px", color: "#888" }}>
                            , {item.location}
                          </span>
                        )}
                      </div>
                      <span
                        style={{
                          fontSize: "10px",
                          color: "#888",
                          whiteSpace: "nowrap",
                          marginLeft: "8px",
                        }}
                      >
                        {item.startDate}
                        {item.endDate ? ` – ${item.endDate}` : ""}
                      </span>
                    </div>
                    {item.gpa && (
                      <p
                        style={{
                          fontSize: "10.5px",
                          color: "#666",
                          margin: "2px 0 0 0",
                        }}
                      >
                        GPA: {item.gpa}
                      </p>
                    )}
                  </div>
                ))}

              {section.type === "skills" && (
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "6px",
                    paddingLeft: "16px",
                  }}
                >
                  {section.content.items.map((skill: string, i: number) => (
                    <span
                      key={i}
                      style={{
                        fontSize: "10px",
                        padding: "4px 14px",
                        borderRadius: "999px",
                        backgroundColor: `${color}12`,
                        color: color,
                        fontWeight: 600,
                        border: `1px solid ${color}30`,
                      }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}

              {section.type === "projects" &&
                section.content.items.map((item: any) => (
                  <div
                    key={item.id}
                    style={{ marginBottom: "10px", paddingLeft: "16px" }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "baseline",
                        gap: "8px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "12px",
                          fontWeight: 700,
                          color: "#111",
                        }}
                      >
                        {item.name}
                      </span>
                      {item.link && (
                        <span style={{ fontSize: "10px", color }}>
                          {item.link}
                        </span>
                      )}
                    </div>
                    {item.description && (
                      <p
                        style={{
                          fontSize: "10.5px",
                          color: "#444",
                          margin: "2px 0 0 0",
                          lineHeight: 1.55,
                        }}
                      >
                        {item.description}
                      </p>
                    )}
                    {item.technologies && (
                      <p
                        style={{
                          fontSize: "10px",
                          color: "#777",
                          margin: "3px 0 0 0",
                          fontStyle: "italic",
                        }}
                      >
                        {item.technologies}
                      </p>
                    )}
                  </div>
                ))}

              {section.type === "certifications" &&
                section.content.items.map((item: any) => (
                  <div
                    key={item.id}
                    style={{
                      marginBottom: "5px",
                      paddingLeft: "16px",
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <div>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 600,
                          color: "#222",
                        }}
                      >
                        {item.name}
                      </span>
                      {item.issuer && (
                        <span style={{ fontSize: "10.5px", color: "#666" }}>
                          {" "}
                          — {item.issuer}
                        </span>
                      )}
                    </div>
                    {item.date && (
                      <span style={{ fontSize: "10px", color: "#888" }}>
                        {item.date}
                      </span>
                    )}
                  </div>
                ))}

              {section.type === "languages" && (
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "8px",
                    paddingLeft: "16px",
                  }}
                >
                  {section.content.items.map((item: any, i: number) => (
                    <span
                      key={i}
                      style={{
                        fontSize: "10.5px",
                        padding: "3px 14px",
                        borderRadius: "999px",
                        backgroundColor: `${color}10`,
                        border: `1px solid ${color}25`,
                      }}
                    >
                      <span style={{ fontWeight: 600, color: "#333" }}>
                        {item.language}
                      </span>
                      {item.proficiency && (
                        <span style={{ color: "#888", marginLeft: "4px" }}>
                          · {item.proficiency}
                        </span>
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
