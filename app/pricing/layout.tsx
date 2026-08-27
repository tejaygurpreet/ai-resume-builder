import type { Metadata } from "next";
import { pageMetadata } from "@/lib/page-metadata";

// The page itself is a client component and cannot export metadata, so the
// route's canonical URL, title and description live here.
export const metadata: Metadata = pageMetadata({
  title: "Pricing — Free, Pro & Export Access Plans",
  description:
    "Compare OptimaCV plans. Start free with 2 exports a month, or go Pro from $9.99/month for unlimited AI, all 55 templates, job tailoring and ATS scoring.",
  path: "/pricing",
});

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
