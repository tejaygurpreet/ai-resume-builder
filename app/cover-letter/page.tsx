"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  FileSignature,
  Loader2,
  Download,
  Sparkles,
  Crown,
  ArrowLeft,
} from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import toast from "react-hot-toast";

export default function CoverLetterPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const letterRef = useRef<HTMLDivElement>(null);

  const [isPro, setIsPro] = useState(false);
  const [loading, setLoading] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");

  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [resumeText, setResumeText] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/resumes")
      .then((r) => r.json())
      .then((d) => {
        if (d.subscription?.plan === "pro") setIsPro(true);
        const resumes = d.resumes ?? [];
        if (resumes.length > 0) {
          const latest = resumes[0];
          const lines: string[] = [];
          for (const section of latest.sections ?? []) {
            const c = section.content;
            if (!c) continue;
            if (section.type === "personal" && c.fullName) lines.push(c.fullName);
            if (section.type === "summary" && c.text) lines.push(c.text);
            if (section.type === "experience") {
              for (const item of c.items ?? []) {
                lines.push(`${item.title} at ${item.company}`);
                for (const b of item.bullets ?? []) {
                  if (b) lines.push(b);
                }
              }
            }
            if (section.type === "skills") {
              lines.push((c.items ?? []).filter(Boolean).join(", "));
            }
          }
          setResumeText(lines.join("\n"));
        }
      })
      .catch(() => {});
  }, [status]);

  const handleGenerate = useCallback(async () => {
    if (!jobTitle.trim() || !company.trim()) {
      toast.error("Please provide a job title and company name.");
      return;
    }

    setLoading(true);
    setCoverLetter("");

    try {
      const res = await fetch("/api/ai/generate-cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeText: resumeText || "No resume data available",
          jobTitle: jobTitle.trim(),
          company: company.trim(),
          jobDescription: jobDescription.trim() || undefined,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        if (json.proRequired) {
          toast.error("Cover letter generation is a Pro feature. Upgrade to unlock.");
        } else {
          toast.error(json.error || "Generation failed.");
        }
        return;
      }

      setCoverLetter(json.result);
      toast.success("Cover letter generated!");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [jobTitle, company, jobDescription, resumeText]);

  const handleExportPDF = async () => {
    if (!letterRef.current) return;
    try {
      const { default: html2canvas } = await import("html2canvas");
      const { default: jsPDF } = await import("jspdf");

      const canvas = await html2canvas(letterRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
      });

      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const pdf = new jsPDF("p", "mm", "a4");
      pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save(`cover-letter-${company.replace(/\s+/g, "-").toLowerCase()}.pdf`);
      toast.success("PDF downloaded!");
    } catch {
      toast.error("Failed to export PDF");
    }
  };

  const handleExportDocx = () => {
    const docContent = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<?mso-application progid="Word.Document"?>
<w:wordDocument xmlns:w="http://schemas.microsoft.com/office/word/2003/wordml">
<w:body>
${coverLetter
  .split("\n")
  .map(
    (line) =>
      `<w:p><w:r><w:t>${line.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</w:t></w:r></w:p>`
  )
  .join("\n")}
</w:body>
</w:wordDocument>`;

    const blob = new Blob([docContent], { type: "application/vnd.ms-word;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cover-letter-${company.replace(/\s+/g, "-").toLowerCase()}.doc`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("DOCX downloaded!");
  };

  if (status === "loading") {
    return (
      <>
        <Navbar />
        <main className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
        </main>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              Cover Letter Generator
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Generate a professional cover letter tailored to your target job
            </p>
          </div>
        </div>

        {!isPro && (
          <div className="mb-6 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            <Crown className="h-4 w-4 flex-shrink-0" />
            <span>
              Cover letter generation is a <strong>Pro feature</strong>.{" "}
              <a href="/pricing" className="underline hover:text-amber-800">
                Upgrade to Pro
              </a>{" "}
              to unlock.
            </span>
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Input Form */}
          <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
              <FileSignature className="h-5 w-5 text-brand-600" />
              Job Details
            </h2>

            <Input
              label="Job Title"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="Senior Software Engineer"
              disabled={!isPro}
            />

            <Input
              label="Company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Google"
              disabled={!isPro}
            />

            <Textarea
              label="Job Description (optional)"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description for a more tailored cover letter…"
              className="min-h-[120px]"
              disabled={!isPro}
            />

            <Textarea
              label="Resume Summary"
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Your resume content (auto-loaded from latest resume)…"
              className="min-h-[120px]"
              disabled={!isPro}
            />

            <Button
              onClick={handleGenerate}
              disabled={loading || !isPro}
              className="w-full gap-1.5"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {loading ? "Generating…" : "Generate Cover Letter"}
            </Button>
          </div>

          {/* Output */}
          <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">Preview</h2>

            {!coverLetter ? (
              <div className="flex flex-1 flex-col items-center justify-center py-16 text-center">
                <FileSignature className="h-12 w-12 text-slate-200" />
                <p className="mt-3 text-sm text-slate-400">
                  Your cover letter will appear here
                </p>
              </div>
            ) : (
              <>
                <div
                  ref={letterRef}
                  className="flex-1 rounded-lg border border-slate-100 bg-white p-6"
                >
                  <div className="prose prose-sm max-w-none whitespace-pre-wrap text-slate-800">
                    {coverLetter}
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportPDF}
                    className="gap-1.5"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Export PDF
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportDocx}
                    className="gap-1.5"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Export DOCX
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
