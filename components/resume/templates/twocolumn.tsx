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

const leftTypes = ["personal", "summary", "skills", "languages", "certifications"];
const rightTypes = ["experience", "education", "projects"];

export default function TwoColumnTemplate({ sections, color }: TemplateProps) {
  const sorted = [...sections].sort((a, b) => a.order - b.order);
  const personal = getSectionByType(sections, "personal");

  const leftSections = sorted.filter((s) => leftTypes.includes(s.type) && s.type !== "personal" && hasContent(s));
  const rightSections = sorted.filter((s) => rightTypes.includes(s.type) && hasContent(s));

  const sectionHeaderStyle: React.CSSProperties = {
    fontSize: "11px",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "2px",
    color,
    margin: "0 0 8px 0",
    paddingBottom: "5px",
    borderBottom: `2px solid ${color}`,
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
        flexDirection: "column",
      }}
    >
      {/* Header */}
      {personal && hasContent(personal) && (
        <div
          style={{
            padding: "30px 40px 20px",
            backgroundColor: color,
            color: "white",
          }}
        >
          <h1 style={{ fontSize: "28px", fontWeight: 800, margin: 0, letterSpacing: "-0.3px" }}>
            {getFullName(personal.content)}
          </h1>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "6px 18px",
              marginTop: "8px",
              fontSize: "10.5px",
              color: "rgba(255,255,255,0.9)",
            }}
          >
            {personal.content.email && <span>✉ {personal.content.email}</span>}
            {personal.content.phone && <span>☎ {personal.content.phone}</span>}
            {personal.content.location && <span>⌂ {personal.content.location}</span>}
            {personal.content.linkedin && <span>{personal.content.linkedin}</span>}
            {personal.content.github && <span>{personal.content.github}</span>}
            {personal.content.portfolio && <span>{personal.content.portfolio}</span>}
            {personal.content.website && <span>{personal.content.website}</span>}
          </div>
        </div>
      )}

      {/* Two Columns */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Left Column */}
        <div
          style={{
            width: "50%",
            padding: "24px 20px 24px 40px",
            boxSizing: "border-box",
            borderRight: `1px solid ${color}30`,
          }}
        >
          {leftSections.map((section) => (
            <div key={section.id} style={{ marginBottom: "18px" }}>
              <h2 style={sectionHeaderStyle}>{section.type}</h2>

              {section.type === "summary" && (
                <p style={{ fontSize: "10.5px", lineHeight: 1.65, color: "#444", margin: 0 }}>
                  {section.content.text}
                </p>
              )}

              {section.type === "skills" && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                  {section.content.items.map((skill: string, i: number) => (
                    <span
                      key={i}
                      style={{
                        fontSize: "9.5px",
                        padding: "3px 9px",
                        borderRadius: "3px",
                        backgroundColor: `${color}15`,
                        color: "#333",
                        fontWeight: 500,
                        border: `1px solid ${color}30`,
                      }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}

              {section.type === "languages" && (
                <div>
                  {section.content.items.map((item: any, i: number) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "10.5px",
                        padding: "3px 0",
                        borderBottom: "1px solid #eee",
                      }}
                    >
                      <span style={{ fontWeight: 600, color: "#333" }}>{item.language}</span>
                      {item.proficiency && <span style={{ color: "#777" }}>{item.proficiency}</span>}
                    </div>
                  ))}
                </div>
              )}

              {section.type === "certifications" && (
                <div>
                  {section.content.items.map((item: any, i: number) => (
                    <div key={i} style={{ marginBottom: "6px" }}>
                      <div style={{ fontSize: "11px", fontWeight: 600, color: "#222" }}>{item.name}</div>
                      <div style={{ fontSize: "10px", color: "#666" }}>
                        {item.issuer && <span>{item.issuer}</span>}
                        {item.date && <span> · {item.date}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Right Column */}
        <div
          style={{
            width: "50%",
            padding: "24px 40px 24px 20px",
            boxSizing: "border-box",
          }}
        >
          {rightSections.map((section) => (
            <div key={section.id} style={{ marginBottom: "18px" }}>
              <h2 style={sectionHeaderStyle}>{section.type}</h2>

              {section.type === "experience" && (
                <div>
                  {section.content.items.map((item: any, i: number) => (
                    <div key={i} style={{ marginBottom: "12px" }}>
                      <div style={{ fontSize: "11.5px", fontWeight: 700, color: "#1a1a1a" }}>{item.title}</div>
                      <div style={{ fontSize: "10px", color: "#555", marginTop: "1px" }}>
                        {item.company}
                        {item.location && <span> · {item.location}</span>}
                        {" | "}
                        <span style={{ color: "#888" }}>
                          {item.startDate}
                          {item.endDate || item.current
                            ? ` – ${item.current ? "Present" : item.endDate}`
                            : ""}
                        </span>
                      </div>
                      {item.bullets && item.bullets.length > 0 && (
                        <ul style={{ margin: "3px 0 0 0", paddingLeft: "14px", listStyleType: "disc" }}>
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
                    <div key={i} style={{ marginBottom: "8px" }}>
                      <div style={{ fontSize: "11.5px", fontWeight: 700, color: "#1a1a1a" }}>{item.degree}</div>
                      <div style={{ fontSize: "10px", color: "#555", marginTop: "1px" }}>
                        {item.school}
                        {item.location && <span> · {item.location}</span>}
                        {" | "}
                        <span style={{ color: "#888" }}>
                          {item.startDate}
                          {item.endDate ? ` – ${item.endDate}` : ""}
                        </span>
                      </div>
                      {item.gpa && (
                        <div style={{ fontSize: "10px", color: "#666", marginTop: "2px" }}>GPA: {item.gpa}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {section.type === "projects" && (
                <div>
                  {section.content.items.map((item: any, i: number) => (
                    <div key={i} style={{ marginBottom: "10px" }}>
                      <div style={{ fontSize: "11.5px", fontWeight: 700, color: "#1a1a1a" }}>
                        {item.name}
                        {item.link && (
                          <span style={{ fontSize: "9px", color, marginLeft: "6px", fontWeight: 400 }}>
                            {item.link}
                          </span>
                        )}
                      </div>
                      {item.description && (
                        <div style={{ fontSize: "10px", color: "#444", marginTop: "2px", lineHeight: 1.5 }}>
                          {item.description}
                        </div>
                      )}
                      {item.technologies && (
                        <div style={{ fontSize: "9.5px", color: "#777", marginTop: "2px", fontStyle: "italic" }}>
                          {item.technologies}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
