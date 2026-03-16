"use client";

import React from "react";
import { cn } from "@/lib/utils";

const variantStyles = {
  default: "bg-brand-50 text-brand-700 border-brand-200/60",
  success: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
  warning: "bg-amber-50 text-amber-700 border-amber-200/60",
  destructive: "bg-red-50 text-red-700 border-red-200/60",
} as const;

type BadgeVariant = keyof typeof variantStyles;

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  )
);

Badge.displayName = "Badge";

export { Badge };
export type { BadgeProps, BadgeVariant };
