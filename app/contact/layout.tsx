import type { Metadata } from "next";
import { pageMetadata } from "@/lib/page-metadata";

// The page itself is a client component and cannot export metadata, so the
// route's canonical URL, title and description live here.
export const metadata: Metadata = pageMetadata({
  title: "Contact Us",
  description:
    "Questions about OptimaCV, billing or your account? Send us a message and we'll reply within one business day.",
  path: "/contact",
});

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
