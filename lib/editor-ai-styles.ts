import { cn } from "@/lib/utils";

/** Primary AI actions: Generate Summary, Generate Bullets, AI suggest skills, etc. */
export function aiPrimaryButtonClassName(isLight: boolean) {
  return cn(
    "editor-ai-btn group gap-1.5 transition-all duration-200 disabled:opacity-45",
    isLight
      ? "border border-violet-200 bg-[#f5f3ff] text-[#4f46e5] shadow-sm hover:border-violet-300 hover:bg-[#ddd6fe] hover:text-[#4338ca] focus-visible:ring-2 focus-visible:ring-[#4f46e5]/30"
      : "border-violet-500/45 bg-gradient-to-br from-violet-500/15 to-purple-600/10 text-violet-200 shadow-sm shadow-violet-900/20 hover:border-violet-400/60 hover:from-violet-500/25 hover:to-purple-600/15 hover:text-white"
  );
}

export function aiPrimaryIconClassName(isLight: boolean) {
  return cn(
    "h-3.5 w-3.5",
    isLight ? "text-indigo-600 group-hover:text-indigo-700" : "text-violet-400 group-hover:text-violet-200"
  );
}

/** Wand / improve bullet — Pro vs locked */
export function aiMicroImproveClassName(
  isLight: boolean,
  isPro: boolean,
  isImproving: boolean
) {
  if (isImproving) {
    return isLight
      ? "border-violet-400 bg-violet-100 text-indigo-700"
      : "border-purple-500/40 bg-purple-500/20 text-purple-300";
  }
  if (!isPro) {
    return isLight
      ? "border-amber-200 bg-amber-50 text-amber-900 hover:border-amber-300 hover:bg-amber-100"
      : "border-amber-500/40 text-amber-400 hover:border-amber-500/50 hover:bg-amber-500/10";
  }
  return isLight
    ? "border-violet-200 bg-white text-indigo-600 hover:border-violet-300 hover:bg-[#f5f3ff]"
    : "border-white/[0.1] text-purple-400 hover:border-purple-500/40 hover:bg-purple-500/10";
}

/** Bar chart / add metrics */
export function aiMicroMetricsClassName(isLight: boolean, isAdding: boolean) {
  if (isAdding) {
    return isLight
      ? "border-violet-400 bg-violet-100 text-indigo-700"
      : "border-purple-500/40 bg-purple-500/20 text-purple-300";
  }
  return isLight
    ? "border-violet-200 bg-white text-indigo-600 hover:border-violet-300 hover:bg-[#f5f3ff]"
    : "border-white/[0.1] text-purple-400 hover:border-purple-500/40 hover:bg-purple-500/10";
}
