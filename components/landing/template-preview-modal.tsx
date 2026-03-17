"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { sampleSections } from "@/lib/sample-resume";
import { templates, templateRegistry, type TemplateName } from "@/components/resume/templates";
import { cn } from "@/lib/utils";

const DOC_WIDTH = 794;
const DOC_HEIGHT = 1123;

interface TemplatePreviewModalProps {
  templateId: string | null;
  onClose: () => void;
  onUseTemplate?: (templateId: string) => void;
}

export function TemplatePreviewModal({ templateId, onClose, onUseTemplate }: TemplatePreviewModalProps) {
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.7);

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

  useEffect(() => {
    const el = containerRef.current;
    if (!el || !templateId) return;

    const updateScale = () => {
      const { clientWidth, clientHeight } = el;
      const maxW = clientWidth - 32;
      const maxH = Math.min(clientHeight - 32, window.innerHeight * 0.65);
      const scaleByWidth = maxW / DOC_WIDTH;
      const scaleByHeight = maxH / DOC_HEIGHT;
      const s = Math.min(0.95, scaleByWidth, scaleByHeight);
      setScale(Math.max(0.4, s));
    };

    updateScale();
    const ro = new ResizeObserver(updateScale);
    ro.observe(el);

    return () => ro.disconnect();
  }, [templateId]);

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
            className="relative z-10 flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-dark-100 shadow-2xl"
          >
            <div className="flex shrink-0 items-center justify-between border-b border-white/[0.06] px-6 py-3">
              <div>
                <h3 className="text-lg font-bold text-white">{info.name}</h3>
                <span className="text-xs font-medium capitalize text-slate-500">{info.category}</span>
              </div>
              <button
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-white/[0.08] hover:text-white"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div
              ref={containerRef}
              className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-auto p-6"
            >
              <div
                className="flex shrink-0 items-center justify-center rounded-lg border border-white/[0.06] bg-[#f8f7f5] p-4 shadow-inner"
                style={{
                  boxShadow: "0 4px 24px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9)",
                }}
              >
                <div
                  style={{
                    width: DOC_WIDTH,
                    height: DOC_HEIGHT,
                    transform: `scale(${scale})`,
                    transformOrigin: "center top",
                  }}
                  className="resume-preview-document"
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
