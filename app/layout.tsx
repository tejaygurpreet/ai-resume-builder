import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/components/providers";
import "@/styles/globals.css";

/** AdSense loader URL — must stay in server-rendered <head> so “View Page Source” and crawlers see it. */
const ADSENSE_SCRIPT_SRC =
  "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7184226380752555";

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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem("resumeai-theme");if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t);})();`,
          }}
        />
        {/* Google AdSense: plain async script in initial HTML (not a client-only next/script) so verification & View Source work. Async = non-blocking if load fails. After AdSense approves the site, you can wrap this tag with {process.env.NODE_ENV === "production" && (...)} to skip local dev. */}
        <script async src={ADSENSE_SCRIPT_SRC} crossOrigin="anonymous" />
      </head>
      <body className="font-sans antialiased transition-all duration-300 ease-out">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
