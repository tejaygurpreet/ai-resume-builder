"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  variant?: "dark" | "light";
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, variant = "dark", ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    const isDark = variant === "dark";

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              "mb-1.5 block text-[13px] font-medium",
              isDark ? "text-slate-300" : "text-slate-700"
            )}
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "flex h-10 w-full rounded-xl border px-3.5 py-2 text-sm",
            "transition-all duration-200",
            "focus:outline-none focus:ring-2 focus:ring-offset-0",
            isDark
              ? cn(
                  "bg-white/[0.05] border-white/[0.08] text-white placeholder:text-slate-500",
                  error
                    ? "border-red-500/50 focus:border-red-400 focus:ring-red-500/20"
                    : "hover:border-white/[0.15] focus:border-brand-500/50 focus:ring-brand-500/20"
                )
              : cn(
                  "bg-white border-slate-200 text-slate-900 placeholder:text-slate-400",
                  error
                    ? "border-red-300 focus:border-red-400 focus:ring-red-500/20"
                    : "hover:border-slate-300 focus:border-brand-400 focus:ring-brand-500/20"
                ),
            "disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />
        {error && (
          <p
            id={`${inputId}-error`}
            className="mt-1.5 text-[13px] text-red-400"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
export type { InputProps };
