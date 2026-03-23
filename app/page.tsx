import type { Metadata } from "next";
import HomePage from "@/components/landing/HomePage";
import { PRICING } from "@/lib/plans";

const metaDesc = `Create ATS-optimized, professional resumes in minutes with AI. 55 ATS-friendly templates, job tailoring, cover letters & real-time ATS scoring. Pro from $${PRICING.proMonthly}/month or Export Access $${PRICING.exportOneTime}. Free plan available.`;

export const metadata: Metadata = {
  title: "AI Resume Builder 2026 – ATS Optimized Resumes | ResumeAI",
  description: metaDesc,
  openGraph: {
    title: "AI Resume Builder 2026 – ATS Optimized Resumes | ResumeAI",
    description: metaDesc,
    images: ["/og-image.png"],
  },
};

export default function Home() {
  return <HomePage />;
}

/* === SEO OPTIMIZED: TITLE + META DESCRIPTION UPDATED FOR 2026 RANKING === */
