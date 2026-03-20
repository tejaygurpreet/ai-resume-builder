"use client";

import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/theme-provider";

const darkVariants = {
  default:
    "bg-gradient-to-r from-brand-600 via-brand-500 to-brand-600 bg-[length:200%_100%] text-white shadow-[0_0_30px_-6px_rgba(99,102,241,0.5)] hover:shadow-[0_0_50px_-10px_rgba(99,102,241,0.6)] hover:-translate-y-[2px] hover:scale-[1.02] active:translate-y-0 active:scale-[0.99] focus-visible:ring-brand-500",
  secondary:
    "bg-dark-100 text-slate-200 border border-white/10 hover:bg-dark-200 hover:border-white/20 hover:text-white hover:-translate-y-[1px] hover:shadow-glow active:translate-y-0 focus-visible:ring-brand-500",
  outline:
    "border-2 border-white/15 bg-transparent text-slate-300 hover:bg-white/[0.06] hover:border-white/25 hover:text-white hover:-translate-y-[1px] active:translate-y-0 focus-visible:ring-brand-500",
  ghost:
    "text-slate-400 hover:bg-white/[0.06] hover:text-white focus-visible:ring-slate-400",
  destructive:
    "bg-red-600 text-white shadow-lg shadow-red-600/30 hover:bg-red-700 hover:shadow-xl hover:-translate-y-[1px] active:translate-y-0 focus-visible:ring-red-500",
  glow:
    "bg-gradient-to-r from-brand-600 via-accent-violet to-accent-cyan text-white shadow-neon hover:shadow-neon-hover hover:-translate-y-[2px] hover:scale-[1.02] active:translate-y-0 active:scale-[0.99] focus-visible:ring-brand-500 bg-[length:200%_100%] animate-gradient-x",
  light:
    "bg-white text-slate-900 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.12)] hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.2)] hover:-translate-y-[2px] hover:scale-[1.01] active:translate-y-0 active:scale-[0.99] focus-visible:ring-brand-500",
} as const;

const lightVariants = {
  default:
    "bg-gradient-to-r from-brand-600 via-brand-500 to-indigo-600 bg-[length:200%_100%] text-white shadow-md shadow-brand-600/25 hover:shadow-lg hover:shadow-brand-600/35 hover:-translate-y-px active:translate-y-0 focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50",
  secondary:
    "bg-white text-slate-900 border border-slate-200 shadow-sm hover:bg-slate-50 hover:border-slate-300 hover:text-slate-950 active:bg-slate-100 focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50",
  outline:
    "border-2 border-slate-300 bg-white text-slate-800 hover:bg-slate-50 hover:border-slate-400 hover:text-slate-900 active:bg-slate-100 focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50",
  ghost:
    "text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50",
  destructive:
    "bg-red-600 text-white shadow-sm hover:bg-red-700 hover:shadow-md active:bg-red-800 focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50",
  glow:
    "bg-gradient-to-r from-brand-600 via-violet-600 to-indigo-600 text-white shadow-md shadow-violet-500/20 hover:shadow-lg hover:-translate-y-px focus-visible:ring-2 focus-visible:ring-violet-600 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50",
  light:
    "bg-white text-slate-900 border border-slate-200 shadow-md hover:shadow-lg hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
} as const;

const sizeStyles = {
  sm: "h-9 px-4 text-[13px] gap-1.5 rounded-xl",
  md: "h-11 px-6 text-sm gap-2 rounded-xl",
  lg: "h-13 px-8 text-[15px] gap-2.5 rounded-2xl",
  xl: "h-14 px-10 text-base gap-3 rounded-2xl",
} as const;

type ButtonVariant = keyof typeof darkVariants;
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
    const { theme } = useTheme();
    const isLight = theme === "light";
    const styles = isLight ? lightVariants : darkVariants;
    const ringOffset = isLight
      ? "focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50"
      : "focus-visible:ring-offset-2 focus-visible:ring-offset-[#020617]";

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center font-semibold",
          "transition-all duration-300 ease-out",
          "focus-visible:outline-none focus-visible:ring-2",
          ringOffset,
          "disabled:pointer-events-none disabled:opacity-40 disabled:shadow-none disabled:translate-y-0 disabled:scale-100",
          styles[variant],
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
