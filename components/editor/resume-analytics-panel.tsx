"use client";

import React from "react";
import {
  FileText,
  List,
  Eye,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ResumeSection } from "@/hooks/use-resume-store";

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
      total += [c.fullName, c.email, c.phone, c.location]
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

function sectionCompleteness(sections: ResumeSection[]): {
  label: string;
  complete: boolean;
}[] {
  const expected = [
    "personal",
    "summary",
    "experience",
    "education",
    "skills",
  ];

  return expected.map((type) => {
    const s = sections.find((sec) => sec.type === type);
    let complete = false;

    if (s?.content) {
      const c = s.content;
      switch (type) {
        case "personal":
          complete = !!(c.fullName && c.email);
          break;
        case "summary":
          complete = !!(c.text && c.text.trim().length > 20);
          break;
        case "experience":
          complete = (c.items ?? []).length > 0 && !!(c.items[0]?.title);
          break;
        case "education":
          complete = (c.items ?? []).length > 0 && !!(c.items[0]?.degree);
          break;
        case "skills":
          complete = (c.items ?? []).filter(Boolean).length >= 3;
          break;
      }
    }

    return {
      label: type.charAt(0).toUpperCase() + type.slice(1),
      complete,
    };
  });
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
    <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
      <div className="flex items-center gap-2">
        <Icon className="h-3.5 w-3.5 text-gray-400" />
        <span className="text-xs text-gray-600">{label}</span>
      </div>
      <span
        className={cn(
          "text-xs font-semibold",
          status === "good" && "text-emerald-600",
          status === "warning" && "text-amber-600",
          status === "neutral" && "text-gray-700"
        )}
      >
        {value}
      </span>
    </div>
  );
}

export function ResumeAnalyticsPanel({ sections }: ResumeAnalyticsPanelProps) {
  const [expanded, setExpanded] = React.useState(true);

  const wordCount = countWords(sections);
  const bulletCount = countBullets(sections);
  const pages = estimatePages(wordCount);
  const readability = readabilityGrade(sections);
  const completeness = sectionCompleteness(sections);
  const completedSections = completeness.filter((c) => c.complete).length;

  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      <button
        onClick={() => setExpanded((e) => !e)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4 text-emerald-600" />
          <span className="text-sm font-semibold text-gray-900">Resume Health</span>
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500">
            {completedSections}/{completeness.length}
          </span>
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-gray-400 transition-transform",
            expanded && "rotate-180"
          )}
        />
      </button>

      {expanded && (
        <div className="space-y-3 border-t border-gray-100 px-4 py-3">
          <div className="space-y-1.5">
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

          <div>
            <p className="mb-2 text-xs font-medium text-gray-700">Section Checklist</p>
            <div className="space-y-1">
              {completeness.map(({ label, complete }) => (
                <div
                  key={label}
                  className="flex items-center gap-2 text-xs"
                >
                  {complete ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  ) : (
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                  )}
                  <span className={complete ? "text-gray-600" : "text-amber-600"}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
