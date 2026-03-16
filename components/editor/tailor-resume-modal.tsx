"use client";

import React, { useState, useCallback } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  FileSearch,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Crown,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ResumeSection } from "@/hooks/use-resume-store";

interface TailorResult {
  keywords: string[];
  optimizedBullets: string[];
  missingSkills: string[];
  suggestions: string[];
  matchScore: number;
}

interface TailorResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
  sections: ResumeSection[];
  isPro: boolean;
}

function resumeToText(sections: ResumeSection[]): string {
  const lines: string[] = [];
  const sorted = [...sections].sort((a, b) => a.order - b.order);

  for (const s of sorted) {
    const c = s.content;
    if (!c) continue;

    if (s.type === "summary" && c.text) lines.push(c.text);
    if (s.type === "experience") {
      for (const item of c.items ?? []) {
        lines.push(`${item.title} at ${item.company}`);
        for (const b of item.bullets ?? []) {
          if (b) lines.push(b);
        }
      }
    }
    if (s.type === "skills") {
      lines.push((c.items ?? []).filter(Boolean).join(", "));
    }
  }

  return lines.join("\n");
}

export function TailorResumeModal({
  isOpen,
  onClose,
  sections,
  isPro,
}: TailorResumeModalProps) {
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TailorResult | null>(null);
  const [error, setError] = useState("");

  const handleTailor = useCallback(async () => {
    if (jobDescription.trim().length < 20) {
      setError("Please paste a more detailed job description.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/ai/tailor-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeText: resumeToText(sections),
          jobDescription: jobDescription.trim(),
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        if (json.proRequired) {
          setError("Job tailoring is a Pro feature. Upgrade to unlock.");
        } else {
          setError(json.error || "Tailoring failed.");
        }
        return;
      }

      setResult(json.result);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [jobDescription, sections]);

  const handleClose = () => {
    onClose();
    setResult(null);
    setError("");
    setJobDescription("");
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Tailor Resume for Job" size="lg">
      {!isPro && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
          <Crown className="h-3.5 w-3.5 flex-shrink-0" />
          This is a Pro feature. Upgrade to use job tailoring.
        </div>
      )}

      {!result ? (
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Paste Job Description
            </label>
            <Textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the full job description here…"
              className="min-h-[200px]"
              disabled={!isPro}
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              onClick={handleTailor}
              disabled={loading || !isPro || jobDescription.trim().length < 20}
              className="gap-1.5"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileSearch className="h-4 w-4" />
              )}
              {loading ? "Analyzing…" : "Tailor Resume"}
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Match score */}
          <div className="flex items-center justify-center gap-3 rounded-xl bg-gray-50 py-4">
            <Target className="h-6 w-6 text-blue-600" />
            <div>
              <p className="text-xs text-gray-500">Match Score</p>
              <p
                className={cn(
                  "text-2xl font-bold",
                  result.matchScore >= 80
                    ? "text-emerald-600"
                    : result.matchScore >= 50
                      ? "text-amber-600"
                      : "text-red-600"
                )}
              >
                {result.matchScore}/100
              </p>
            </div>
          </div>

          {/* Keywords found */}
          {result.keywords.length > 0 && (
            <div>
              <p className="mb-2 text-sm font-medium text-gray-700">Key Keywords</p>
              <div className="flex flex-wrap gap-1.5">
                {result.keywords.map((kw, i) => (
                  <Badge key={i} className="text-xs">
                    {kw}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Missing skills */}
          {result.missingSkills && result.missingSkills.length > 0 && (
            <div>
              <p className="mb-2 text-sm font-medium text-gray-700">Missing Skills</p>
              <div className="flex flex-wrap gap-1.5">
                {result.missingSkills.map((skill, i) => (
                  <Badge key={i} variant="destructive" className="text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Optimized bullets */}
          {result.optimizedBullets.length > 0 && (
            <div>
              <p className="mb-2 text-sm font-medium text-gray-700">
                Optimized Bullet Points
              </p>
              <ul className="space-y-1.5">
                {result.optimizedBullets.map((b, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-emerald-500" />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Suggestions */}
          {result.suggestions.length > 0 && (
            <div>
              <p className="mb-2 text-sm font-medium text-gray-700">Suggestions</p>
              <ul className="space-y-1.5">
                {result.suggestions.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                    <AlertTriangle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-amber-500" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={handleClose}>
              Close
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setResult(null);
                setError("");
              }}
            >
              Try Another Job
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
