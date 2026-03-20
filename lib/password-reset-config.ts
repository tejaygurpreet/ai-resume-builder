/**
 * Password reset token lifetime (default 24h). Max 7 days to limit abuse.
 * Set PASSWORD_RESET_EXPIRY_HOURS in .env (e.g. 48).
 */
export function getPasswordResetExpiryMs(): number {
  const raw = process.env.PASSWORD_RESET_EXPIRY_HOURS;
  if (raw === undefined || raw.trim() === "") {
    return 24 * 60 * 60 * 1000;
  }
  const hours = parseFloat(raw);
  if (!Number.isFinite(hours) || hours <= 0) {
    return 24 * 60 * 60 * 1000;
  }
  const capped = Math.min(hours, 168);
  return Math.round(capped * 60 * 60 * 1000);
}

export function formatPasswordResetExpiryLabel(ms: number): string {
  const hours = Math.round(ms / (60 * 60 * 1000));
  if (hours >= 24 && hours % 24 === 0) {
    const days = hours / 24;
    return `${days} day${days === 1 ? "" : "s"}`;
  }
  return `${hours} hour${hours === 1 ? "" : "s"}`;
}
