"use client";

import { useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { sampleSections } from "@/lib/sample-resume";
import { templates, templateRegistry, type TemplateName } from "@/components/resume/templates";
import { cn } from "@/lib/utils";

interface TemplatePreviewModalProps {
  templateId: string | null;
  onClose: () => void;
  onUseTemplate?: (templateId: string) => void;
}

export function TemplatePreviewModal({ templateId, onClose, onUseTemplate }: TemplatePreviewModalProps) {
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (templateId) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleEscape);
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [templateId, handleEscape]);

  const info = templateId ? templateRegistry.find((t) => t.id === templateId) : null;
  const TemplateComponent = templateId ? templates[templateId as TemplateName] : null;

  const useHref = templateId
    ? isAuthenticated
      ? `/builder?template=${templateId}`
      : `/signup?template=${templateId}`
    : "#";

  const content = (
    <AnimatePresence>
      {templateId && info && TemplateComponent && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-md"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.25, 0.4, 0.25, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="fixed left-1/2 top-1/2 z-[100] w-[95vw] max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-white/[0.08] bg-dark-100 p-6 shadow-2xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white">{info.name}</h3>
                <span className="text-xs font-medium capitalize text-slate-500">{info.category}</span>
              </div>
              <button
                onClick={onClose}
                className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-white/[0.08] hover:text-white"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="mb-6 text-sm text-slate-400">{info.description}</p>

            <div className="mb-6 flex max-h-[min(60vh,500px)] justify-center overflow-auto rounded-2xl border border-white/[0.06] bg-[#fafaf9] p-4">
              <div style={{ transform: "scale(0.5)", transformOrigin: "top center" }}>
                <TemplateComponent sections={sampleSections} color={info.accent} />
              </div>
            </div>

            <div className="flex gap-3">
              {onUseTemplate ? (
                <button
                  onClick={() => {
                    onUseTemplate(templateId);
                    onClose();
                  }}
                  className={cn(
                    "inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-600 to-brand-500 px-6 py-4 text-base font-bold text-white shadow-glow",
                    "transition-all hover:-translate-y-[1px] hover:shadow-glow"
                  )}
                >
                  Use this template <ArrowRight className="h-5 w-5" />
                </button>
              ) : (
                <Link
                  href={useHref}
                  onClick={onClose}
                  className={cn(
                    "inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-600 to-brand-500 px-6 py-4 text-base font-bold text-white shadow-glow",
                    "transition-all hover:-translate-y-[1px] hover:shadow-glow"
                  )}
                >
                  Use this template <ArrowRight className="h-5 w-5" />
                </Link>
              )}
              <button
                onClick={onClose}
                className="rounded-2xl border border-white/[0.12] bg-white/[0.04] px-6 py-4 text-base font-semibold text-slate-300 transition-all hover:bg-white/[0.08] hover:text-white"
              >
                Close
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  if (typeof window === "undefined") return null;
  return createPortal(content, document.body);
}
