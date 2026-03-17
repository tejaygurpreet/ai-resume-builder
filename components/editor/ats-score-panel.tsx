"use client";

import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Target,
  Loader2,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ChevronDown,
} from "lucide-react";
import type { ResumeSection } from "@/hooks/use-resume-store";

interface ATSScoreResult {
  score: number;
  breakdown: {
    keywords: number;
    achievements: number;
    bulletQuality: number;
    formatting: number;
  };
  suggestions: string[];
}

interface ATSScorePanelProps {
  sections: ResumeSection[];
}

function resumeToPlainText(sections: ResumeSection[]): string {
  const sorted = [...sections].sort((a, b) => a.order - b.order);
  const lines: string[] = [];

  for (const section of sorted) {
    const c = section.content;
    if (!c) continue;

    switch (section.type) {
      case "personal": {
        const name = c.fullName || [c.firstName, c.lastName].filter(Boolean).join(" ").trim();
        if (name) lines.push(name);
        if (c.email) lines.push(c.email);
        if (c.location) lines.push(c.location);
        break;
      }
      case "summary":
        if (c.text) lines.push(c.text);
        break;
      case "experience":
        for (const item of c.items ?? []) {
          lines.push(`${item.title} at ${item.company}`);
          for (const b of item.bullets ?? []) {
            if (b) lines.push(b);
          }
        }
        break;
      case "education":
        for (const item of c.items ?? []) {
          lines.push(`${item.degree} at ${item.school}`);
        }
        break;
      case "skills":
        lines.push((c.items ?? []).filter(Boolean).join(", "));
        break;
      case "projects":
        for (const item of c.items ?? []) {
          if (item.name) lines.push(item.name);
          if (item.description) lines.push(item.description);
        }
        break;
      default:
        break;
    }
  }

  return lines.filter(Boolean).join("\n");
}

function ScoreRing({ score }: { score: number }) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color =
    score >= 80 ? "text-emerald-500" : score >= 50 ? "text-amber-500" : "text-red-500";

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="88" height="88" className="-rotate-90">
        <circle
          cx="44"
          cy="44"
          r={radius}
          stroke="currentColor"
          strokeWidth="6"
          fill="none"
          className="text-white/10"
        />
        <circle
          cx="44"
          cy="44"
          r={radius}
          stroke="currentColor"
          strokeWidth="6"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={cn("transition-all duration-700", color)}
        />
      </svg>
      <span className={cn("absolute text-lg font-bold", color)}>{score}</span>
    </div>
  );
}

function BreakdownBar({
  label,
  score,
  max,
}: {
  label: string;
  score: number;
  max: number;
}) {
  const pct = Math.round((score / max) * 100);
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-slate-400">{label}</span>
        <span className="font-medium text-slate-300">{score}/{max}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            pct >= 80 ? "bg-emerald-500" : pct >= 50 ? "bg-amber-500" : "bg-red-400"
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function ATSScorePanel({ sections }: ATSScorePanelProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ATSScoreResult | null>(null);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState(true);

  const analyze = useCallback(async () => {
    const text = resumeToPlainText(sections);
    if (text.trim().length < 20) {
      setError("Add more content to your resume before scoring.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/ai/ats-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText: text }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error || "Scoring failed");
        return;
      }

      setResult(json.result);
    } catch {
      setError("Failed to score resume. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [sections]);

  const SuggestionIcon = ({ suggestion }: { suggestion: string }) => {
    const lower = suggestion.toLowerCase();
    if (lower.includes("great") || lower.includes("good") || lower.includes("strong"))
      return <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0 text-emerald-500" />;
    if (lower.includes("add") || lower.includes("include") || lower.includes("consider"))
      return <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0 text-amber-500" />;
    return <XCircle className="h-3.5 w-3.5 flex-shrink-0 text-red-400" />;
  };

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-dark-50/80 shadow-glass">
      <button
        onClick={() => setExpanded((e) => !e)}
        className="flex w-full items-center justify-between px-4 py-3.5 text-left transition-colors hover:bg-white/[0.02]"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500/15">
            <Target className="h-4 w-4 text-brand-400" />
          </div>
          <div>
            <span className="text-sm font-semibold text-white">ATS Readiness</span>
            {result && (
              <span
                className={cn(
                  "ml-2 rounded-lg px-2 py-0.5 text-xs font-bold",
                  result.score >= 80
                    ? "bg-emerald-500/20 text-emerald-400"
                    : result.score >= 50
                      ? "bg-amber-500/20 text-amber-400"
                      : "bg-red-500/20 text-red-400"
                )}
              >
                {result.score}/100
              </span>
            )}
          </div>
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-slate-500 transition-transform",
            expanded && "rotate-180"
          )}
        />
      </button>

      {expanded && (
        <div className="border-t border-white/[0.06] px-4 py-4">
          {!result && !loading && (
            <div className="flex flex-col items-center py-3">
              <p className="mb-3 text-center text-xs text-slate-400">
                Analyze your resume for ATS compatibility
              </p>
              <Button size="sm" onClick={analyze} className="gap-1.5">
                <Target className="h-3.5 w-3.5" />
                Analyze Resume
              </Button>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center gap-2 py-4">
              <Loader2 className="h-6 w-6 animate-spin text-brand-500" />
              <p className="text-xs text-slate-400">Analyzing…</p>
            </div>
          )}

          {error && (
            <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
              {error}
            </p>
          )}

          {result && !loading && (
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <ScoreRing score={result.score} />
              </div>

              <div className="space-y-2.5">
                <BreakdownBar label="Keywords" score={result.breakdown.keywords} max={25} />
                <BreakdownBar label="Achievements" score={result.breakdown.achievements} max={25} />
                <BreakdownBar label="Bullet Quality" score={result.breakdown.bulletQuality} max={25} />
                <BreakdownBar label="Formatting" score={result.breakdown.formatting} max={25} />
              </div>

              {result.suggestions.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-slate-400">Suggestions</p>
                  <ul className="space-y-1.5">
                    {result.suggestions.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-slate-400">
                        <SuggestionIcon suggestion={s} />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={analyze}
                className="w-full gap-1.5 border-white/[0.12] text-slate-300 hover:bg-white/[0.06] hover:text-white"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Re-analyze
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
