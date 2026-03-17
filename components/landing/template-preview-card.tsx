"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { ArrowRight, Eye } from "lucide-react";
import { sampleSections } from "@/lib/sample-resume";
import { templates, type TemplateName } from "@/components/resume/templates";
import { templateRegistry } from "@/components/resume/templates";
import { cn } from "@/lib/utils";

interface TemplatePreviewCardProps {
  templateId: string;
  onPreview?: (templateId: string) => void;
}

export function TemplatePreviewCard({ templateId, onPreview }: TemplatePreviewCardProps) {
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";
  const info = templateRegistry.find((t) => t.id === templateId);
  const TemplateComponent = templates[templateId as TemplateName];

  if (!info || !TemplateComponent) return null;

  const previewScale = 0.22;
  const useHref = isAuthenticated ? `/builder?template=${templateId}` : `/signup?template=${templateId}`;

  return (
    <div
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02]",
        "transition-all duration-300 ease-out",
        "hover:border-white/[0.12] hover:shadow-[0_8px_30px_-12px_rgba(99,102,241,0.25)] hover:-translate-y-1"
      )}
    >
      {/* Preview area - no click to open modal; stays in grid */}
      <div className="relative flex h-[240px] items-center justify-center overflow-hidden bg-dark-100">
        <div
          style={{
            width: 794,
            height: 1123,
            transform: `scale(${previewScale})`,
            transformOrigin: "center center",
          }}
        >
          <TemplateComponent sections={sampleSections} color={info.accent} />
        </div>

        {/* Hover overlay with action buttons */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/0 transition-all duration-300 group-hover:bg-black/60 group-hover:backdrop-blur-[2px]">
          <Link
            href={useHref}
            onClick={(e) => e.stopPropagation()}
            className={cn(
              "flex translate-y-4 items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold shadow-lg",
              "opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100",
              "bg-gradient-to-r from-brand-600 to-brand-500 text-white",
              "hover:from-brand-500 hover:to-brand-400 hover:shadow-glow"
            )}
          >
            Use Template <ArrowRight className="h-4 w-4" />
          </Link>
          {onPreview && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onPreview(templateId);
              }}
              className={cn(
                "flex translate-y-4 items-center gap-2 rounded-xl border-2 border-white/30 bg-white/10 px-4 py-2 text-sm font-semibold text-white",
                "opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100",
                "hover:bg-white/20 hover:border-white/50"
              )}
            >
              <Eye className="h-4 w-4" /> Preview
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-white/[0.06] px-4 py-3">
        <div>
          <h3 className="text-sm font-bold text-white">{info.name}</h3>
          <span className="mt-0.5 block text-[10px] font-medium capitalize text-slate-500">
            {info.category}
          </span>
        </div>
        <Link
          href={useHref}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-xl border-2 border-brand-500/30 bg-brand-500/15 px-4 py-2 text-xs font-bold text-brand-300",
            "transition-all duration-300 hover:bg-brand-500 hover:text-white hover:border-brand-500 hover:shadow-glow"
          )}
        >
          Use <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
