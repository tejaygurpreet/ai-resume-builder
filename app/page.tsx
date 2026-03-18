import type { Metadata } from "next";
import HomePage from "@/components/landing/HomePage";

export const metadata: Metadata = {
  title: "AI Resume Builder 2026 – ATS Optimized Resumes | ResumeAI",
  description:
    "Create ATS-optimized, professional resumes in minutes with AI. 50+ templates, job tailoring, cover letters & real-time ATS scoring. Pro from just $7.99/month or $19.99 one-time exports. Free plan available. Start now and land more interviews.",
  openGraph: {
    title: "AI Resume Builder 2026 – ATS Optimized Resumes | ResumeAI",
    description:
      "Create ATS-optimized, professional resumes in minutes with AI. 50+ templates, job tailoring, cover letters & real-time ATS scoring. Pro from just $7.99/month or $19.99 one-time exports. Free plan available. Start now and land more interviews.",
    images: ["/og-image.png"],
  },
};

export default function Home() {
  return <HomePage />;
}

/* === SEO OPTIMIZED: TITLE + META DESCRIPTION UPDATED FOR 2026 RANKING === */
