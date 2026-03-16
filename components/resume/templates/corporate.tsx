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

const mainTypes = new Set(["summary", "experience", "education", "projects"]);
const sideTypes = new Set(["skills", "certifications", "languages"]);

export default function CorporateTemplate({ sections, color }: TemplateProps) {
  const sorted = [...sections].sort((a, b) => a.order - b.order);
  const personal = getSectionByType(sections, "personal");

  const mainSections = sorted.filter(
    (s) => s.type !== "personal" && mainTypes.has(s.type) && hasContent(s)
  );
  const sideSections = sorted.filter(
    (s) => s.type !== "personal" && sideTypes.has(s.type) && hasContent(s)
  );

  const sectionLabel: Record<string, string> = {
    summary: "Summary",
    experience: "Experience",
    education: "Education",
    skills: "Skills",
    projects: "Projects",
    certifications: "Certifications",
    languages: "Languages",
  };

  const headingStyle: React.CSSProperties = {
    fontSize: "11px",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "2px",
    color: "#333",
    margin: "0 0 6px 0",
    paddingBottom: "4px",
    borderBottom: `2px solid ${color}`,
  };

  return (
    <div
      style={{
        width: "794px",
        height: "1123px",
        boxSizing: "border-box",
        overflow: "hidden",
        fontFamily: "'Helvetica Neue', Arial, sans-serif",
        color: "#333",
        backgroundColor: "#fff",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          height: "8px",
          backgroundColor: color,
          flexShrink: 0,
        }}
      />

      {personal && hasContent(personal) && (
        <div
          style={{
            padding: "28px 48px 20px",
            flexShrink: 0,
          }}
        >
          <h1
            style={{
              fontSize: "28px",
              fontWeight: 800,
              color: "#111",
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
              gap: "14px",
              marginTop: "8px",
              fontSize: "10.5px",
              color: "#555",
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

      <div
        style={{
          display: "flex",
          flex: 1,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: "70%",
            padding: "0 24px 32px 48px",
            overflow: "hidden",
          }}
        >
          {mainSections.map((section) => (
            <div key={section.id} style={{ marginBottom: "18px" }}>
              <h2 style={headingStyle}>
                {sectionLabel[section.type] || section.type}
              </h2>

              {section.type === "summary" && (
                <p
                  style={{
                    fontSize: "10.5px",
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
                      <span
                        style={{
                          fontSize: "12px",
                          fontWeight: 700,
                          color: "#111",
                        }}
                      >
                        {item.degree}
                      </span>
                      <span
                        style={{
                          fontSize: "10px",
                          color: "#777",
                          whiteSpace: "nowrap",
                          marginLeft: "8px",
                        }}
                      >
                        {item.startDate}
                        {item.endDate ? ` – ${item.endDate}` : ""}
                      </span>
                    </div>
                    {item.school && (
                      <p
                        style={{
                          fontSize: "11px",
                          color: "#555",
                          margin: "1px 0 0 0",
                        }}
                      >
                        {item.school}
                        {item.location ? `, ${item.location}` : ""}
                      </p>
                    )}
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
                          margin: "2px 0 0 0",
                          fontStyle: "italic",
                        }}
                      >
                        {item.technologies}
                      </p>
                    )}
                  </div>
                ))}
            </div>
          ))}
        </div>

        <div
          style={{
            width: "30%",
            backgroundColor: "#f5f5f5",
            padding: "20px 20px 32px",
            overflow: "hidden",
          }}
        >
          {sideSections.map((section) => (
            <div key={section.id} style={{ marginBottom: "20px" }}>
              <h2
                style={{
                  fontSize: "10px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "2px",
                  color: color,
                  margin: "0 0 8px 0",
                  paddingBottom: "4px",
                  borderBottom: `2px solid ${color}`,
                }}
              >
                {sectionLabel[section.type] || section.type}
              </h2>

              {section.type === "skills" && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                  }}
                >
                  {section.content.items.map((skill: string, i: number) => (
                    <span
                      key={i}
                      style={{
                        fontSize: "10px",
                        color: "#444",
                        padding: "3px 0",
                        borderBottom: "1px solid #e0e0e0",
                      }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}

              {section.type === "certifications" &&
                section.content.items.map((item: any) => (
                  <div key={item.id} style={{ marginBottom: "8px" }}>
                    <p
                      style={{
                        fontSize: "10.5px",
                        fontWeight: 600,
                        color: "#222",
                        margin: 0,
                        lineHeight: 1.4,
                      }}
                    >
                      {item.name}
                    </p>
                    {item.issuer && (
                      <p
                        style={{
                          fontSize: "9.5px",
                          color: "#666",
                          margin: "1px 0 0 0",
                        }}
                      >
                        {item.issuer}
                      </p>
                    )}
                    {item.date && (
                      <p
                        style={{
                          fontSize: "9px",
                          color: "#999",
                          margin: "1px 0 0 0",
                        }}
                      >
                        {item.date}
                      </p>
                    )}
                  </div>
                ))}

              {section.type === "languages" &&
                section.content.items.map((item: any, i: number) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "4px",
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
                      <span
                        style={{
                          fontSize: "9.5px",
                          color: "#777",
                        }}
                      >
                        {item.proficiency}
                      </span>
                    )}
                  </div>
                ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
