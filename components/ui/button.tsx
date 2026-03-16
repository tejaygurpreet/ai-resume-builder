"use client";

import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const variantStyles = {
  default:
    "bg-brand-600 text-white shadow-sm shadow-brand-600/20 hover:bg-brand-700 hover:shadow-md hover:shadow-brand-600/25 hover:-translate-y-[1px] active:translate-y-0 focus-visible:ring-brand-500",
  outline:
    "border border-slate-200 bg-white text-slate-700 shadow-soft hover:bg-slate-50 hover:border-slate-300 hover:shadow-card hover:-translate-y-[1px] active:translate-y-0 focus-visible:ring-brand-500",
  ghost:
    "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 focus-visible:ring-slate-400",
  destructive:
    "bg-red-600 text-white shadow-sm shadow-red-600/20 hover:bg-red-700 hover:shadow-md hover:-translate-y-[1px] active:translate-y-0 focus-visible:ring-red-500",
} as const;

const sizeStyles = {
  sm: "h-8 px-3 text-[13px] gap-1.5 rounded-lg",
  md: "h-10 px-4 text-sm gap-2 rounded-xl",
  lg: "h-12 px-6 text-[15px] gap-2.5 rounded-xl",
} as const;

type ButtonVariant = keyof typeof variantStyles;
type ButtonSize = keyof typeof sizeStyles;

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "md",
      loading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center font-medium",
          "transition-all duration-200 ease-out",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          "disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none disabled:translate-y-0",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };
export type { ButtonProps, ButtonVariant, ButtonSize };
