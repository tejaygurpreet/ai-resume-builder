import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/components/providers";
import "@/styles/globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://optimacv.io"),
  title: "OptimaCV - AI Resume Builder",
  description: "Create professional resumes with AI. Build resumes fast.",
  robots: {
    index: true,
    follow: true,
  },
  keywords: [
    "AI resume builder",
    "resume builder",
    "CV builder",
    "resume maker",
    "ATS resume",
  ],
  openGraph: {
    title: "OptimaCV - AI Resume Builder",
    description: "Create professional resumes with AI in minutes.",
    url: "https://optimacv.io",
    siteName: "OptimaCV",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "OptimaCV - AI Resume Builder",
    description: "Create professional resumes with AI in minutes.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable} data-theme="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem("resumeai-theme");if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t);})();`,
          }}
        />
      </head>
      <body className="font-sans antialiased transition-colors duration-300">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
