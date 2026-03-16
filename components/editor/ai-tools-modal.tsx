"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, Sparkles } from "lucide-react";
import { useResumeStore } from "@/hooks/use-resume-store";
import toast from "react-hot-toast";

/* ─── Bullet Generator ─────────────────────────────────────────── */

export function BulletGeneratorModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [responsibilities, setResponsibilities] = useState("");
  const [bullets, setBullets] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const generate = async () => {
    if (!jobTitle.trim()) return;
    setLoading(true);
    setBullets([]);
    try {
      const res = await fetch("/api/ai/bullets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobTitle, company, responsibilities }),
      });
      if (!res.ok) throw new Error("Failed to generate bullets");
      const data = await res.json();
      setBullets(data.bullets ?? []);
    } catch {
      toast.error("Failed to generate bullet points");
    } finally {
      setLoading(false);
    }
  };

  const copyBullet = async (text: string, idx: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Generate Bullet Points">
      <div className="space-y-4">
        <Input
          label="Job Title"
          value={jobTitle}
          onChange={(e) => setJobTitle(e.target.value)}
          placeholder="Senior Software Engineer"
        />
        <Input
          label="Company"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          placeholder="Google"
        />
        <Textarea
          label="Key Responsibilities"
          value={responsibilities}
          onChange={(e) => setResponsibilities(e.target.value)}
          placeholder="Led a team of 5, built microservices, improved API latency…"
          className="min-h-[80px]"
        />
        <Button onClick={generate} loading={loading} className="w-full">
          <Sparkles className="mr-2 h-4 w-4" />
          Generate Bullets
        </Button>

        {bullets.length > 0 && (
          <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-medium text-slate-500">
              Generated Bullets
            </p>
            {bullets.map((bullet, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2 rounded-md bg-white p-2.5 text-sm text-slate-700 shadow-sm"
              >
                <span className="mt-0.5 shrink-0 text-slate-400">&bull;</span>
                <p className="flex-1">{bullet}</p>
                <button
                  onClick={() => copyBullet(bullet, idx)}
                  className="shrink-0 rounded p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                  aria-label="Copy"
                >
                  {copiedIdx === idx ? (
                    <Check className="h-3.5 w-3.5 text-green-500" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}

/* ─── Resume Score ─────────────────────────────────────────────── */

interface ScoreResult {
  score: number;
  suggestions: string[];
  keywords: string[];
}

export function ScoreModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const resume = useResumeStore((s) => s.resume);
  const [result, setResult] = useState<ScoreResult | null>(null);
  const [loading, setLoading] = useState(false);

  const score = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/ai/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sections: resume.sections }),
      });
      if (!res.ok) throw new Error("Failed to score resume");
      const data = await res.json();
      setResult(data);
    } catch {
      toast.error("Failed to score resume");
    } finally {
      setLoading(false);
    }
  };

  const scoreColor =
    (result?.score ?? 0) >= 80
      ? "text-green-600"
      : (result?.score ?? 0) >= 60
        ? "text-amber-600"
        : "text-red-600";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Resume Score">
      <div className="space-y-4">
        {!result && (
          <div className="text-center">
            <p className="mb-4 text-sm text-slate-600">
              Get an AI-powered score and personalized suggestions to improve
              your resume.
            </p>
            <Button onClick={score} loading={loading}>
              <Sparkles className="mr-2 h-4 w-4" />
              Score My Resume
            </Button>
          </div>
        )}

        {result && (
          <>
            <div className="flex flex-col items-center rounded-xl bg-slate-50 p-6">
              <span className={`text-6xl font-bold ${scoreColor}`}>
                {result.score}
              </span>
              <span className="mt-1 text-sm text-slate-500">out of 100</span>
            </div>

            {result.suggestions.length > 0 && (
              <div>
                <h4 className="mb-2 text-sm font-medium text-slate-700">
                  Suggestions
                </h4>
                <ul className="space-y-1.5">
                  {result.suggestions.map((s, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-slate-600"
                    >
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.keywords.length > 0 && (
              <div>
                <h4 className="mb-2 text-sm font-medium text-slate-700">
                  Keyword Tips
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {result.keywords.map((kw, i) => (
                    <Badge key={i} variant="warning">
                      {kw}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <Button
              variant="outline"
              onClick={() => setResult(null)}
              className="w-full"
            >
              Score Again
            </Button>
          </>
        )}
      </div>
    </Modal>
  );
}

/* ─── Cover Letter ─────────────────────────────────────────────── */

export function CoverLetterModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const resume = useResumeStore((s) => s.resume);
  const [jobTitle, setJobTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [letter, setLetter] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    if (!jobTitle.trim() || !companyName.trim()) return;
    setLoading(true);
    setLetter("");
    try {
      const res = await fetch("/api/ai/cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobTitle,
          companyName,
          sections: resume.sections,
        }),
      });
      if (!res.ok) throw new Error("Failed to generate cover letter");
      const data = await res.json();
      setLetter(data.coverLetter ?? "");
    } catch {
      toast.error("Failed to generate cover letter");
    } finally {
      setLoading(false);
    }
  };

  const copyAll = async () => {
    await navigator.clipboard.writeText(letter);
    setCopied(true);
    toast.success("Cover letter copied");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Generate Cover Letter"
      className="max-w-2xl"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Job Title"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            placeholder="Senior Software Engineer"
          />
          <Input
            label="Company Name"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Google"
          />
        </div>
        <Button onClick={generate} loading={loading} className="w-full">
          <Sparkles className="mr-2 h-4 w-4" />
          Generate Cover Letter
        </Button>

        {letter && (
          <div className="space-y-2">
            <div className="max-h-80 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                {letter}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={copyAll}
              className="w-full"
            >
              {copied ? (
                <Check className="mr-2 h-4 w-4 text-green-500" />
              ) : (
                <Copy className="mr-2 h-4 w-4" />
              )}
              {copied ? "Copied!" : "Copy All"}
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
}

/* ─── Keyword Match ────────────────────────────────────────────── */

interface KeywordResult {
  matched: string[];
  missing: string[];
  tips: string[];
}

export function KeywordMatchModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const resume = useResumeStore((s) => s.resume);
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState<KeywordResult | null>(null);
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    if (!jobDescription.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/ai/keywords", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobDescription,
          sections: resume.sections,
        }),
      });
      if (!res.ok) throw new Error("Failed to analyze keywords");
      const data = await res.json();
      setResult(data);
    } catch {
      toast.error("Failed to analyze keywords");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Keyword Match Analysis"
      className="max-w-2xl"
    >
      <div className="space-y-4">
        <Textarea
          label="Paste Job Description"
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste the full job description here to analyze keyword matches…"
          className="min-h-[120px]"
        />
        <Button onClick={analyze} loading={loading} className="w-full">
          <Sparkles className="mr-2 h-4 w-4" />
          Analyze Keywords
        </Button>

        {result && (
          <div className="space-y-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
            {result.matched.length > 0 && (
              <div>
                <h4 className="mb-2 text-sm font-medium text-green-700">
                  Matched Keywords ({result.matched.length})
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {result.matched.map((kw, i) => (
                    <Badge key={i} variant="success">
                      {kw}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {result.missing.length > 0 && (
              <div>
                <h4 className="mb-2 text-sm font-medium text-red-700">
                  Missing Keywords ({result.missing.length})
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {result.missing.map((kw, i) => (
                    <Badge key={i} variant="destructive">
                      {kw}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {result.tips.length > 0 && (
              <div>
                <h4 className="mb-2 text-sm font-medium text-slate-700">Tips</h4>
                <ul className="space-y-1.5">
                  {result.tips.map((tip, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-slate-600"
                    >
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
