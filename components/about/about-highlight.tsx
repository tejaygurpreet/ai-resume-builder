"use client";

import { motion } from "framer-motion";
import { Sparkles, Target, Zap } from "lucide-react";

const TAGS = ["AI resume drafting", "ATS keyword alignment", "Fast exports"];

export function AboutHighlight() {
  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-8 shadow-glass backdrop-blur-sm">
        <div className="space-y-5">
          <div className="flex flex-wrap gap-2">
            {TAGS.map((tag, i) => (
              <motion.span
                key={tag}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="rounded-full border border-brand-500/25 bg-brand-500/10 px-3 py-1.5 text-xs font-medium text-brand-200"
              >
                {tag}
              </motion.span>
            ))}
          </div>
          <p className="text-sm leading-relaxed text-slate-300">
            OptimaCV blends <span className="font-semibold text-white">generative AI</span> with{" "}
            <span className="font-semibold text-white">ATS-aware structure</span> so your resume reads well to humans
            and parses cleanly in applicant tracking systems — in a fraction of the time of editing from scratch.
          </p>
          <ul className="space-y-3 text-sm text-slate-400">
            <li className="flex items-start gap-2">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-violet-400" />
              Smart bullets and summaries tuned for real roles, not filler phrases.
            </li>
            <li className="flex items-start gap-2">
              <Target className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
              Keyword and format guidance so your file stays scannable.
            </li>
            <li className="flex items-start gap-2">
              <Zap className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
              Streamlined workflow: edit once, preview instantly, export when you&apos;re ready.
            </li>
          </ul>
        </div>
        <div className="pointer-events-none absolute -right-4 -top-4 h-24 w-24 rounded-full bg-brand-500/20 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-6 -left-6 h-32 w-32 rounded-full bg-cyan-500/15 blur-3xl" />
      </div>
    </motion.div>
  );
}
