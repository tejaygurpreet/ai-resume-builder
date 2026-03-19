"use client";

import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import { getFullName, filterValidSkills } from "@/lib/template-utils";
import type { ResumeSection } from "@/hooks/use-resume-store";

const A4_WIDTH = 595.28;
const A4_HEIGHT = 841.89;
const PADDING_TOP = 40;
const PADDING_BOTTOM = 40;
const PADDING_H = 48;
const CONTENT_HEIGHT = A4_HEIGHT - PADDING_TOP - PADDING_BOTTOM;

const styles = StyleSheet.create({
  page: {
    paddingTop: PADDING_TOP,
    paddingBottom: PADDING_BOTTOM,
    paddingHorizontal: PADDING_H,
    fontFamily: "Helvetica",
    fontSize: 11,
  },
  contentWrapper: {
    maxHeight: CONTENT_HEIGHT,
    overflow: "hidden",
  },
  header: {
    textAlign: "center",
    marginBottom: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  contact: {
    fontSize: 10,
    color: "#555",
    textAlign: "center",
  },
  divider: {
    width: 80,
    height: 2,
    backgroundColor: "#333",
    alignSelf: "center",
    marginTop: 12,
  },
  section: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 2,
    color: "#1a1a1a",
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 2,
    borderBottomColor: "#333",
  },
  summaryText: {
    fontSize: 11,
    lineHeight: 1.6,
    color: "#333",
    textAlign: "justify",
  },
  jobTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#1a1a1a",
  },
  jobMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 2,
    marginBottom: 4,
  },
  jobCompany: {
    fontSize: 11,
    color: "#444",
    fontStyle: "italic",
  },
  jobDate: {
    fontSize: 10,
    color: "#666",
    fontStyle: "italic",
  },
  bulletList: {
    marginLeft: 12,
    marginTop: 4,
  },
  bulletItem: {
    fontSize: 10,
    lineHeight: 1.5,
    color: "#333",
    marginBottom: 3,
  },
  skillsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },
  skill: {
    fontSize: 10,
    color: "#333",
  },
});

function getSection(sections: ResumeSection[], type: string) {
  return sections.find((s) => s.type === type);
}

function hasContent(section: ResumeSection | undefined): boolean {
  if (!section?.content) return false;
  const c = section.content;
  if (c.text && (c.text as string).trim()) return true;
  if (c.fullName && (c.fullName as string).trim()) return true;
  if (c.firstName || c.lastName) return true;
  if (c.items && Array.isArray(c.items) && c.items.length > 0) {
    if (section.type === "interests") {
      return (c.items as string[]).some((s) => (s ?? "").trim());
    }
    return true;
  }
  return false;
}

interface ResumePDFDocumentProps {
  sections: ResumeSection[];
  color?: string;
}

