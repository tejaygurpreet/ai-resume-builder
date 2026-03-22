/**
 * Shared utilities for resume templates
 */

/** Normalize unknown values to trimmed string for emptiness checks. */
function trimStr(v: unknown): string {
  if (v == null) return "";
  if (typeof v === "string") return v.trim();
  return String(v).trim();
}

/**
 * True if this section should appear in live preview / PDF (has real user content).
 * Empty placeholder rows (e.g. one blank project) do not count.
 */
export function sectionHasRenderableContent(
  section: { type: string; content: any } | undefined
): boolean {
  if (!section?.content) return false;
  const c = section.content;
  const type = section.type;

  if (type === "personal") {
    if (trimStr(c.fullName)) return true;
    if (trimStr(c.firstName) || trimStr(c.lastName)) return true;
    return [
      "email",
      "phone",
      "location",
      "linkedin",
      "github",
      "portfolio",
      "website",
    ].some((k) => trimStr(c[k]));
  }

  if (type === "summary") {
    return trimStr(c.text).length > 0;
  }

  if (type === "experience" || type === "volunteer") {
    const items = Array.isArray(c.items) ? c.items : [];
    return items.some((item: Record<string, unknown> | null | undefined) => {
      if (!item) return false;
      const head =
        type === "volunteer"
          ? [item.role, item.organization, item.location, item.startDate, item.endDate]
          : [item.title, item.company, item.location, item.startDate, item.endDate];
      if (head.some((x) => trimStr(x))) return true;
      const bullets = Array.isArray(item.bullets) ? item.bullets : [];
      return bullets.some((b: unknown) => trimStr(b));
    });
  }

  if (type === "education") {
    const items = Array.isArray(c.items) ? c.items : [];
    return items.some((item: Record<string, unknown> | null | undefined) => {
      if (!item) return false;
      return [
        item.degree,
        item.school,
        item.location,
        item.startDate,
        item.endDate,
        item.gpa,
      ].some((x) => trimStr(x));
    });
  }

  if (type === "skills") {
    const items = Array.isArray(c.items) ? c.items : [];
    return items.some((s: unknown) => trimStr(s).length > 0);
  }

  if (type === "projects") {
    const items = Array.isArray(c.items) ? c.items : [];
    return items.some((item: Record<string, unknown> | null | undefined) => {
      if (!item) return false;
      return [item.name, item.description, item.technologies, item.link].some((x) =>
        trimStr(x)
      );
    });
  }

  if (type === "certifications" || type === "awards") {
    const items = Array.isArray(c.items) ? c.items : [];
    return items.some((item: Record<string, unknown> | null | undefined) => {
      if (!item) return false;
      return [item.name, item.issuer, item.date].some((x) => trimStr(x));
    });
  }

  if (type === "languages") {
    const items = Array.isArray(c.items) ? c.items : [];
    return items.some((item: Record<string, unknown> | null | undefined) =>
      trimStr(item?.language)
    );
  }

  if (type === "interests") {
    const items = Array.isArray(c.items) ? c.items : [];
    return items.some((s: unknown) => trimStr(s));
  }

  return false;
}

export function getFullName(c: any): string {
  if (c?.fullName?.trim()) return c.fullName.trim();
  const fn = (c?.firstName ?? "").trim();
  const ln = (c?.lastName ?? "").trim();
  return `${fn} ${ln}`.trim();
}

export function filterValidSkills(items: string[]): string[] {
  return (items ?? []).filter((s: string) => {
    const t = (s ?? "").trim();
    return t.length >= 2 && t.length <= 40 && /[a-zA-Z]/.test(t);
  });
}

/* === EDITOR FIXED: CLEAN EMPTY PREVIEW + SUMMARY MOVED BELOW EXPERIENCE/EDUCATION IN SIDEBAR === */
