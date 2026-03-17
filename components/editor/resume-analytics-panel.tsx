"use client";

import React from "react";
import {
  FileText,
  List,
  Eye,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  Target,
  Lightbulb,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ResumeSection } from "@/hooks/use-resume-store";
import { validateResumeCompletion } from "@/lib/resume-validation";

interface ResumeAnalyticsPanelProps {
  sections: ResumeSection[];
}

function countBullets(sections: ResumeSection[]): number {
  let count = 0;
  for (const s of sections) {
    if (s.type === "experience") {
      for (const item of s.content?.items ?? []) {
        count += (item.bullets ?? []).filter((b: string) => b.trim()).length;
      }
    }
  }
  return count;
}

function countWords(sections: ResumeSection[]): number {
  let total = 0;
  for (const s of sections) {
    const c = s.content;
    if (!c) continue;

    if (s.type === "personal") {
      const name = c.fullName || [c.firstName, c.lastName].filter(Boolean).join(" ");
      total += [name, c.email, c.phone, c.location]
        .filter(Boolean)
        .join(" ")
        .split(/\s+/).length;
    } else if (s.type === "summary") {
      total += (c.text ?? "").split(/\s+/).filter(Boolean).length;
    } else if (s.type === "experience") {
      for (const item of c.items ?? []) {
        total += [item.title, item.company, item.location]
          .filter(Boolean)
          .join(" ")
          .split(/\s+/).length;
        for (const b of item.bullets ?? []) {
          total += (b ?? "").split(/\s+/).filter(Boolean).length;
        }
      }
    } else if (s.type === "education") {
      for (const item of c.items ?? []) {
        total += [item.degree, item.school, item.location]
          .filter(Boolean)
          .join(" ")
          .split(/\s+/).length;
      }
    } else if (s.type === "skills") {
      total += (c.items ?? []).length;
    } else if (s.type === "projects") {
      for (const item of c.items ?? []) {
        total += [item.name, item.description, item.technologies]
          .filter(Boolean)
          .join(" ")
          .split(/\s+/).length;
      }
    }
  }
  return total;
}

function estimatePages(wordCount: number): number {
  return Math.max(1, Math.ceil(wordCount / 475));
}

function readabilityGrade(sections: ResumeSection[]): "Easy" | "Good" | "Dense" {
  const bulletCount = countBullets(sections);
  const wordCount = countWords(sections);
  if (wordCount < 100) return "Easy";
  const avgBulletLen =
    bulletCount > 0 ? wordCount / bulletCount : wordCount;
  if (avgBulletLen > 25) return "Dense";
  if (avgBulletLen > 18) return "Good";
  return "Easy";
}

function Metric({
  icon: Icon,
  label,
  value,
  status,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  status: "good" | "warning" | "neutral";
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2.5">
      <div className="flex items-center gap-2">
        <Icon className="h-3.5 w-3.5 text-slate-500" />
        <span className="text-xs text-slate-400">{label}</span>
      </div>
      <span
        className={cn(
          "text-xs font-semibold",
          status === "good" && "text-emerald-400",
          status === "warning" && "text-amber-400",
          status === "neutral" && "text-slate-300"
        )}
      >
        {value}
      </span>
    </div>
  );
}

export function ResumeAnalyticsPanel({ sections }: ResumeAnalyticsPanelProps) {
  const [expanded, setExpanded] = React.useState(true);

  const validation = validateResumeCompletion(sections);
  const wordCount = countWords(sections);
  const bulletCount = countBullets(sections);
  const pages = estimatePages(wordCount);
  const readability = readabilityGrade(sections);

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
            <span className="text-sm font-semibold text-white">Resume Health</span>
            <div className="mt-0.5 flex items-center gap-2">
              <div className="h-1.5 w-20 overflow-hidden rounded-full bg-white/10">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    validation.percentage >= 100 ? "bg-emerald-500" : "bg-amber-500"
                  )}
                  style={{ width: `${validation.percentage}%` }}
                />
              </div>
              <span className="text-xs font-medium text-slate-400">
                {validation.percentage}% Complete
              </span>
            </div>
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
        <div className="space-y-4 border-t border-white/[0.06] px-4 py-4">
          <div className="space-y-2">
            <Metric
              icon={FileText}
              label="Resume Length"
              value={`${pages} page${pages > 1 ? "s" : ""} (~${wordCount} words)`}
              status={pages <= 2 ? "good" : "warning"}
            />
            <Metric
              icon={List}
              label="Bullet Points"
              value={String(bulletCount)}
              status={bulletCount >= 8 ? "good" : bulletCount >= 4 ? "neutral" : "warning"}
            />
            <Metric
              icon={Eye}
              label="Readability"
              value={readability}
              status={readability === "Dense" ? "warning" : "good"}
            />
          </div>

          {validation.missingItems.length > 0 && (
            <div>
              <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-slate-400">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                Required fields missing
              </p>
              <ul className="space-y-1.5">
                {validation.missingItems.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-xs text-amber-200/90"
                  >
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {validation.suggestions.length > 0 && (
            <div>
              <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-slate-400">
                <Lightbulb className="h-3.5 w-3.5 text-brand-400" />
                Suggestions
              </p>
              <ul className="space-y-1.5">
                {validation.suggestions.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-xs text-slate-400"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-slate-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {validation.isComplete && validation.missingItems.length === 0 && (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2.5">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
              <span className="text-sm font-medium text-emerald-300">
                Resume ready to export
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
