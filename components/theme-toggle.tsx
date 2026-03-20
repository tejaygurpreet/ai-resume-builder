"use client";

import { Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/theme-provider";

type ThemeToggleVariant = "navbar" | "editor" | "nav-mobile";

export function ThemeToggle({
  variant = "navbar",
  className,
  onAfterToggle,
}: {
  variant?: ThemeToggleVariant;
  className?: string;
  /** e.g. close mobile menu after toggle */
  onAfterToggle?: () => void;
}) {
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === "light";

  const handleClick = () => {
    toggleTheme();
    onAfterToggle?.();
  };

  const label =
    isLight
      ? "Light theme is active. Switch to dark mode."
      : "Dark theme is active. Switch to light mode.";

  if (variant === "nav-mobile") {
    return (
      <button
        type="button"
        role="switch"
        aria-checked={isLight}
        aria-label={label}
        title={isLight ? "Switch to dark mode" : "Switch to light mode"}
        onClick={handleClick}
        className={cn(
          "theme-toggle theme-toggle-mobile flex w-full items-center gap-2.5 rounded-xl px-4 py-3 text-left text-[15px] font-medium transition-colors duration-200",
          isLight
            ? "text-slate-700 hover:bg-slate-100"
            : "text-slate-400 hover:bg-white/[0.05] hover:text-white",
          className
        )}
      >
        {isLight ? <Moon className="h-4 w-4 shrink-0" aria-hidden /> : <Sun className="h-4 w-4 shrink-0" aria-hidden />}
        <span>{isLight ? "Dark mode" : "Light mode"}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isLight}
      aria-label={label}
      title={isLight ? "Switch to dark mode" : "Switch to light mode"}
      onClick={handleClick}
      className={cn(
        "theme-toggle flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-all duration-200",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4f46e5]/30",
        isLight
          ? "border-slate-200 bg-white text-amber-500 shadow-sm hover:bg-slate-50"
          : variant === "editor"
            ? "border-white/[0.08] bg-[#0a0a0b] text-slate-400 hover:bg-white/[0.06] hover:text-white"
            : "border-white/[0.08] bg-white/[0.04] text-slate-400 hover:border-white/[0.15] hover:bg-white/[0.08] hover:text-white",
        className
      )}
    >
      {isLight ? <Moon className="h-4 w-4" aria-hidden /> : <Sun className="h-4 w-4" aria-hidden />}
    </button>
  );
}
