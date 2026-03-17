"use client";

import { motion } from "framer-motion";
import { Sparkles, Check, Lightbulb } from "lucide-react";
import ResumePreview from "@/components/resume/resume-preview";
import { sampleSections } from "@/lib/sample-resume";
import { AnimatedCounter } from "./animated-counter";

const aiSuggestions = [
  "Add quantifiable metrics to bullet points",
  "Include industry keywords from job description",
  "Strengthen action verbs in experience section",
];

export function HeroProductPreview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="relative mx-auto w-full max-w-md lg:max-w-lg"
    >
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="relative rounded-3xl border border-white/[0.08] bg-white/[0.02] p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_24px_64px_-12px_rgba(0,0,0,0.5)] backdrop-blur-xl"
      >
        <div className="absolute -inset-px rounded-3xl bg-gradient-to-br from-violet-500/10 via-transparent to-blue-500/10 opacity-80" />
        <div className="relative overflow-hidden rounded-2xl bg-white shadow-2xl">
          <ResumePreview
            template="modern"
            sections={sampleSections}
            color="#6366f1"
            scale={0.45}
          />
        </div>

        {/* ATS Score Badge - Animated counter 60 → 94 */}
        <motion.div
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 1, type: "spring", stiffness: 200 }}
          className="absolute -left-2 bottom-16 flex items-center gap-2.5 rounded-2xl border border-white/[0.08] bg-[#0B1120]/95 px-3 py-2 shadow-glow backdrop-blur-md sm:-left-4 sm:bottom-20 sm:px-4 sm:py-2.5"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20">
            <Check className="h-4 w-4 text-emerald-400" />
          </div>
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
              ATS Score
            </p>
            <p className="text-lg font-bold text-emerald-400">
              <AnimatedCounter from={60} value={94} duration={1.8} />
            </p>
          </div>
        </motion.div>

        {/* AI Suggestions Panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.2, duration: 0.4 }}
          className="absolute -right-2 top-6 w-48 rounded-2xl border border-white/[0.08] bg-[#0B1120]/95 p-3 shadow-glow backdrop-blur-md sm:-right-4 sm:top-8 sm:w-56 sm:p-4"
        >
          <div className="mb-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-violet-400" />
            <span className="text-xs font-semibold text-white">AI Suggestions</span>
          </div>
          <ul className="space-y-2">
            {aiSuggestions.map((s, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.4 + i * 0.1 }}
                className="flex items-start gap-2 text-[11px] text-slate-400"
              >
                <Lightbulb className="mt-0.5 h-3 w-3 flex-shrink-0 text-violet-400" />
                {s}
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
