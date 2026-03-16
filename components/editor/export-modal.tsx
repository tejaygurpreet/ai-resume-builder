"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import {
  FileText,
  FileJson,
  FileType,
  File,
  Download,
  Play,
  CheckCircle2,
  Loader2,
  Crown,
  Tv,
  Pencil,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ExportFormat } from "./pdf-export";

const FORMAT_OPTIONS: {
  format: ExportFormat;
  label: string;
  ext: string;
  description: string;
  icon: React.ElementType;
}[] = [
  {
    format: "pdf",
    label: "PDF",
    ext: ".pdf",
    description: "Best for applications & printing",
    icon: FileText,
  },
  {
    format: "docx",
    label: "DOCX",
    ext: ".doc",
    description: "Editable in Microsoft Word",
    icon: File,
  },
  {
    format: "txt",
    label: "TXT",
    ext: ".txt",
    description: "Plain text for ATS systems",
    icon: FileType,
  },
  {
    format: "json",
    label: "JSON",
    ext: ".json",
    description: "Structured data backup",
    icon: FileJson,
  },
  {
    format: "md",
    label: "Markdown",
    ext: ".md",
    description: "Formatted text for GitHub / web",
    icon: FileText,
  },
];

const ADS_REQUIRED = 3;
const AD_DURATION_MS = 2500;

function buildDefaultFilename(
  resumeTitle: string,
  templateName: string
): string {
  const cleaned = resumeTitle
    .replace(/[^a-zA-Z0-9-_ ]/g, "")
    .trim();
  if (cleaned && cleaned.toLowerCase() !== "untitled resume") return cleaned;

  const date = new Date().toISOString().slice(0, 10);
  const tpl = templateName
    .replace(/[^a-zA-Z0-9-_ ]/g, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");
  return `resume-${tpl}-${date}`;
}

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  isPro: boolean;
  hasOneTimeExport?: boolean;
  exportsUsed?: number;
  maxExports?: number;
  onExport: (format: ExportFormat, filename: string) => void;
  resumeTitle?: string;
  templateName?: string;
}

export function ExportModal({
  isOpen,
  onClose,
  isPro,
  hasOneTimeExport = false,
  exportsUsed = 0,
  maxExports = 3,
  onExport,
  resumeTitle = "Resume",
  templateName = "modern",
}: ExportModalProps) {
  const canExportFree = isPro || hasOneTimeExport || exportsUsed < maxExports;
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>("pdf");
  const [filename, setFilename] = useState("");
  const [adsWatched, setAdsWatched] = useState(0);
  const [adPlaying, setAdPlaying] = useState(false);
  const [phase, setPhase] = useState<"form" | "adgate">("form");
  const timerRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (isOpen) {
      setFilename(buildDefaultFilename(resumeTitle, templateName));
      setSelectedFormat("pdf");
      setPhase(isPro ? "form" : adsWatched >= ADS_REQUIRED ? "form" : "form");
    }
    if (!isOpen) {
      setAdPlaying(false);
      if (timerRef.current) clearTimeout(timerRef.current);
    }
  }, [isOpen, resumeTitle, templateName, isPro, adsWatched]);

  const adUnlocked = isPro || hasOneTimeExport || adsWatched >= ADS_REQUIRED;

  const handleExportClick = useCallback(() => {
    if (adUnlocked) {
      const ext =
        FORMAT_OPTIONS.find((f) => f.format === selectedFormat)?.ext ?? "";
      let safeName = filename.replace(/[^a-zA-Z0-9-_ ]/g, "").trim();
      if (!safeName) safeName = buildDefaultFilename(resumeTitle, templateName);
      if (safeName.endsWith(ext)) {
        safeName = safeName.slice(0, -ext.length);
      }
      onExport(selectedFormat, safeName);
      onClose();
    } else {
      setPhase("adgate");
    }
  }, [
    adUnlocked,
    selectedFormat,
    filename,
    resumeTitle,
    templateName,
    onExport,
    onClose,
  ]);

  const handleWatchAd = useCallback(() => {
    if (adPlaying) return;
    setAdPlaying(true);

    timerRef.current = setTimeout(() => {
      setAdsWatched((prev) => {
        const next = prev + 1;
        if (next >= ADS_REQUIRED) {
          setPhase("form");
        }
        return next;
      });
      setAdPlaying(false);
    }, AD_DURATION_MS);
  }, [adPlaying]);

  const currentExt =
    FORMAT_OPTIONS.find((f) => f.format === selectedFormat)?.ext ?? "";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Export Resume">
      {phase === "form" ? (
        <div>
          {/* Filename input */}
          <div className="mb-5">
            <label
              htmlFor="export-filename"
              className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-700"
            >
              <Pencil className="h-3.5 w-3.5 text-slate-400" />
              File Name
            </label>
            <div className="flex items-stretch">
              <input
                id="export-filename"
                type="text"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                placeholder="resume"
                className="min-w-0 flex-1 rounded-l-lg border border-r-0 border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
              <span className="flex items-center rounded-r-lg border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-500">
                {currentExt}
              </span>
            </div>
          </div>

          {/* Format selector */}
          <p className="mb-3 text-sm font-medium text-slate-700">Format</p>
          <div className="grid grid-cols-2 gap-3">
            {FORMAT_OPTIONS.map(
              ({ format, label, description, icon: Icon }) => (
                <button
                  key={format}
                  onClick={() => setSelectedFormat(format)}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-center transition-all duration-200 hover:border-brand-200 hover:bg-brand-50/50",
                    selectedFormat === format
                      ? "border-brand-500 bg-brand-50 ring-1 ring-brand-500/20"
                      : "border-slate-200 bg-white"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-6 w-6",
                      selectedFormat === format
                        ? "text-brand-600"
                        : "text-slate-400"
                    )}
                  />
                  <span
                    className={cn(
                      "text-sm font-semibold",
                      selectedFormat === format
                        ? "text-brand-700"
                        : "text-slate-700"
                    )}
                  >
                    {label}
                  </span>
                  <span className="text-[11px] leading-tight text-slate-400">
                    {description}
                  </span>
                </button>
              )
            )}
          </div>

          {!isPro && !hasOneTimeExport && !adUnlocked && (
            <div className="mt-4 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
              <Tv className="h-3.5 w-3.5 flex-shrink-0" />
              Free plan: Watch 3 short ads to unlock this export ({exportsUsed}/{maxExports} monthly exports used)
            </div>
          )}

          {!isPro && !hasOneTimeExport && !canExportFree && (
            <div className="mt-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              <Crown className="h-3.5 w-3.5 flex-shrink-0" />
              Monthly export limit reached. <a href="/pricing" className="underline">Upgrade to Pro</a> or buy one-time export access.
            </div>
          )}

          {isPro && (
            <div className="mt-4 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
              <Crown className="h-3.5 w-3.5 flex-shrink-0" />
              Pro plan: Unlimited exports with no ads
            </div>
          )}

          {!isPro && adUnlocked && (
            <div className="mt-4 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
              <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0" />
              Ads completed — ready to export!
            </div>
          )}

          <div className="mt-5 flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleExportClick} className="gap-1.5">
              <Download className="h-4 w-4" />
              {adUnlocked ? "Export" : "Continue"}
            </Button>
          </div>
        </div>
      ) : (
        <AdGateView
          adsWatched={adsWatched}
          adsRequired={ADS_REQUIRED}
          adPlaying={adPlaying}
          onWatchAd={handleWatchAd}
          onBack={() => setPhase("form")}
        />
      )}
    </Modal>
  );
}

