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

export default function MetroTemplate({ sections, color }: TemplateProps) {
  const sorted = [...sections].sort((a, b) => a.order - b.order);
  const personal = getSectionByType(sections, "personal");

  const tileHeaderStyle: React.CSSProperties = {
    fontSize: "11px",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "2px",
    color: "white",
    margin: "0 0 10px 0",
    padding: "6px 14px",
    backgroundColor: color,
    display: "inline-block",
  };

  return (
    <div
      style={{
        width: "794px",
        height: "1123px",
        boxSizing: "border-box",
        overflow: "hidden",
        fontFamily: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
        backgroundColor: "#fafafa",
        color: "#333",
      }}
    >
      {/* Header */}
      {personal && hasContent(personal) && (
        <div
          style={{
            backgroundColor: color,
            padding: "28px 44px",
            color: "white",
          }}
        >
          <h1
            style={{
              fontSize: "30px",
              fontWeight: 300,
              margin: 0,
              letterSpacing: "1px",
            }}
          >
            {personal.content.fullName}
          </h1>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
              marginTop: "10px",
            }}
          >
            {personal.content.email && (
              <span
                style={{
                  fontSize: "9.5px",
                  padding: "3px 10px",
                  backgroundColor: "rgba(255,255,255,0.2)",
                  borderRadius: "2px",
                  fontWeight: 500,
                }}
              >
                {personal.content.email}
              </span>
            )}
            {personal.content.phone && (
              <span
                style={{
                  fontSize: "9.5px",
                  padding: "3px 10px",
                  backgroundColor: "rgba(255,255,255,0.2)",
                  borderRadius: "2px",
                  fontWeight: 500,
                }}
              >
                {personal.content.phone}
              </span>
            )}
            {personal.content.location && (
              <span
                style={{
                  fontSize: "9.5px",
                  padding: "3px 10px",
                  backgroundColor: "rgba(255,255,255,0.2)",
                  borderRadius: "2px",
                  fontWeight: 500,
                }}
              >
                {personal.content.location}
              </span>
            )}
            {personal.content.linkedin && (
              <span
                style={{
                  fontSize: "9.5px",
                  padding: "3px 10px",
                  backgroundColor: "rgba(255,255,255,0.2)",
                  borderRadius: "2px",
                  fontWeight: 500,
                }}
              >
                {personal.content.linkedin}
              </span>
            )}
            {personal.content.website && (
              <span
                style={{
                  fontSize: "9.5px",
                  padding: "3px 10px",
                  backgroundColor: "rgba(255,255,255,0.2)",
                  borderRadius: "2px",
                  fontWeight: 500,
                }}
              >
                {personal.content.website}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Body */}
      <div style={{ padding: "24px 44px" }}>
        {sorted.map((section) => {
          if (section.type === "personal" || !hasContent(section)) return null;

          return (
            <div key={section.id} style={{ marginBottom: "18px" }}>
              <div>
                <span style={tileHeaderStyle}>{section.type}</span>
              </div>

              {section.type === "summary" && (
                <p style={{ fontSize: "10.5px", lineHeight: 1.7, color: "#444", margin: 0 }}>
                  {section.content.text}
                </p>
              )}

              {section.type === "experience" && (
                <div>
                  {section.content.items.map((item: any, i: number) => (
                    <div
                      key={i}
                      style={{
                        marginBottom: "12px",
                        padding: "10px 14px",
                        backgroundColor: "white",
                        border: "1px solid #e8e8e8",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                        <span style={{ fontSize: "12px", fontWeight: 700, color: "#1a1a1a" }}>{item.title}</span>
                        <span
                          style={{
                            fontSize: "9px",
                            color: "white",
                            backgroundColor: color,
                            padding: "2px 8px",
                            whiteSpace: "nowrap",
                            fontWeight: 500,
                          }}
                        >
                          {item.startDate}
                          {item.endDate || item.current
                            ? ` – ${item.current ? "Present" : item.endDate}`
                            : ""}
                        </span>
                      </div>
                      <div style={{ fontSize: "10.5px", color: "#666", marginTop: "2px" }}>
                        {item.company}
                        {item.location && <span> · {item.location}</span>}
                      </div>
                      {item.bullets && item.bullets.length > 0 && (
                        <ul style={{ margin: "4px 0 0 0", paddingLeft: "14px", listStyleType: "square" }}>
                          {item.bullets.map((b: string, j: number) => (
                            <li
                              key={j}
                              style={{ fontSize: "10px", lineHeight: 1.5, color: "#444", marginBottom: "1px" }}
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
                <div>
                  {section.content.items.map((item: any, i: number) => (
                    <div
                      key={i}
                      style={{
                        marginBottom: "8px",
                        padding: "8px 14px",
                        backgroundColor: "white",
                        border: "1px solid #e8e8e8",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                        <span style={{ fontSize: "12px", fontWeight: 700, color: "#1a1a1a" }}>{item.degree}</span>
                        <span style={{ fontSize: "9.5px", color: "#888" }}>
                          {item.startDate}
                          {item.endDate ? ` – ${item.endDate}` : ""}
                        </span>
                      </div>
                      <div style={{ fontSize: "10.5px", color: "#555", marginTop: "1px" }}>
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
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {section.content.items.map((skill: string, i: number) => (
                    <span
                      key={i}
                      style={{
                        fontSize: "9.5px",
                        padding: "5px 12px",
                        backgroundColor: `${color}18`,
                        color: color,
                        fontWeight: 600,
                        border: `1px solid ${color}35`,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <span
                        style={{
                          width: "6px",
                          height: "6px",
                          backgroundColor: color,
                          display: "inline-block",
                        }}
                      />
                      {skill}
                    </span>
                  ))}
                </div>
              )}

              {section.type === "projects" && (
                <div>
                  {section.content.items.map((item: any, i: number) => (
                    <div
                      key={i}
                      style={{
                        marginBottom: "10px",
                        padding: "8px 14px",
                        backgroundColor: "white",
                        border: "1px solid #e8e8e8",
                      }}
                    >
                      <div style={{ fontSize: "12px", fontWeight: 700, color: "#1a1a1a" }}>
                        {item.name}
                        {item.link && (
                          <span style={{ fontSize: "9px", color, marginLeft: "8px", fontWeight: 400 }}>
                            {item.link}
                          </span>
                        )}
                      </div>
                      {item.description && (
                        <div style={{ fontSize: "10px", color: "#555", marginTop: "3px", lineHeight: 1.5 }}>
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
                        alignItems: "center",
                        marginBottom: "5px",
                        padding: "6px 14px",
                        backgroundColor: "white",
                        border: "1px solid #e8e8e8",
                      }}
                    >
                      <div>
                        <span style={{ fontSize: "11px", fontWeight: 600, color: "#222" }}>{item.name}</span>
                        {item.issuer && (
                          <span style={{ fontSize: "10px", color: "#666" }}> — {item.issuer}</span>
                        )}
                      </div>
                      {item.date && (
                        <span
                          style={{
                            fontSize: "9px",
                            color: "white",
                            backgroundColor: color,
                            padding: "2px 8px",
                            fontWeight: 500,
                          }}
                        >
                          {item.date}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {section.type === "languages" && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {section.content.items.map((item: any, i: number) => (
                    <div
                      key={i}
                      style={{
                        padding: "6px 14px",
                        backgroundColor: "white",
                        border: `2px solid ${color}`,
                        textAlign: "center",
                      }}
                    >
                      <div style={{ fontSize: "11px", fontWeight: 700, color: "#1a1a1a" }}>{item.language}</div>
                      {item.proficiency && (
                        <div style={{ fontSize: "9px", color: "#777", marginTop: "1px" }}>{item.proficiency}</div>
                      )}
                    </div>
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
