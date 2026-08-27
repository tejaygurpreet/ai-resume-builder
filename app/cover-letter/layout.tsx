import type { Metadata } from "next";
import { pageMetadata } from "@/lib/page-metadata";

// The page itself is a client component and cannot export metadata, so the
// route's canonical URL, title and description live here.
export const metadata: Metadata = pageMetadata({
  title: "AI Cover Letter Generator",
  description:
    "Generate a tailored cover letter from your resume and a job description. Matches your experience to the role and exports as PDF or DOCX.",
  path: "/cover-letter",
});

export default function CoverLetterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
