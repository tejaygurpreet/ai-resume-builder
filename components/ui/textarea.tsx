"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="mb-1.5 block text-[13px] font-medium text-slate-700"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            "flex min-h-[100px] w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900",
            "placeholder:text-slate-400",
            "transition-all duration-200",
            "focus:outline-none focus:ring-2 focus:ring-offset-0",
            "resize-y",
            error
              ? "border-red-300 focus:border-red-400 focus:ring-red-500/20"
              : "border-slate-200 hover:border-slate-300 focus:border-brand-400 focus:ring-brand-500/20",
            "disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-60",
            className
          )}
          aria-invalid={!!error}
          aria-describedby={error ? `${textareaId}-error` : undefined}
          {...props}
        />
        {error && (
          <p
            id={`${textareaId}-error`}
            className="mt-1.5 text-[13px] text-red-600"
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
