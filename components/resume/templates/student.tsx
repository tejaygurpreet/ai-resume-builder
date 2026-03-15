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

const proficiencyWidth: Record<string, string> = {
  Native: "100%",
  Fluent: "90%",
  Advanced: "80%",
  "Upper Intermediate": "70%",
  Intermediate: "60%",
  "Lower Intermediate": "45%",
  Elementary: "30%",
  Beginner: "20%",
  Basic: "20%",
};

function getBarWidth(proficiency?: string): string {
  if (!proficiency) return "50%";
  return proficiencyWidth[proficiency] || "50%";
}

export default function StudentTemplate({ sections, color }: TemplateProps) {
  const sorted = [...sections].sort((a, b) => a.order - b.order);
  const personal = getSectionByType(sections, "personal");

  const priorityOrder = [
    "personal",
    "education",
    "summary",
    "skills",
    "projects",
    "experience",
    "certifications",
    "languages",
  ];

  const studentSorted = [...sorted].sort((a, b) => {
    const ai = priorityOrder.indexOf(a.type);
    const bi = priorityOrder.indexOf(b.type);
    if (ai !== -1 && bi !== -1) return ai - bi;
    if (ai !== -1) return -1;
    if (bi !== -1) return 1;
    return a.order - b.order;
  });

  const sectionLabel: Record<string, string> = {
    summary: "About Me",
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
        padding: "40px 48px",
      }}
    >
      {personal && hasContent(personal) && (
        <div
          style={{
            marginBottom: "22px",
            padding: "20px 24px",
            backgroundColor: `${color}0C`,
            borderRadius: "12px",
            border: `1px solid ${color}25`,
          }}
        >
          <h1
            style={{
              fontSize: "26px",
              fontWeight: 700,
              color: color,
              margin: 0,
              lineHeight: 1.2,
            }}
          >
            {personal.content.fullName}
          </h1>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "12px",
              marginTop: "8px",
              fontSize: "10.5px",
              color: "#555",
            }}
          >
            {personal.content.email && (
              <span
                style={{
                  backgroundColor: "#fff",
                  padding: "2px 10px",
                  borderRadius: "12px",
                  border: "1px solid #e0e0e0",
                }}
              >
                {personal.content.email}
              </span>
            )}
            {personal.content.phone && (
              <span
                style={{
                  backgroundColor: "#fff",
                  padding: "2px 10px",
                  borderRadius: "12px",
                  border: "1px solid #e0e0e0",
                }}
              >
                {personal.content.phone}
              </span>
            )}
            {personal.content.location && (
              <span
                style={{
                  backgroundColor: "#fff",
                  padding: "2px 10px",
                  borderRadius: "12px",
                  border: "1px solid #e0e0e0",
                }}
              >
                {personal.content.location}
              </span>
            )}
            {personal.content.linkedin && (
              <span
                style={{
                  backgroundColor: "#fff",
                  padding: "2px 10px",
                  borderRadius: "12px",
                  border: "1px solid #e0e0e0",
                }}
              >
                {personal.content.linkedin}
              </span>
            )}
            {personal.content.website && (
              <span
                style={{
                  backgroundColor: "#fff",
                  padding: "2px 10px",
                  borderRadius: "12px",
                  border: "1px solid #e0e0e0",
                }}
              >
                {personal.content.website}
              </span>
            )}
          </div>
        </div>
      )}

      {studentSorted.map((section) => {
        if (section.type === "personal" || !hasContent(section)) return null;

        return (
          <div key={section.id} style={{ marginBottom: "16px" }}>
            <h2
              style={{
                fontSize: "13px",
                fontWeight: 700,
                color: color,
                margin: "0 0 8px 0",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  backgroundColor: color,
                }}
              />
              {sectionLabel[section.type] || section.type}
            </h2>

            {section.type === "summary" && (
              <p
                style={{
                  fontSize: "10.5px",
                  lineHeight: 1.7,
                  color: "#555",
                  margin: 0,
                  paddingLeft: "14px",
                }}
              >
                {section.content.text}
              </p>
            )}

            {section.type === "education" &&
              section.content.items.map((item: any) => (
                <div
                  key={item.id}
                  style={{
                    marginBottom: "10px",
                    paddingLeft: "14px",
                    borderLeft: `3px solid ${color}30`,
                    paddingTop: "2px",
                    paddingBottom: "2px",
                  }}
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
                  <div style={{ display: "flex", gap: "12px", marginTop: "2px" }}>
                    {item.location && (
                      <span style={{ fontSize: "10px", color: "#888" }}>
                        {item.location}
                      </span>
                    )}
                    {item.gpa && (
                      <span
                        style={{
                          fontSize: "10px",
                          color: "#fff",
                          backgroundColor: color,
                          padding: "1px 8px",
                          borderRadius: "8px",
                          fontWeight: 600,
                        }}
                      >
                        GPA: {item.gpa}
                      </span>
                    )}
                  </div>
                </div>
              ))}

            {section.type === "skills" && (
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "6px",
                  paddingLeft: "14px",
                }}
              >
                {section.content.items.map((skill: string, i: number) => (
                  <span
                    key={i}
                    style={{
                      fontSize: "10px",
                      padding: "4px 12px",
                      borderRadius: "14px",
                      backgroundColor: `${color}15`,
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
                  style={{
                    marginBottom: "10px",
                    paddingLeft: "14px",
                    borderLeft: `3px solid ${color}30`,
                    paddingTop: "2px",
                    paddingBottom: "2px",
                  }}
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
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "4px",
                        marginTop: "4px",
                      }}
                    >
                      {item.technologies.split(",").map((t: string, i: number) => (
                        <span
                          key={i}
                          style={{
                            fontSize: "9px",
                            padding: "2px 8px",
                            borderRadius: "10px",
                            backgroundColor: "#f0f0f0",
                            color: "#555",
                          }}
                        >
                          {t.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}

            {section.type === "experience" &&
              section.content.items.map((item: any) => (
                <div
                  key={item.id}
                  style={{
                    marginBottom: "10px",
                    paddingLeft: "14px",
                  }}
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
                        <span style={{ fontSize: "11px", color: "#555" }}>
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
                        listStyleType: "disc",
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
                          }}
                        >
                          {b}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}

            {section.type === "certifications" &&
              section.content.items.map((item: any) => (
                <div
                  key={item.id}
                  style={{
                    marginBottom: "6px",
                    paddingLeft: "14px",
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
              <div style={{ paddingLeft: "14px" }}>
                {section.content.items.map((item: any, i: number) => (
                  <div
                    key={i}
                    style={{
                      marginBottom: "6px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "2px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "10.5px",
                          fontWeight: 600,
                          color: "#333",
                        }}
                      >
                        {item.language}
                      </span>
                      {item.proficiency && (
                        <span style={{ fontSize: "9.5px", color: "#888" }}>
                          {item.proficiency}
                        </span>
                      )}
                    </div>
                    <div
                      style={{
                        width: "100%",
                        height: "6px",
                        backgroundColor: "#e8e8e8",
                        borderRadius: "3px",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: getBarWidth(item.proficiency),
                          height: "100%",
                          backgroundColor: color,
                          borderRadius: "3px",
                          transition: "width 0.3s",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
