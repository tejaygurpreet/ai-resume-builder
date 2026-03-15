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

export default function ClassicTemplate({ sections, color }: TemplateProps) {
  const sorted = [...sections].sort((a, b) => a.order - b.order);
  const personal = getSectionByType(sections, "personal");

  const sectionLabel: Record<string, string> = {
    summary: "Professional Summary",
    experience: "Work Experience",
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
        fontFamily: "'Times New Roman', 'Georgia', serif",
        color: "#222",
        backgroundColor: "#fff",
        padding: "48px 56px",
      }}
    >
      {personal && hasContent(personal) && (
        <div
          style={{
            textAlign: "center",
            marginBottom: "16px",
            paddingBottom: "14px",
            borderBottom: `2px solid ${color}`,
          }}
        >
          <h1
            style={{
              fontSize: "26px",
              fontWeight: 700,
              color: "#111",
              margin: 0,
              letterSpacing: "1px",
            }}
          >
            {personal.content.fullName}
          </h1>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              flexWrap: "wrap",
              gap: "4px",
              marginTop: "6px",
              fontSize: "10.5px",
              color: "#555",
            }}
          >
            {[
              personal.content.email,
              personal.content.phone,
              personal.content.location,
              personal.content.linkedin,
              personal.content.website,
            ]
              .filter(Boolean)
              .map((info, i, arr) => (
                <span key={i}>
                  {info}
                  {i < arr.length - 1 && (
                    <span style={{ margin: "0 6px", color: "#bbb" }}>|</span>
                  )}
                </span>
              ))}
          </div>
        </div>
      )}

      {sorted.map((section) => {
        if (section.type === "personal" || !hasContent(section)) return null;

        return (
          <div key={section.id} style={{ marginBottom: "14px" }}>
            <h2
              style={{
                fontSize: "13px",
                fontWeight: 700,
                color: color,
                margin: "0 0 4px 0",
                paddingBottom: "3px",
                borderBottom: "1px solid #ccc",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              {sectionLabel[section.type] || section.type}
            </h2>

            {section.type === "summary" && (
              <p
                style={{
                  fontSize: "11px",
                  lineHeight: 1.7,
                  color: "#333",
                  margin: "4px 0 0 0",
                }}
              >
                {section.content.text}
              </p>
            )}

            {section.type === "experience" &&
              section.content.items.map((item: any) => (
                <div key={item.id} style={{ marginBottom: "10px", marginTop: "4px" }}>
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
                        <span style={{ fontSize: "11px", color: "#444" }}>
                          , {item.company}
                        </span>
                      )}
                      {item.location && (
                        <span style={{ fontSize: "11px", color: "#777" }}>
                          {" "}
                          — {item.location}
                        </span>
                      )}
                    </div>
                    <span
                      style={{
                        fontSize: "10px",
                        color: "#777",
                        whiteSpace: "nowrap",
                        marginLeft: "12px",
                      }}
                    >
                      {item.startDate}
                      {item.endDate || item.current
                        ? ` – ${item.current ? "Present" : item.endDate}`
                        : ""}
                    </span>
                  </div>
                  {item.bullets && item.bullets.length > 0 && (
                    <ul
                      style={{
                        margin: "3px 0 0 0",
                        paddingLeft: "18px",
                        listStyleType: "disc",
                      }}
                    >
                      {item.bullets.map((b: string, i: number) => (
                        <li
                          key={i}
                          style={{
                            fontSize: "10.5px",
                            lineHeight: 1.6,
                            color: "#333",
                            marginBottom: "1px",
                          }}
                        >
                          {b}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}

            {section.type === "education" &&
              section.content.items.map((item: any) => (
                <div key={item.id} style={{ marginBottom: "8px", marginTop: "4px" }}>
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
                        <span style={{ fontSize: "11px", color: "#444" }}>
                          , {item.school}
                        </span>
                      )}
                      {item.location && (
                        <span style={{ fontSize: "11px", color: "#777" }}>
                          {" "}
                          — {item.location}
                        </span>
                      )}
                    </div>
                    <span
                      style={{
                        fontSize: "10px",
                        color: "#777",
                        whiteSpace: "nowrap",
                        marginLeft: "12px",
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
                        color: "#555",
                        margin: "2px 0 0 0",
                      }}
                    >
                      GPA: {item.gpa}
                    </p>
                  )}
                </div>
              ))}

            {section.type === "skills" && (
              <p
                style={{
                  fontSize: "10.5px",
                  lineHeight: 1.7,
                  color: "#333",
                  margin: "4px 0 0 0",
                }}
              >
                {section.content.items.join("  ·  ")}
              </p>
            )}

            {section.type === "projects" &&
              section.content.items.map((item: any) => (
                <div key={item.id} style={{ marginBottom: "8px", marginTop: "4px" }}>
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
                      <span style={{ fontSize: "10px", color: "#777" }}>
                        {item.link}
                      </span>
                    )}
                  </div>
                  {item.description && (
                    <p
                      style={{
                        fontSize: "10.5px",
                        color: "#333",
                        margin: "2px 0 0 0",
                        lineHeight: 1.6,
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
                        fontStyle: "italic",
                      }}
                    >
                      Technologies: {item.technologies}
                    </p>
                  )}
                </div>
              ))}

            {section.type === "certifications" &&
              section.content.items.map((item: any) => (
                <div
                  key={item.id}
                  style={{
                    marginBottom: "4px",
                    marginTop: "4px",
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
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
                    <span style={{ fontSize: "10px", color: "#777" }}>
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
                  gap: "16px",
                  marginTop: "4px",
                }}
              >
                {section.content.items.map((item: any, i: number) => (
                  <span key={i} style={{ fontSize: "11px", color: "#333" }}>
                    <span style={{ fontWeight: 700 }}>{item.language}</span>
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
