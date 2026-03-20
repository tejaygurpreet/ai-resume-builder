/**
 * Lightweight client events — wire to gtag when present (e.g. Google Analytics).
 */
export function trackEvent(
  eventName: string,
  params?: Record<string, string | number | boolean>
): void {
  if (typeof window === "undefined") return;
  const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
  if (typeof gtag === "function") {
    try {
      gtag("event", eventName, params ?? {});
    } catch {
      /* ignore */
    }
  }
}