export function ResumePDFDocument({ sections, color = "#1a1a1a" }: ResumePDFDocumentProps) {
  const sorted = [...sections].sort((a, b) => a.order - b.order);
  const personal = getSection(sections, "personal");

  const contactItems = personal?.content
    ? [
        personal.content.email,
        personal.content.phone,
        personal.content.location,
        personal.content.linkedin,
        personal.content.github,
        personal.content.portfolio,
        personal.content.website,
      ].filter(Boolean)
    : [];

  return (
    <Document>
      <Page size="A4" style={styles.page} wrap={false}>
        <View style={styles.contentWrapper} wrap={false}>
        {personal && hasContent(personal) && (
          <View style={styles.header}>
            <Text style={styles.name}>{getFullName(personal.content)}</Text>
            {contactItems.length > 0 && (
              <Text style={styles.contact}>
                {contactItems.join(" · ")}
              </Text>
            )}
            <View style={[styles.divider, { backgroundColor: color }]} />
          </View>
        )}

        {sorted.map((section) => {
          if (section.type === "personal" || !hasContent(section)) return null;

          return (
            <View key={section.id} style={styles.section}>
              <Text style={[styles.sectionTitle, { borderBottomColor: color }]}>
                {section.type === "summary"
                  ? "Professional Summary"
                  : section.type === "experience"
                    ? "Experience"
                    : section.type === "education"
                      ? "Education"
                      : section.type === "skills"
                        ? "Skills"
                        : section.type === "projects"
                          ? "Projects"
                          : section.type === "certifications"
                            ? "Certifications"
                            : section.type === "languages"
                              ? "Languages"
                              : section.type === "awards"
                                ? "Awards"
                                : section.type === "volunteer"
                                  ? "Volunteer Experience"
                                  : section.type === "interests"
                                    ? "Interests"
                                    : section.type}
              </Text>

              {section.type === "summary" && (
                <Text style={styles.summaryText}>{section.content.text}</Text>
              )}

              {section.type === "experience" && (
                <>
                  {(section.content.items ?? []).map((item: any) => (
                    <View key={item.id} style={{ marginBottom: 12 }}>
                      <Text style={styles.jobTitle}>{item.title}</Text>
                      <View style={styles.jobMeta}>
                        <Text style={styles.jobCompany}>
                          {item.company}
                          {item.location ? `, ${item.location}` : ""}
                        </Text>
                        <Text style={styles.jobDate}>
                          {item.startDate}
                          {item.endDate || item.current
                            ? ` – ${item.current ? "Present" : item.endDate}`
                            : ""}
                        </Text>
                      </View>
                      <View style={styles.bulletList}>
                        {(item.bullets ?? [])
                          .filter((b: string) => (b ?? "").trim())
                          .map((b: string, i: number) => (
                            <Text key={i} style={styles.bulletItem}>• {b}</Text>
                          ))}
                      </View>
                    </View>
                  ))}
                </>
              )}

              {section.type === "education" && (
                <>
                  {(section.content.items ?? []).map((item: any) => (
                    <View key={item.id} style={{ marginBottom: 8 }}>
                      <Text style={styles.jobTitle}>
                        {item.degree}
                        {item.field ? ` in ${item.field}` : ""}
                      </Text>
                      <View style={styles.jobMeta}>
                        <Text style={styles.jobCompany}>
                          {item.school}
                          {item.location ? `, ${item.location}` : ""}
                        </Text>
                        <Text style={styles.jobDate}>
                          {item.startDate}
                          {item.endDate ? ` – ${item.endDate}` : ""}
                        </Text>
                      </View>
                      {item.gpa && (
                        <Text style={{ fontSize: 10, color: "#555", marginTop: 2 }}>
                          GPA: {item.gpa}
                        </Text>
                      )}
                    </View>
                  ))}
                </>
              )}

              {section.type === "skills" && (
                <View style={styles.skillsRow}>
                  {filterValidSkills(section.content.items ?? []).map(
                    (skill: string, i: number) => (
                      <Text key={i} style={styles.skill}>
                        {skill}
                        {i < filterValidSkills(section.content.items ?? []).length - 1
                          ? ", "
                          : ""}
                      </Text>
                    )
                  )}
                </View>
              )}

              {section.type === "projects" && (
                <>
                  {(section.content.items ?? []).map((item: any) => (
                    <View key={item.id} style={{ marginBottom: 8 }}>
                      <Text style={styles.jobTitle}>{item.name}</Text>
                      {item.description && (
                        <Text style={{ fontSize: 10, color: "#444", marginTop: 2 }}>
                          {item.description}
                        </Text>
                      )}
                      {item.technologies && (
                        <Text
                          style={{
                            fontSize: 9,
                            color: "#666",
                            fontStyle: "italic",
                            marginTop: 2,
                          }}
                        >
                          {item.technologies}
                        </Text>
                      )}
                    </View>
                  ))}
                </>
              )}

              {section.type === "certifications" && (
                <>
                  {(section.content.items ?? []).map((item: any) => (
                    <View key={item.id} style={{ marginBottom: 4 }}>
                      <Text style={styles.jobTitle}>
                        {item.name}
                        {item.issuer ? ` — ${item.issuer}` : ""}
                      </Text>
                      {item.date && (
                        <Text style={styles.jobDate}>{item.date}</Text>
                      )}
                    </View>
                  ))}
                </>
              )}

              {section.type === "languages" && (
                <Text style={styles.summaryText}>
                  {(section.content.items ?? [])
                    .map(
                      (item: any) =>
                        `${item.language}${item.proficiency ? ` (${item.proficiency})` : ""}`
                    )
                    .join(", ")}
                </Text>
              )}

              {section.type === "awards" && (
                <>
                  {(section.content.items ?? []).map((item: any) => (
                    <View key={item.id} style={{ marginBottom: 4 }}>
                      <Text style={styles.jobTitle}>
                        {item.name}
                        {item.issuer ? ` — ${item.issuer}` : ""}
                      </Text>
                      {item.date && (
                        <Text style={styles.jobDate}>{item.date}</Text>
                      )}
                    </View>
                  ))}
                </>
              )}

              {section.type === "volunteer" && (
                <>
                  {(section.content.items ?? []).map((item: any) => (
                    <View key={item.id} style={{ marginBottom: 10 }}>
                      <Text style={styles.jobTitle}>{item.role}</Text>
                      <View style={styles.jobMeta}>
                        <Text style={styles.jobCompany}>{item.organization}</Text>
                        <Text style={styles.jobDate}>
                          {item.startDate}
                          {item.endDate || item.current
                            ? ` – ${item.current ? "Present" : item.endDate}`
                            : ""}
                        </Text>
                      </View>
                      <View style={styles.bulletList}>
                        {(item.bullets ?? [])
                          .filter((b: string) => (b ?? "").trim())
                          .map((b: string, i: number) => (
                            <Text key={i} style={styles.bulletItem}>• {b}</Text>
                          ))}
                      </View>
                    </View>
                  ))}
                </>
              )}

              {section.type === "interests" && (
                <Text style={styles.summaryText}>
                  {(section.content.items ?? [])
                    .map((s: string) => (s ?? "").trim())
                    .filter(Boolean)
                    .join(" · ")}
                </Text>
              )}
            </View>
          );
        })}
        </View>
      </Page>
    </Document>
  );
}
