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

export default function BoldTemplate({ sections, color }: TemplateProps) {
  const sorted = [...sections].sort((a, b) => a.order - b.order);
  const personal = getSectionByType(sections, "personal");

  const sectionLabel: Record<string, string> = {
    summary: "SUMMARY",
    experience: "EXPERIENCE",
    education: "EDUCATION",
    skills: "SKILLS",
    projects: "PROJECTS",
    certifications: "CERTIFICATIONS",
    languages: "LANGUAGES",
  };

  return (
    <div
      style={{
        width: "794px",
        height: "1123px",
        boxSizing: "border-box",
        overflow: "hidden",
        fontFamily: "'Helvetica Neue', Arial, sans-serif",
        color: "#222",
        backgroundColor: "#fff",
        padding: "0",
      }}
    >
      {personal && hasContent(personal) && (
        <div
          style={{
            backgroundColor: color,
            padding: "32px 48px 28px",
            color: "#fff",
          }}
        >
          <h1
            style={{
              fontSize: "38px",
              fontWeight: 900,
              margin: 0,
              lineHeight: 1.1,
              letterSpacing: "-0.5px",
              textTransform: "uppercase",
            }}
          >
            {personal.content.fullName}
          </h1>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "16px",
              marginTop: "10px",
              fontSize: "11px",
              color: "rgba(255,255,255,0.85)",
            }}
          >
            {personal.content.email && <span>{personal.content.email}</span>}
            {personal.content.phone && <span>{personal.content.phone}</span>}
            {personal.content.location && (
              <span>{personal.content.location}</span>
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
        </div>
      )}

      <div style={{ padding: "24px 48px 32px" }}>
        {sorted.map((section) => {
          if (section.type === "personal" || !hasContent(section)) return null;

          return (
            <div key={section.id} style={{ marginBottom: "16px" }}>
              <div
                style={{
                  backgroundColor: color,
                  padding: "5px 14px",
                  marginBottom: "10px",
                  marginLeft: "-14px",
                  marginRight: "-14px",
                }}
              >
                <h2
                  style={{
                    fontSize: "12px",
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: "3px",
                    color: "#fff",
                    margin: 0,
                  }}
                >
                  {sectionLabel[section.type] || section.type.toUpperCase()}
                </h2>
              </div>

              {section.type === "summary" && (
                <p
                  style={{
                    fontSize: "11px",
                    lineHeight: 1.7,
                    color: "#444",
                    margin: 0,
                  }}
                >
                  {section.content.text}
                </p>
              )}

              {section.type === "experience" &&
                section.content.items.map((item: any) => (
                  <div key={item.id} style={{ marginBottom: "12px" }}>
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
                            fontSize: "13px",
                            fontWeight: 800,
                            color: "#111",
                            textTransform: "uppercase",
                          }}
                        >
                          {item.title}
                        </span>
                        {item.company && (
                          <span
                            style={{
                              fontSize: "11.5px",
                              color: color,
                              fontWeight: 700,
                            }}
                          >
                            {" "}
                            | {item.company}
                          </span>
                        )}
                      </div>
                      <span
                        style={{
                          fontSize: "10px",
                          color: "#777",
                          whiteSpace: "nowrap",
                          marginLeft: "8px",
                          fontWeight: 600,
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
                          fontWeight: 600,
                        }}
                      >
                        {item.location}
                      </p>
                    )}
                    {item.bullets && item.bullets.length > 0 && (
                      <ul
                        style={{
                          margin: "5px 0 0 0",
                          paddingLeft: "0",
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
                              marginBottom: "3px",
                              paddingLeft: "16px",
                              position: "relative",
                            }}
                          >
                            <span
                              style={{
                                position: "absolute",
                                left: 0,
                                top: "2px",
                                display: "inline-block",
                                width: "7px",
                                height: "7px",
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
                  <div key={item.id} style={{ marginBottom: "10px" }}>
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
                            fontWeight: 800,
                            color: "#111",
                          }}
                        >
                          {item.degree}
                        </span>
                        {item.school && (
                          <span
                            style={{
                              fontSize: "11px",
                              color: color,
                              fontWeight: 700,
                            }}
                          >
                            {" "}
                            | {item.school}
                          </span>
                        )}
                      </div>
                      <span
                        style={{
                          fontSize: "10px",
                          color: "#777",
                          whiteSpace: "nowrap",
                          marginLeft: "8px",
                          fontWeight: 600,
                        }}
                      >
                        {item.startDate}
                        {item.endDate ? ` – ${item.endDate}` : ""}
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
                    {item.gpa && (
                      <p
                        style={{
                          fontSize: "10.5px",
                          color: "#555",
                          margin: "2px 0 0 0",
                          fontWeight: 700,
                        }}
                      >
                        GPA: {item.gpa}
                      </p>
                    )}
                  </div>
                ))}

              {section.type === "skills" && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {section.content.items.map((skill: string, i: number) => (
                    <span
                      key={i}
                      style={{
                        fontSize: "10px",
                        padding: "4px 12px",
                        backgroundColor: color,
                        color: "#fff",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}

              {section.type === "projects" &&
                section.content.items.map((item: any) => (
                  <div key={item.id} style={{ marginBottom: "10px" }}>
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
                          fontWeight: 800,
                          color: "#111",
                          textTransform: "uppercase",
                        }}
                      >
                        {item.name}
                      </span>
                      {item.link && (
                        <span style={{ fontSize: "10px", color, fontWeight: 600 }}>
                          {item.link}
                        </span>
                      )}
                    </div>
                    {item.description && (
                      <p
                        style={{
                          fontSize: "10.5px",
                          color: "#444",
                          margin: "3px 0 0 0",
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
                          margin: "2px 0 0 0",
                          fontWeight: 700,
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
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <div>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 800,
                          color: "#111",
                        }}
                      >
                        {item.name}
                      </span>
                      {item.issuer && (
                        <span style={{ fontSize: "10.5px", color: "#555" }}>
                          {" "}
                          — {item.issuer}
                        </span>
                      )}
                    </div>
                    {item.date && (
                      <span
                        style={{
                          fontSize: "10px",
                          color: "#777",
                          fontWeight: 600,
                        }}
                      >
                        {item.date}
                      </span>
                    )}
                  </div>
                ))}

              {section.type === "languages" && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                  {section.content.items.map((item: any, i: number) => (
                    <div
                      key={i}
                      style={{
                        padding: "4px 14px",
                        backgroundColor: `${color}15`,
                        border: `2px solid ${color}`,
                      }}
                    >
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 800,
                          color: "#111",
                        }}
                      >
                        {item.language}
                      </span>
                      {item.proficiency && (
                        <span
                          style={{
                            fontSize: "10px",
                            color: "#666",
                            marginLeft: "6px",
                          }}
                        >
                          {item.proficiency}
                        </span>
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
