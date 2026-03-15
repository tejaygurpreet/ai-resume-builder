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

export default function TimelineTemplate({ sections, color }: TemplateProps) {
  const sorted = [...sections].sort((a, b) => a.order - b.order);
  const personal = getSectionByType(sections, "personal");

  const timelineSections = ["experience", "education", "projects", "certifications"];

  const renderTimelineItem = (
    title: string,
    subtitle: string,
    meta: string,
    dateRange: string,
    bullets?: string[]
  ) => (
    <div style={{ position: "relative", paddingLeft: "28px", paddingBottom: "14px" }}>
      <div
        style={{
          position: "absolute",
          left: "-6px",
          top: "4px",
          width: "12px",
          height: "12px",
          borderRadius: "50%",
          backgroundColor: "white",
          border: `3px solid ${color}`,
          zIndex: 2,
        }}
      />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span style={{ fontSize: "12px", fontWeight: 700, color: "#1a1a1a" }}>{title}</span>
        {dateRange && (
          <span
            style={{
              fontSize: "9.5px",
              color: "white",
              backgroundColor: color,
              padding: "2px 8px",
              borderRadius: "10px",
              whiteSpace: "nowrap",
              marginLeft: "8px",
              fontWeight: 500,
            }}
          >
            {dateRange}
          </span>
        )}
      </div>
      {subtitle && (
        <div style={{ fontSize: "11px", color: "#444", fontWeight: 500, marginTop: "1px" }}>
          {subtitle}
          {meta && <span style={{ color: "#888" }}> · {meta}</span>}
        </div>
      )}
      {bullets && bullets.length > 0 && (
        <ul style={{ margin: "4px 0 0 0", paddingLeft: "14px", listStyleType: "disc" }}>
          {bullets.map((b: string, i: number) => (
            <li key={i} style={{ fontSize: "10px", lineHeight: 1.5, color: "#555", marginBottom: "1px" }}>
              {b}
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  return (
    <div
      style={{
        width: "794px",
        height: "1123px",
        boxSizing: "border-box",
        overflow: "hidden",
        padding: "40px 48px",
        fontFamily: "'Segoe UI', Roboto, sans-serif",
        backgroundColor: "white",
        color: "#333",
      }}
    >
      {personal && hasContent(personal) && (
        <div style={{ marginBottom: "20px", textAlign: "center" }}>
          <h1 style={{ fontSize: "30px", fontWeight: 800, color: "#1a1a1a", margin: 0, letterSpacing: "-0.5px" }}>
            {personal.content.fullName}
          </h1>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              flexWrap: "wrap",
              gap: "6px 16px",
              marginTop: "8px",
              fontSize: "10.5px",
              color: "#555",
            }}
          >
            {personal.content.email && <span>{personal.content.email}</span>}
            {personal.content.phone && <span>{personal.content.phone}</span>}
            {personal.content.location && <span>{personal.content.location}</span>}
            {personal.content.linkedin && <span>{personal.content.linkedin}</span>}
            {personal.content.website && <span>{personal.content.website}</span>}
          </div>
          <div style={{ width: "60px", height: "3px", backgroundColor: color, margin: "12px auto 0" }} />
        </div>
      )}

      {sorted.map((section) => {
        if (section.type === "personal" || !hasContent(section)) return null;

        if (section.type === "summary") {
          return (
            <div key={section.id} style={{ marginBottom: "16px" }}>
              <div
                style={{
                  backgroundColor: `${color}0D`,
                  borderLeft: `3px solid ${color}`,
                  padding: "10px 14px",
                  borderRadius: "0 6px 6px 0",
                }}
              >
                <p style={{ fontSize: "11px", lineHeight: 1.65, color: "#444", margin: 0, fontStyle: "italic" }}>
                  {section.content.text}
                </p>
              </div>
            </div>
          );
        }

        if (section.type === "skills") {
          return (
            <div key={section.id} style={{ marginBottom: "16px" }}>
              <h2
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "1.5px",
                  color,
                  margin: "0 0 8px 0",
                }}
              >
                Skills
              </h2>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                {section.content.items.map((skill: string, i: number) => (
                  <span
                    key={i}
                    style={{
                      fontSize: "9.5px",
                      padding: "3px 10px",
                      borderRadius: "12px",
                      backgroundColor: color,
                      color: "white",
                      fontWeight: 500,
                    }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          );
        }

        if (section.type === "languages") {
          return (
            <div key={section.id} style={{ marginBottom: "16px" }}>
              <h2
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "1.5px",
                  color,
                  margin: "0 0 8px 0",
                }}
              >
                Languages
              </h2>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
                {section.content.items.map((item: any, i: number) => (
                  <span key={i} style={{ fontSize: "11px", color: "#444" }}>
                    <span style={{ fontWeight: 600 }}>{item.language}</span>
                    {item.proficiency && <span style={{ color: "#888" }}> ({item.proficiency})</span>}
                  </span>
                ))}
              </div>
            </div>
          );
        }

        if (timelineSections.includes(section.type)) {
          return (
            <div key={section.id} style={{ marginBottom: "16px" }}>
              <h2
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "1.5px",
                  color,
                  margin: "0 0 10px 0",
                }}
              >
                {section.type}
              </h2>
              <div
                style={{
                  position: "relative",
                  paddingLeft: "2px",
                  borderLeft: `2px solid ${color}40`,
                  marginLeft: "4px",
                }}
              >
                {section.type === "experience" &&
                  section.content.items.map((item: any) =>
                    renderTimelineItem(
                      item.title,
                      item.company,
                      item.location,
                      `${item.startDate || ""}${item.endDate || item.current ? ` – ${item.current ? "Present" : item.endDate}` : ""}`,
                      item.bullets
                    )
                  )}
                {section.type === "education" &&
                  section.content.items.map((item: any) =>
                    renderTimelineItem(
                      item.degree,
                      item.school,
                      item.location,
                      `${item.startDate || ""}${item.endDate ? ` – ${item.endDate}` : ""}`,
                      item.gpa ? [`GPA: ${item.gpa}`] : undefined
                    )
                  )}
                {section.type === "projects" &&
                  section.content.items.map((item: any) =>
                    renderTimelineItem(
                      item.name,
                      item.technologies || "",
                      "",
                      "",
                      [item.description, item.link].filter(Boolean) as string[]
                    )
                  )}
                {section.type === "certifications" &&
                  section.content.items.map((item: any) =>
                    renderTimelineItem(item.name, item.issuer || "", "", item.date || "")
                  )}
              </div>
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}