function AdGateView({
  adsWatched,
  adsRequired,
  adPlaying,
  onWatchAd,
  onBack,
}: {
  adsWatched: number;
  adsRequired: number;
  adPlaying: boolean;
  onWatchAd: () => void;
  onBack: () => void;
}) {
  const allDone = adsWatched >= adsRequired;

  return (
    <div className="flex flex-col items-center py-2">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-brand-50">
        {allDone ? (
          <CheckCircle2 className="h-8 w-8 text-emerald-500" />
        ) : (
          <Tv className="h-8 w-8 text-brand-500" />
        )}
      </div>

      <h3 className="text-lg font-semibold text-slate-900">
        {allDone
          ? "Export Unlocked!"
          : "Watch 3 Short Ads to Unlock Export"}
      </h3>
      <p className="mt-1 text-center text-sm text-slate-500">
        {allDone
          ? "You can now export your resume. Go back to choose your format and filename."
          : "Support ResumeAI by watching a few brief ads to enable your free export."}
      </p>

      {/* Progress bar */}
      <div className="mt-6 w-full max-w-xs">
        <div className="mb-2 flex justify-between text-xs font-medium">
          <span className="text-slate-500">Progress</span>
          <span
            className={cn(allDone ? "text-emerald-600" : "text-brand-600")}
          >
            {adsWatched}/{adsRequired}
          </span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              allDone ? "bg-emerald-500" : "bg-brand-500"
            )}
            style={{
              width: `${(adsWatched / adsRequired) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Progress circles */}
      <div className="mt-4 flex items-center gap-3">
        {Array.from({ length: adsRequired }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-full border-2 text-xs font-bold transition-all",
              i < adsWatched
                ? "border-emerald-500 bg-emerald-50 text-emerald-600"
                : i === adsWatched && adPlaying
                  ? "border-brand-500 bg-brand-50 text-brand-600 animate-pulse"
                  : "border-slate-200 bg-slate-50 text-slate-400"
            )}
          >
            {i < adsWatched ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              i + 1
            )}
          </div>
        ))}
      </div>

      {/* Ad simulation area */}
      {!allDone && (
        <div className="mt-6 w-full max-w-xs">
          {adPlaying ? (
            <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6">
              <Loader2 className="h-6 w-6 animate-spin text-brand-500" />
              <span className="text-sm font-medium text-slate-600">
                Ad playing…
              </span>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                <div className="h-full animate-[progress_2.5s_linear] rounded-full bg-brand-500" />
              </div>
            </div>
          ) : (
            <Button
              onClick={onWatchAd}
              className="w-full gap-2"
              size="lg"
            >
              <Play className="h-4 w-4" />
              Watch Ad ({adsWatched + 1} of {adsRequired})
            </Button>
          )}
        </div>
      )}

      <div className="mt-5">
        <Button
          variant={allDone ? "default" : "ghost"}
          size="sm"
          onClick={onBack}
        >
          {allDone ? "Back to Export" : "Back"}
        </Button>
      </div>
    </div>
  );
}
