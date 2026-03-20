"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import {
  FileText,
  FileJson,
  FileType,
  File,
  Download,
  Crown,
  Pencil,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { trackEvent } from "@/lib/analytics";
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
    ext: ".docx",
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

const AD_CLIENT =
  process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || "ca-pub-7184226380752555";
const AD_SLOT = process.env.NEXT_PUBLIC_ADSENSE_EXPORT_SLOT?.trim() || "";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  isPro: boolean;
  hasOneTimeExport?: boolean;
  exportsUsed?: number;
  maxExports?: number;
  /** Free users see a sponsor step before choosing format */
  showAdGate?: boolean;
  onExport: (format: ExportFormat, filename: string) => void | Promise<void>;
  /** Called after export completes (for refreshing subscription/exportsUsed) */
  onAfterExport?: () => void | Promise<void>;
  resumeTitle?: string;
  templateName?: string;
}

export function ExportModal({
  isOpen,
  onClose,
  isPro,
  hasOneTimeExport = false,
  exportsUsed = 0,
  maxExports = 2,
  showAdGate = false,
  onExport,
  onAfterExport,
  resumeTitle = "Resume",
  templateName = "modern",
}: ExportModalProps) {
  const canExport = isPro || hasOneTimeExport || exportsUsed < maxExports;
  const needAdStep = showAdGate && canExport && !isPro && !hasOneTimeExport;

  const [step, setStep] = useState<"ad" | "formats">("formats");
  const [adCountdown, setAdCountdown] = useState(3);
  const adPushed = useRef(false);

  useEffect(() => {
    if (!isOpen) return;
    if (needAdStep) {
      setStep("ad");
      setAdCountdown(3);
      adPushed.current = false;
    } else {
      setStep("formats");
    }
  }, [isOpen, needAdStep]);

  useEffect(() => {
    if (step !== "ad" || !isOpen || adCountdown <= 0) return;
    const t = setTimeout(() => setAdCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [step, adCountdown, isOpen]);

  useEffect(() => {
    if (step !== "ad" || !isOpen || !AD_SLOT || adPushed.current) return;
    adPushed.current = true;
    try {
      const w = window as Window & { adsbygoogle?: Record<string, unknown>[] };
      w.adsbygoogle = w.adsbygoogle || [];
      w.adsbygoogle.push({});
    } catch {
      /* non-fatal */
    }
  }, [step, isOpen]);

  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>("pdf");
  const [filename, setFilename] = useState("");

  useEffect(() => {
    if (isOpen) {
      setFilename(buildDefaultFilename(resumeTitle, templateName));
      setSelectedFormat("pdf");
    }
  }, [isOpen, resumeTitle, templateName]);

  const handleExportClick = useCallback(async () => {
    if (!canExport) return;
    const ext =
      FORMAT_OPTIONS.find((f) => f.format === selectedFormat)?.ext ?? "";
    let safeName = filename.replace(/[^a-zA-Z0-9-_ ]/g, "").trim();
    if (!safeName) safeName = buildDefaultFilename(resumeTitle, templateName);
    if (safeName.endsWith(ext)) {
      safeName = safeName.slice(0, -ext.length);
    }
    trackEvent("export_completed", {
      format: selectedFormat,
      plan_tier: isPro ? "pro" : hasOneTimeExport ? "export" : "free",
    });
    await onExport(selectedFormat, safeName);
    await onAfterExport?.();
    onClose();
  }, [
    canExport,
    selectedFormat,
    filename,
    resumeTitle,
    templateName,
    onExport,
    onAfterExport,
    onClose,
    isPro,
    hasOneTimeExport,
  ]);

  const currentExt =
    FORMAT_OPTIONS.find((f) => f.format === selectedFormat)?.ext ?? "";

  const adContinueEnabled = adCountdown <= 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={step === "ad" ? "Almost there" : "Export Resume"}
    >
      <div>
        {step === "ad" && (
          <div className="space-y-4">
            <p className="text-sm text-slate-400">
              Free plan includes a short sponsor message before each export.
              Upgrade to Pro or Export Access for ad-free downloads.
            </p>
            {AD_SLOT ? (
              <div className="min-h-[120px] overflow-hidden rounded-lg border border-white/[0.1] bg-white/[0.03]">
                <ins
                  className="adsbygoogle"
                  style={{ display: "block" }}
                  data-ad-client={AD_CLIENT}
                  data-ad-slot={AD_SLOT}
                  data-ad-format="auto"
                  data-full-width-responsive="true"
                />
              </div>
            ) : (
              <div className="flex min-h-[100px] items-center justify-center rounded-lg border border-dashed border-white/[0.15] bg-white/[0.02] px-4 text-center text-xs text-slate-500">
                Sponsor placement (configure NEXT_PUBLIC_ADSENSE_EXPORT_SLOT for
                live ads)
              </div>
            )}
            <p className="text-center text-xs text-slate-500">
              {adCountdown > 0
                ? `Continue in ${adCountdown}s…`
                : "You can continue to export."}
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="border-white/[0.12] text-slate-300 hover:bg-white/[0.06]"
              >
                Cancel
              </Button>
              <Button
                disabled={!adContinueEnabled}
                onClick={() => {
                  trackEvent("export_ad_gate_continue", {});
                  setStep("formats");
                }}
                className="bg-brand-600 hover:bg-brand-500 disabled:opacity-50"
              >
                Continue to export
              </Button>
            </div>
          </div>
        )}

        {step === "formats" && (
          <>
            <div className="mb-5">
              <label
                htmlFor="export-filename"
                className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-300"
              >
                <Pencil className="h-3.5 w-3.5 text-slate-500" />
                File Name
              </label>
              <div className="flex items-stretch">
                <input
                  id="export-filename"
                  type="text"
                  value={filename}
                  onChange={(e) => setFilename(e.target.value)}
                  placeholder="resume"
                  className="min-w-0 flex-1 rounded-l-lg border border-r-0 border-white/[0.12] bg-white/[0.05] px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-brand-500/50 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
                <span className="flex items-center rounded-r-lg border border-white/[0.12] border-l-0 bg-white/[0.03] px-3 text-sm font-medium text-slate-500">
                  {currentExt}
                </span>
              </div>
            </div>

            <p className="mb-3 text-sm font-medium text-slate-300">Format</p>
            <div className="grid grid-cols-2 gap-3">
              {FORMAT_OPTIONS.map(
                ({ format, label, description, icon: Icon }) => (
                  <button
                    key={format}
                    onClick={() => setSelectedFormat(format)}
                    className={cn(
                      "flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-center transition-all duration-200 hover:border-white/[0.2] hover:bg-white/[0.05]",
                      selectedFormat === format
                        ? "border-brand-500 bg-brand-500/10 ring-1 ring-brand-500/30"
                        : "border-white/[0.1] bg-white/[0.02]"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-6 w-6",
                        selectedFormat === format
                          ? "text-brand-400"
                          : "text-slate-500"
                      )}
                    />
                    <span
                      className={cn(
                        "text-sm font-semibold",
                        selectedFormat === format
                          ? "text-brand-300"
                          : "text-slate-300"
                      )}
                    >
                      {label}
                    </span>
                    <span className="text-[11px] leading-tight text-slate-500">
                      {description}
                    </span>
                  </button>
                )
              )}
            </div>

            <div className="mt-4 space-y-2">
              {!canExport && (
                <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
                  <Crown className="h-3.5 w-3.5 flex-shrink-0" />
                  You&apos;ve reached your {maxExports} free exports this month.
                  Upgrade to Pro for unlimited exports or Export Access (
                  one-time).
                </div>
              )}

              {isPro && (
                <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-300">
                  <Crown className="h-3.5 w-3.5 flex-shrink-0" />
                  Pro: Unlimited exports (no ads)
                </div>
              )}

              {!isPro && hasOneTimeExport && (
                <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-300">
                  <Crown className="h-3.5 w-3.5 flex-shrink-0" />
                  Export Access: Unlimited exports (no ads)
                </div>
              )}

              {!isPro && !hasOneTimeExport && canExport && (
                <div className="flex items-center gap-2 rounded-lg border border-slate-500/30 bg-white/[0.03] px-3 py-2 text-xs text-slate-400">
                  Free: {exportsUsed}/{maxExports} exports used this month
                </div>
              )}
            </div>

            <div className="mt-5 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="border-white/[0.12] text-slate-300 hover:bg-white/[0.06]"
              >
                Cancel
              </Button>
              <Button
                onClick={handleExportClick}
                disabled={!canExport}
                className="gap-1.5 bg-brand-600 hover:bg-brand-500 disabled:opacity-50"
              >
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
