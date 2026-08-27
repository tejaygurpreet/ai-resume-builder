import type { Metadata } from "next";

/**
 * Per-page metadata.
 *
 * The root layout hardcoded `openGraph.url` to "https://optimacv.io", and every
 * page inherited it. So /pricing, /templates, /about and /privacy all declared
 * the homepage as their canonical Open Graph URL — sharing any of them produced
 * a homepage preview, and search engines saw four pages claiming to be one.
 * /pricing and /templates additionally shared the root title and description
 * verbatim.
 *
 * For a product whose entire acquisition channel is organic search on template
 * and pricing queries, that is the whole channel disabled. Every page now
 * declares its own canonical, title and description.
 */

export const SITE_NAME = "OptimaCV";
export const SITE_URL = "https://optimacv.io";

export function pageMetadata(opts: {
  /** Page title without the brand suffix; the template appends it. */
  title: string;
  description: string;
  /** Route path beginning with a slash, e.g. "/pricing". */
  path: string;
  /** Set false for pages that shouldn't appear in search results. */
  index?: boolean;
  keywords?: string[];
}): Metadata {
  const url = `${SITE_URL}${opts.path === "/" ? "" : opts.path}`;
  const index = opts.index ?? true;

  return {
    title: opts.title,
    description: opts.description,
    ...(opts.keywords ? { keywords: opts.keywords } : {}),
    alternates: { canonical: url },
    robots: { index, follow: index },
    openGraph: {
      title: `${opts.title} | ${SITE_NAME}`,
      description: opts.description,
      url,
      siteName: SITE_NAME,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${opts.title} | ${SITE_NAME}`,
      description: opts.description,
    },
  };
}
