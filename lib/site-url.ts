/**
 * Public site URL for links in emails (password reset, Stripe redirects, etc.).
 * - Prefer NEXTAUTH_URL or NEXT_PUBLIC_APP_URL.
 * - On Vercel / in production, force HTTPS for non-localhost hosts.
 */
export function getSiteBaseUrl(): string {
  const explicit = (
    process.env.NEXTAUTH_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    ""
  )
    .trim()
    .replace(/\/$/, "");

  if (explicit) {
    if (shouldForceHttps() && explicit.startsWith("http://") && !isLocalhostUrl(explicit)) {
      return `https://${explicit.slice("http://".length)}`;
    }
    return explicit;
  }

  if (process.env.VERCEL_URL) {
    const host = process.env.VERCEL_URL.replace(/^https?:\/\//, "").replace(/\/$/, "");
    return `https://${host}`;
  }

  return "http://localhost:3000";
}

function shouldForceHttps(): boolean {
  return process.env.NODE_ENV === "production" || !!process.env.VERCEL;
}

function isLocalhostUrl(url: string): boolean {
  try {
    const u = new URL(url.startsWith("http") ? url : `http://${url}`);
    return u.hostname === "localhost" || u.hostname === "127.0.0.1" || u.hostname === "[::1]";
  } catch {
    return false;
  }
}

/** Public page linked from email footers (preferences, List-Unsubscribe). */
export function getEmailPreferencesUrl(): string {
  return `${getSiteBaseUrl().replace(/\/$/, "")}/email-preferences`;
}
