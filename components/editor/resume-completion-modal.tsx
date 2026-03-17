"use client";

import React from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2, FileEdit } from "lucide-react";
import type { ValidationResult } from "@/lib/resume-validation";
import { cn } from "@/lib/utils";

interface ResumeCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  validation: ValidationResult;
  onGoToSection?: () => void;
}

export function ResumeCompletionModal({
  isOpen,
  onClose,
  validation,
}: ResumeCompletionModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Complete Your Resume" size="md">
      <div className="space-y-6">
        <div className="flex items-center gap-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/20">
            <AlertCircle className="h-6 w-6 text-amber-500" />
          </div>
          <div>
            <p className="font-semibold text-white">Export requires a complete resume</p>
            <p className="mt-0.5 text-sm text-slate-400">
              Add the required information below before exporting.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3">
          <span className="text-sm font-medium text-slate-400">Resume Completion</span>
          <div className="flex items-center gap-2">
            <div className="h-2 w-24 overflow-hidden rounded-full bg-white/10">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  validation.percentage >= 100 ? "bg-emerald-500" : "bg-amber-500"
                )}
                style={{ width: `${validation.percentage}%` }}
              />
            </div>
            <span className="text-sm font-bold text-white">{validation.percentage}%</span>
          </div>
        </div>

        {validation.missingItems.length > 0 && (
          <div>
            <p className="mb-2 text-sm font-medium text-slate-300">Missing required fields</p>
            <ul className="space-y-2">
              {validation.missingItems.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-sm text-slate-400"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {validation.suggestions.length > 0 && (
          <div>
            <p className="mb-2 text-sm font-medium text-slate-400">Recommended improvements</p>
            <ul className="space-y-1.5">
              {validation.suggestions.map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-slate-500">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-slate-600" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Continue Editing
          </Button>
        </div>
      </div>
    </Modal>
  );
}
