"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/theme-provider";

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  variant?: "dark" | "light";
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, variant, ...props }, ref) => {
    const { theme } = useTheme();
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, "-");

    const isLight = theme === "light" || variant === "light";

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className={cn(
              "mb-1.5 block text-[13px] font-medium transition-colors duration-200",
              isLight ? "text-slate-700" : "text-slate-300"
            )}
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            "flex min-h-[100px] w-full rounded-xl border px-3.5 py-2.5 text-sm",
            "transition-all duration-200",
            "focus:outline-none focus:ring-2 focus:ring-offset-0",
            "resize-y",
            isLight
              ? cn(
                  "bg-white border-[#d1d5db] text-[#111827] placeholder:text-slate-500",
                  error
                    ? "border-red-300 focus:border-red-400 focus:ring-red-500/20"
                    : "hover:border-slate-400 focus:border-[#4f46e5] focus:ring-[#4f46e5]/20"
                )
              : cn(
                  "bg-white/[0.05] border-white/[0.08] text-white placeholder:text-slate-500",
                  error
                    ? "border-red-500/50 focus:border-red-400 focus:ring-red-500/20"
                    : "hover:border-white/[0.15] focus:border-brand-500/50 focus:ring-brand-500/20"
                ),
            "disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          aria-invalid={!!error}
          aria-describedby={error ? `${textareaId}-error` : undefined}
          {...props}
        />
        {error && (
          <p
            id={`${textareaId}-error`}
            className={cn(
              "mt-1.5 text-[13px] transition-colors duration-200",
              isLight ? "text-red-600" : "text-red-400"
            )}
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

export { Textarea };
export type { TextareaProps };
