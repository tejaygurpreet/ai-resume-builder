/**
 * Shared utilities for resume templates
 */

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
