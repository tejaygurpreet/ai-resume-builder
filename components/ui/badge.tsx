"use client";

import React from "react";
import { cn } from "@/lib/utils";

const variantStyles = {
  default: "bg-brand-500/10 text-brand-300 border-brand-500/20",
  success: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
  warning: "bg-amber-500/10 text-amber-300 border-amber-500/20",
  destructive: "bg-red-500/10 text-red-300 border-red-500/20",
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
