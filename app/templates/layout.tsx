import type { Metadata } from "next";
import { pageMetadata } from "@/lib/page-metadata";

// The page itself is a client component and cannot export metadata, so the
// route's canonical URL, title and description live here.
export const metadata: Metadata = pageMetadata({
  title: "55 ATS-Friendly Resume Templates",
  description:
    "Browse 55 professionally designed, ATS-friendly resume templates across 10 categories. Preview every layout free, then build and export in minutes.",
  path: "/templates",
});

export default function TemplatesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
