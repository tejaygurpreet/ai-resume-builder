"use client";

import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const variantStyles = {
  default:
    "bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-lg shadow-brand-600/25 hover:shadow-xl hover:shadow-brand-600/30 hover:-translate-y-[1px] active:translate-y-0 focus-visible:ring-brand-500",
  secondary:
    "bg-dark-100 text-slate-200 border border-white/10 hover:bg-dark-200 hover:border-white/15 hover:-translate-y-[1px] active:translate-y-0 focus-visible:ring-brand-500",
  outline:
    "border border-white/10 bg-transparent text-slate-300 hover:bg-white/5 hover:border-white/20 hover:text-white hover:-translate-y-[1px] active:translate-y-0 focus-visible:ring-brand-500",
  ghost:
    "text-slate-400 hover:bg-white/5 hover:text-white focus-visible:ring-slate-400",
  destructive:
    "bg-red-600 text-white shadow-lg shadow-red-600/25 hover:bg-red-700 hover:shadow-xl hover:-translate-y-[1px] active:translate-y-0 focus-visible:ring-red-500",
  glow:
    "bg-gradient-to-r from-brand-600 via-accent-violet to-accent-cyan text-white shadow-neon hover:shadow-glow-lg hover:-translate-y-[1px] active:translate-y-0 focus-visible:ring-brand-500 bg-[length:200%_100%] animate-gradient-x",
  light:
    "bg-white text-slate-900 shadow-card hover:shadow-card-hover hover:-translate-y-[1px] active:translate-y-0 focus-visible:ring-brand-500",
} as const;

const sizeStyles = {
  sm: "h-8 px-3 text-[13px] gap-1.5 rounded-lg",
  md: "h-10 px-5 text-sm gap-2 rounded-xl",
  lg: "h-12 px-7 text-[15px] gap-2.5 rounded-xl",
  xl: "h-14 px-8 text-base gap-3 rounded-2xl",
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
          "inline-flex items-center justify-center font-semibold",
          "transition-all duration-300 ease-out",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-dark",
          "disabled:pointer-events-none disabled:opacity-40 disabled:shadow-none disabled:translate-y-0",
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
