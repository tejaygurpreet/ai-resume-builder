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

export default function ElegantTemplate({ sections, color }: TemplateProps) {
  const sorted = [...sections].sort((a, b) => a.order - b.order);
  const personal = getSectionByType(sections, "personal");

  const sectionLabel: Record<string, string> = {
    summary: "Profile",
    experience: "Professional Experience",
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
        padding: "52px 56px",
        fontFamily: "'Georgia', 'Times New Roman', serif",
        color: "#2d2d2d",
        backgroundColor: "#fff",
      }}
    >
      {personal && hasContent(personal) && (
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <h1
            style={{
              fontSize: "30px",
              fontWeight: 400,
              letterSpacing: "3px",
              color: "#1a1a1a",
              margin: 0,
              textTransform: "uppercase",
            }}
          >
            {personal.content.fullName}
          </h1>
          <div
            style={{
              width: "60px",
              height: "1px",
              backgroundColor: color,
              margin: "12px auto",
            }}
          />
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              flexWrap: "wrap",
              gap: "6px 20px",
              fontSize: "10.5px",
              color: "#666",
              letterSpacing: "0.3px",
            }}
          >
            {personal.content.email && <span>{personal.content.email}</span>}
            {personal.content.phone && (
              <>
                <span style={{ color: color }}>·</span>
                <span>{personal.content.phone}</span>
              </>
            )}
            {personal.content.location && (
              <>
                <span style={{ color: color }}>·</span>
                <span>{personal.content.location}</span>
              </>
            )}
            {personal.content.linkedin && (
              <>
                <span style={{ color: color }}>·</span>
                <span>{personal.content.linkedin}</span>
              </>
            )}
            {personal.content.website && (
              <>
                <span style={{ color: color }}>·</span>
                <span>{personal.content.website}</span>
              </>
            )}
          </div>
        </div>
      )}

      {sorted.map((section) => {
        if (section.type === "personal" || !hasContent(section)) return null;

        return (
          <div key={section.id} style={{ marginBottom: "16px" }}>
            <div
              style={{
                borderTop: `1px solid ${color}50`,
                borderBottom: `1px solid ${color}50`,
                padding: "5px 0",
                marginBottom: "10px",
                textAlign: "center",
              }}
            >
              <h2
                style={{
                  fontSize: "11px",
                  fontWeight: 400,
                  textTransform: "uppercase",
                  letterSpacing: "3px",
                  color: "#444",
                  margin: 0,
                  fontFamily: "'Georgia', 'Times New Roman', serif",
                }}
              >
                {sectionLabel[section.type] || section.type}
              </h2>
            </div>

            {section.type === "summary" && (
              <p
                style={{
                  fontSize: "10.5px",
                  lineHeight: 1.75,
                  color: "#444",
                  margin: 0,
                  textAlign: "center",
                  fontStyle: "italic",
                  padding: "0 20px",
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
                          fontSize: "12px",
                          fontWeight: 700,
                          color: "#1a1a1a",
                          fontFamily: "'Georgia', serif",
                        }}
                      >
                        {item.title}
                      </span>
                      {item.company && (
                        <span
                          style={{
                            fontSize: "11px",
                            color: color,
                            fontStyle: "italic",
                          }}
                        >
                          {" "}
                          — {item.company}
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
                        marginLeft: "12px",
                        fontStyle: "italic",
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
                        margin: "4px 0 0 0",
                        paddingLeft: "18px",
                        listStyleType: "none",
                      }}
                    >
                      {item.bullets.map((b: string, i: number) => (
                        <li
                          key={i}
                          style={{
                            fontSize: "10.5px",
                            lineHeight: 1.6,
                            color: "#444",
                            marginBottom: "2px",
                            position: "relative",
                            paddingLeft: "12px",
                          }}
                        >
                          <span
                            style={{
                              position: "absolute",
                              left: 0,
                              color: color,
                            }}
                          >
                            ◆
                          </span>
                          {b}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}

            {section.type === "education" &&
              section.content.items.map((item: any) => (
                <div key={item.id} style={{ marginBottom: "8px" }}>
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
                          color: "#1a1a1a",
                        }}
                      >
                        {item.degree}
                      </span>
                      {item.school && (
                        <span
                          style={{
                            fontSize: "11px",
                            color: color,
                            fontStyle: "italic",
                          }}
                        >
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
                        marginLeft: "12px",
                        fontStyle: "italic",
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
                        fontStyle: "italic",
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
                  gap: "8px",
                  justifyContent: "center",
                }}
              >
                {section.content.items.map((skill: string, i: number) => (
                  <span
                    key={i}
                    style={{
                      fontSize: "10px",
                      padding: "3px 14px",
                      border: `1px solid ${color}60`,
                      color: "#444",
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
                        fontWeight: 700,
                        color: "#1a1a1a",
                      }}
                    >
                      {item.name}
                    </span>
                    {item.link && (
                      <span style={{ fontSize: "10px", color, fontStyle: "italic" }}>
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
                        color: "#888",
                        margin: "2px 0 0 0",
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
                    marginBottom: "4px",
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        color: "#1a1a1a",
                      }}
                    >
                      {item.name}
                    </span>
                    {item.issuer && (
                      <span
                        style={{
                          fontSize: "10.5px",
                          color: "#666",
                          fontStyle: "italic",
                        }}
                      >
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
                  gap: "16px",
                  justifyContent: "center",
                }}
              >
                {section.content.items.map((item: any, i: number) => (
                  <span key={i} style={{ fontSize: "11px", color: "#444" }}>
                    <span style={{ fontWeight: 700 }}>{item.language}</span>
                    {item.proficiency && (
                      <span style={{ color: "#888", fontStyle: "italic" }}>
                        {" "}
                        ({item.proficiency})
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
  );
}
