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
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = "0";
      document.body.style.right = "0";
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleEscape);
      return () => {
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.left = "";
        document.body.style.right = "";
        document.body.style.overflow = "";
        window.scrollTo(0, scrollY);
        window.removeEventListener("keydown", handleEscape);
      };
    }
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
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{ isolation: "isolate" }}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.2, ease: [0.25, 0.4, 0.25, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative z-10 flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-dark-100 shadow-2xl"
          >
            <div className="flex shrink-0 items-center justify-between border-b border-white/[0.06] px-6 py-4">
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

            <p className="shrink-0 px-6 py-3 text-sm text-slate-400">{info.description}</p>

            <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6">
              <div className="rounded-xl border border-white/[0.06] bg-[#fafaf9] p-4 shadow-inner">
                <div
                  className="mx-auto"
                  style={{
                    width: 794,
                    transform: "scale(0.45)",
                    transformOrigin: "top center",
                  }}
                >
                  <TemplateComponent sections={sampleSections} color={info.accent} />
                </div>
              </div>
            </div>

            <div className="flex shrink-0 gap-3 border-t border-white/[0.06] px-6 py-4">
              {onUseTemplate ? (
                <button
                  onClick={() => {
                    onUseTemplate(templateId);
                    onClose();
                  }}
                  className={cn(
                    "inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 px-6 py-3.5 text-base font-bold text-white shadow-glow",
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
                    "inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 px-6 py-3.5 text-base font-bold text-white shadow-glow",
                    "transition-all hover:-translate-y-[1px] hover:shadow-glow"
                  )}
                >
                  Use this template <ArrowRight className="h-5 w-5" />
                </Link>
              )}
              <button
                onClick={onClose}
                className="rounded-xl border border-white/[0.12] bg-white/[0.04] px-6 py-3.5 text-base font-semibold text-slate-300 transition-all hover:bg-white/[0.08] hover:text-white"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  if (typeof window === "undefined") return null;
  return createPortal(content, document.body);
}
