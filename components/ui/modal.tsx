"use client";

import React, { useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/theme-provider";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl" | "full";
}

const SIZE_CLASSES = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-3xl",
  xl: "max-w-5xl",
  full: "max-w-[90vw]",
};

function Modal({ isOpen, onClose, title, children, className, size = "md" }: ModalProps) {
  const { theme } = useTheme();
  const isLight = theme === "light";

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleKeyDown]);

  if (typeof window === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "fixed inset-0 backdrop-blur-md",
              isLight ? "bg-slate-900/40" : "bg-black/60"
            )}
            onClick={onClose}
            aria-hidden="true"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.25, ease: [0.25, 0.4, 0.25, 1] }}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className={cn(
              "site-modal relative z-10 w-full rounded-2xl border p-6 shadow-xl transition-colors duration-300",
              isLight
                ? "border-slate-200 bg-white shadow-slate-900/10"
                : "border-white/[0.08] bg-dark-50 shadow-glass-lg",
              SIZE_CLASSES[size],
              className
            )}
          >
            {title && (
              <div className="mb-5 flex items-center justify-between">
                <h2
                  className={cn(
                    "text-lg font-semibold",
                    isLight ? "text-slate-900" : "text-white"
                  )}
                >
                  {title}
                </h2>
                <button
                  onClick={onClose}
                  className={cn(
                    "rounded-xl p-1.5 transition-all",
                    isLight
                      ? "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                      : "text-slate-500 hover:bg-white/5 hover:text-white"
                  )}
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            )}

            {!title && (
              <button
                onClick={onClose}
                className={cn(
                  "absolute right-4 top-4 rounded-xl p-1.5 transition-all",
                  isLight
                    ? "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                    : "text-slate-500 hover:bg-white/5 hover:text-white"
                )}
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            )}

            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}

export { Modal };
export type { ModalProps };
