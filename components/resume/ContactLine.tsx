"use client";

import React from "react";

/**
 * ATS-safe contact line.
 *
 * The bug this replaces: 13 of the 20 base templates laid contact fields out as
 * sibling <span>s separated only by CSS `gap`. Gap is painted, not written — it
 * puts no character into the text layer. So the resume looked right on screen
 * and came out of any text extractor (or a copy-paste) as:
 *
 *     alexandra.chen@email.com(415) 555-0123San Francisco, CA
 *
 * which is one unparseable token where three fields should be. This renders a
 * real separator character between fields so the extracted text is delimited,
 * while keeping the visual result identical.
 *
 * It also de-duplicates values, which is why every template preview was printing
 * `alexchen.dev` twice — `portfolio` and `website` held the same string and both
 * were rendered unconditionally.
 */

export interface ContactLineProps {
  personal: Record<string, unknown>;
  /** Rendered between fields. Must be a real character, never CSS gap alone. */
  separator?: string;
  /** "inline" for a single wrapped line, "stack" for one field per line. */
  layout?: "inline" | "stack";
  align?: "left" | "center";
  color?: string;
  separatorColor?: string;
  fontSize?: string;
  style?: React.CSSProperties;
  /** Field order; defaults to the conventional resume ordering. */
  fields?: string[];
}

const DEFAULT_FIELDS = [
  "email",
  "phone",
  "location",
  "linkedin",
  "github",
  "portfolio",
  "website",
];

/** Normalise for duplicate detection: scheme, www and trailing slash are noise. */
function canonical(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/+$/, "");
}

export function getContactValues(
  personal: Record<string, unknown> | null | undefined,
  fields: string[] = DEFAULT_FIELDS
): string[] {
  if (!personal) return [];
  const seen = new Set<string>();
  const out: string[] = [];

  for (const field of fields) {
    const raw = personal[field];
    if (typeof raw !== "string") continue;
    const value = raw.trim();
    if (!value) continue;
    const key = canonical(value);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(value);
  }
  return out;
}

export default function ContactLine({
  personal,
  separator = " · ",
  layout = "inline",
  align = "left",
  // Inherit by default. Each template's header supplies its own colour and
  // size, and several have dark or gradient headers where a hardcoded grey
  // would render invisible.
  color = "inherit",
  separatorColor,
  fontSize = "inherit",
  style,
  fields = DEFAULT_FIELDS,
}: ContactLineProps) {
  const values = getContactValues(personal, fields);
  if (values.length === 0) return null;

  if (layout === "stack") {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "3px",
          fontSize,
          color,
          textAlign: align,
          ...style,
        }}
      >
        {values.map((value, i) => (
          <span key={i}>{value}</span>
        ))}
      </div>
    );
  }

  return (
    <div
      style={{
        fontSize,
        color,
        lineHeight: 1.6,
        textAlign: align,
        wordBreak: "break-word",
        ...style,
      }}
    >
      {values.map((value, i) => (
        <React.Fragment key={i}>
          <span>{value}</span>
          {i < values.length - 1 && (
            <span style={separatorColor ? { color: separatorColor } : undefined}>
              {separator}
            </span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
